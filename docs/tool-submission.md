# Tool JSON 提交页

`/[locale]/tools/nav-gen` 用于读取目标网站元数据并生成可审核的导航 JSON。页面不会直接写入 `sites.json` 或数据库，生成结果仍需人工检查后进入现有数据工作流。

## 部署配置

在本地 `.env.local` 和 Vercel 的加密环境变量中设置：

```dotenv
# 仅服务端使用，变量名不得添加 NEXT_PUBLIC_ 前缀
TOOL_SUBMISSION_PASSWORD=replace-with-a-long-random-password

# Supabase Supavisor transaction pooler（6543）
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:6543/postgres
```

提交密码只发送给同源的 `POST /api/meta`，服务端校验后才会抓取目标网站。正确密码可以无限次调用，并且不会访问限流数据库。不要把密码提交到 Git，也不要放进任何 `NEXT_PUBLIC_*` 变量。

部署前还需人工审查并执行 `drizzle/0001_tool_submission_rate_limit.sql`：

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
