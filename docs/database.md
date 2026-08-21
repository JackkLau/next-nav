# Supabase PostgreSQL 数据库基建

项目数据库已选定 Supabase PostgreSQL，并使用 Drizzle ORM 管理 schema、迁移与查询。配置 `DATABASE_URL` 后，受保护的工具提交接口可以写入 `sites` 表中的 published 记录，分类页翻页可以从数据库读取 published 记录。

## 当前运行边界

首屏页面、sitemap 和旧 URL 重定向仍从 `src/data/sites.json` 读取，默认导出的 `siteRepository` 也仍是 JSON 适配器。分类页首屏渲染 JSON 前 24 条；用户继续加载更多时调用 `GET /api/sites` 从数据库读取。只有运行分页接口、详情页 DB 兜底、`POST /api/sites/submit`、JSON 导入脚本或错误密码限流逻辑时才需要 `DATABASE_URL`。

`createSupabaseSiteRepository(databaseUrl)` 是只读 PostgreSQL 仓储适配器。当前仍保留 JSON 首屏，后续如需全量切库，再把默认仓储切到 Supabase。

## 连接配置

从 Supabase Dashboard 的 **Connect** 面板复制完整 URI，并只保存在 `.env.local` 或部署平台的加密环境变量中。连接串包含数据库密码，不得提交到 Git，也不要使用 `NEXT_PUBLIC_` 前缀。

```dotenv
# Vercel/serverless 运行时：Supavisor transaction pooler，端口 6543
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:6543/postgres

# Drizzle 迁移：优先使用 direct connection；IPv4 环境可使用 session pooler，端口 5432
DIRECT_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
```

连接串中的 `PROJECT_REF`、`REGION` 和 `PASSWORD` 只是占位符，应整体替换为 Dashboard 提供的 URI。密码包含特殊字符时，以 Dashboard 生成的已编码 URI 为准。

应用查询使用 `DATABASE_URL`。Supavisor transaction mode 不支持 prepared statements，所以 PostgreSQL 驱动固定设置为 `prepare: false`。Drizzle Kit 优先读取 `DIRECT_URL`；若未设置，才回退到 `DATABASE_URL`。迁移更适合 direct connection，因为它提供完整会话语义；本机或 CI 无法访问 IPv6 direct endpoint 时，可改用 Supavisor session mode URI。

## 代码结构

- `drizzle.config.ts`：加载 `.env.local`，配置 PostgreSQL 方言和迁移连接；
- `src/db/schema.ts`：`sites` 与工具提交限流表、PostgreSQL enum、`jsonb`、软移除字段、约束、索引和 RLS；
- `src/db/client.ts`：Serverless 运行时复用的小型 PostgreSQL 连接池；
- `src/db/supabase-site-repository.ts`：Supabase PostgreSQL 只读仓储适配器；
- `src/app/api/sites/route.ts`：分类页翻页读取 published 且未移除的数据库记录；
- `src/app/api/sites/submit/route.ts`：受密码保护的站点提交接口；
- `scripts/data/import-sites-to-db.ts`：把 `src/data/sites.json` 幂等 upsert 到数据库；
- `src/db/json-site-repository.ts`：当前生产使用的 JSON 适配器；
- `src/db/site-repository.ts`：页面与存储实现之间的统一接口；
- `drizzle/`：可审查并纳入版本控制的 PostgreSQL SQL 迁移和快照。

`sites.removed_at` 是软移除标记；`GET /api/sites`、JSON 首屏和详情页 DB 兜底都会排除已移除记录。`sites_active_published_category_page_idx` 是给分类页 cursor 分页使用的 partial index，仅覆盖 `status = 'published' and removed_at is null` 的行。

`tool_submission_rate_limits` 由受密码保护的 JSON 生成和站点提交工具使用。部署要求和限流语义见 [`docs/tool-submission.md`](./tool-submission.md)。

## 开发命令

```bash
# 修改 src/db/schema.ts 后生成迁移；不连接远程数据库
pnpm exec drizzle-kit generate --name=describe_change

# 检查迁移快照的一致性；不连接远程数据库
pnpm run db:check

# 打开数据库管理界面；需要 DIRECT_URL 或 DATABASE_URL
pnpm run db:studio

# 人工审查 SQL 并确认目标项目后，应用尚未执行的远程迁移
pnpm run db:migrate

# dry-run，只统计 JSON 数据
pnpm run data:import:db

# 确认 DATABASE_URL 指向正确项目后，把 JSON upsert 到数据库
pnpm run data:import:db -- --write
```

`db:migrate` 和 `db:studio` 会连接真实数据库，其中迁移会修改远程 schema。它们不应放进普通构建命令，也不要在未核对连接目标和 SQL 时运行。

`sites` 位于 Supabase 默认暴露给 Data API 的 `public` schema，因此初始迁移会主动启用 Row Level Security。目前没有创建面向 `anon` 或 `authenticated` 的策略，Data API 默认拒绝访问；应用只通过服务端连接串查询，后续确需浏览器直连时再按最小权限补充策略。

## 上线步骤

1. 在 Supabase 项目中设置 `DIRECT_URL`，审查并执行 `drizzle/0000`、`0001`、`0002` 迁移；
2. 在 Vercel Production 设置 transaction pooler 的 `DATABASE_URL`，不要暴露给浏览器；
3. 本地或 CI 执行 `pnpm run data:import:db -- --write`，把 JSON upsert 到数据库；
4. 核对记录数、分类数、旧 ID、URL、翻译 JSON、发布日期、排序和软移除标记；
5. 部署后检查分类页“加载更多”和一个数据库返回的详情页；
6. 后续如需完全切库，再把页面默认仓储切到 Supabase，并至少保留一个发布周期的 JSON 回退。

参考：[Supabase 连接模式](https://supabase.com/docs/guides/database/connecting-to-postgres)、[Drizzle + Supabase](https://orm.drizzle.team/docs/connect-supabase) 和 [Drizzle migrations](https://orm.drizzle.team/docs/drizzle-kit-migrate)。
