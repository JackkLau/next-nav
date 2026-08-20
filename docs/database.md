# Supabase PostgreSQL 数据库基建

项目数据库已选定 Supabase PostgreSQL，并使用 Drizzle ORM 管理 schema、迁移与查询。当前只完成可审查的数据库基建，尚未连接或修改任何远程 Supabase 项目。

## 当前运行边界

线上页面仍从 `src/data/sites.json` 读取，默认导出的 `siteRepository` 也仍是 JSON 适配器。因此没有配置数据库连接串时，本地开发、Vercel 构建和现有线上页面都不会尝试连接 Supabase。

`createSupabaseSiteRepository(databaseUrl)` 是已经就绪的 PostgreSQL 适配器。完成建表、数据导入和结果核对后，才能把页面默认仓储切换到它。

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
- `src/db/schema.ts`：`sites` 与工具提交限流表、PostgreSQL enum、`jsonb`、约束和 RLS；
- `src/db/client.ts`：Serverless 运行时复用的小型 PostgreSQL 连接池；
- `src/db/supabase-site-repository.ts`：Supabase PostgreSQL 只读仓储适配器；
- `src/db/json-site-repository.ts`：当前生产使用的 JSON 适配器；
- `src/db/site-repository.ts`：页面与存储实现之间的统一接口；
- `drizzle/`：可审查并纳入版本控制的 PostgreSQL SQL 迁移和快照。

`tool_submission_rate_limits` 由受密码保护的 JSON 生成工具使用。部署要求和限流语义见 [`docs/tool-submission.md`](./tool-submission.md)。

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
```

`db:migrate` 和 `db:studio` 会连接真实数据库，其中迁移会修改远程 schema。它们不应放进普通构建命令，也不要在未核对连接目标和 SQL 时运行。本次切换没有执行这两个命令。

`sites` 位于 Supabase 默认暴露给 Data API 的 `public` schema，因此初始迁移会主动启用 Row Level Security。目前没有创建面向 `anon` 或 `authenticated` 的策略，Data API 默认拒绝访问；应用只通过服务端连接串查询，后续确需浏览器直连时再按最小权限补充策略。

## 后续启用数据库读取

1. 在 Supabase 项目中设置 `DIRECT_URL`，审查并执行初始迁移；
2. 为现有 `sites.json` 增加幂等导入脚本，以 `slug` 为主键 upsert，并保留 `sort_order`；
3. 核对记录数、分类数、旧 ID、URL、翻译 JSON、发布日期和排序；
4. 在 Vercel 设置 transaction pooler 的 `DATABASE_URL`，不要暴露给浏览器；
5. 用环境开关比较 JSON 和 PostgreSQL 输出，确认 sitemap、详情页和旧 URL 重定向完全一致；
6. 验证通过后再把页面默认仓储切到 Supabase，并至少保留一个发布周期的 JSON 回退。

参考：[Supabase 连接模式](https://supabase.com/docs/guides/database/connecting-to-postgres)、[Drizzle + Supabase](https://orm.drizzle.team/docs/connect-supabase) 和 [Drizzle migrations](https://orm.drizzle.team/docs/drizzle-kit-migrate)。
