# Tool JSON 提交页

`/[locale]/tools/nav-gen` 用于检查目标网站是否已经收录、读取新网站元数据，并生成可审核的导航 JSON。生成后可以选择复制 JSON 进入现有数据工作流，也可以通过受保护的 `POST /api/sites/submit` 创建或更新 `sites` 数据库记录。

输入正确密码和 URL 后，页面会先合并数据库记录与版本化 JSON 快照检查重复。URL 比较会忽略 `http/https`、`www`、查询参数、锚点和末尾斜杠，但保留路径，避免把同一域名下的不同资源误判为重复。找到现有网站时会加载其当前字段进入编辑表单；保存时必须携带原始 `slug` 才能更新，普通重复提交仍返回 `409 DUPLICATE_SITE`，不会静默覆盖。

“网站可用”开启时保存为 `published`，关闭时保存为 `archived` 并从公开目录隐藏；重新开启会清除已有的软移除标记并恢复发布。如果命中的是只存在于 JSON 快照中的记录，编辑保存会在数据库创建同 `slug` 的覆盖记录，不会直接修改版本化 JSON。成功保存会立即失效发布目录缓存，变更随后可反映到首页、分类、详情、相关推荐和 sitemap。

## 部署配置

在本地 `.env.local` 和 Vercel 的加密环境变量中设置：

```dotenv
# 仅服务端使用，变量名不得添加 NEXT_PUBLIC_ 前缀
TOOL_SUBMISSION_PASSWORD=replace-with-a-long-random-password

# Supabase Supavisor transaction pooler（6543）
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:6543/postgres
```

提交密码只发送给同源的服务端接口。`POST /api/meta` 校验后抓取目标网站元数据；`POST /api/sites/submit` 校验后执行重复检查或保存变更。正确密码可以无限次调用，并且不会访问限流数据库。不要把密码提交到 Git，也不要放进任何 `NEXT_PUBLIC_*` 变量。

部署前还需人工审查并执行 `drizzle/` 中尚未应用的迁移：

```bash
pnpm run db:check
pnpm run db:migrate
```

`db:migrate` 会修改 `DIRECT_URL`（优先）或 `DATABASE_URL` 所指向的真实数据库，执行前必须确认项目和连接目标。

## 限流规则

- 正确密码不计数，可以无限次调用，也不依赖 `DATABASE_URL`；
- 只有错误密码尝试才按 Vercel 提供的客户端 IP 计数；
- 第 10 次错误尝试仍返回 `401`，并从该次尝试开始进入完整的 60 秒冷却；
- 冷却期内的错误密码返回 HTTP `429` 和 `Retry-After`，且不会延长冷却；正确密码仍可立即使用；
- 数据库只存储由服务端密钥 HMAC 生成的客户端标识，不存储原始 IP；
- 计数使用 PostgreSQL 原子 upsert，多实例和 Serverless 并发下共用同一限制。

限流表启用了 RLS，且不提供 `anon`/`authenticated` 策略。只有错误密码尝试会通过服务端 `DATABASE_URL` 访问该表。

## 接口约定

```http
POST /api/meta
Content-Type: application/json

{"password":"...","url":"https://example.com"}
```

接口拒绝私有网络地址、非 HTTP(S) 协议、带账号信息的 URL、超大或非 HTML 响应，并逐跳验证重定向，以降低服务端请求伪造风险。接口响应不缓存；旧的公开 `GET /api/meta` 不再可用。

```http
POST /api/sites/submit
Content-Type: application/json

{
  "password": "...",
  "action": "check",
  "url": "https://example.com"
}
```

检查结果用 `duplicate` 表示是否重复；命中时同时返回完整的可编辑 `site` 和 `source`（`database` 或 `snapshot`）。密码始终只在服务端校验，不会放入 URL 或浏览器缓存。

```http
POST /api/sites/submit
Content-Type: application/json

{
  "password": "...",
  "action": "save",
  "existingSlug": "example",
  "site": {
    "slug": "example",
    "name": "Example",
    "url": "https://example.com",
    "category": "common",
    "favorite": false,
    "description": "Example description",
    "needVPN": false,
    "status": "published"
  }
}
```

新建时省略 `existingSlug`；编辑现有网站时必须传入检查接口返回的原始 `slug`。提交接口拒绝非 HTTP(S) URL 和带凭据的 URL，并在写库前再次检查重复 `slug` 和 URL；发布可用网站时还会验证目标为公网地址。服务端只接受 `published` 或 `archived`，并强制写入当天 `updatedAt`。现有记录的永久 `slug`、原始语言和翻译数据会保留。
