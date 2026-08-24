# Supabase PostgreSQL 数据库基建

项目数据库已选定 Supabase PostgreSQL，并使用 Drizzle ORM 管理 schema、迁移与查询。配置 `DATABASE_URL` 后，`sites` 表中的 published 记录是首页、分类、详情、相关推荐和 sitemap 共用的线上发布目录。

## 当前运行边界

`src/lib/published-sites.ts` 统一读取发布目录：JSON 提供完整快照，数据库按 slug 覆盖同名记录、追加 DB-only 发布记录，并用 draft、archived 或软移除记录作为下架标记。生产构建只读取已校验的 JSON 快照，避免静态生成 worker 并发占用数据库连接；部署后的请求再合并缓存 5 分钟的数据库结果。数据库未配置或查询失败时返回完整 JSON 快照。所有页面和 `GET /api/sites` 都通过这一层读取，因此首页数量、分类分页、详情、结构化数据与 sitemap 使用同一份内容。旧 URL 重定向继续使用 JSON，保证代理层无需连接数据库。

nav-gen 成功写入后会立即失效发布目录缓存及首页、分类、详情、sitemap 页面缓存。GitHub Actions 或人工导入等外部写入无法直接通知应用，因此依靠最长 5 分钟的自动刷新周期。

`createSupabaseSiteRepository(databaseUrl)` 仍保留为底层只读 PostgreSQL 仓储适配器；页面层统一通过 `published-sites.ts` 访问发布目录，不再自行选择 JSON 或数据库。

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
- `src/lib/published-sites.ts`：数据库优先、JSON 回退的统一发布目录与缓存；
- `src/app/api/sites/route.ts`：基于统一目录的稳定 cursor 分页；
- `src/app/api/sites/submit/route.ts`：受密码保护的站点提交接口；
- `scripts/data/import-sites-to-db.ts`：把 `src/data/sites.json` 幂等 upsert 到数据库；
- `src/db/json-site-repository.ts`：当前生产使用的 JSON 适配器；
- `src/db/site-repository.ts`：页面与存储实现之间的统一接口；
- `drizzle/`：可审查并纳入版本控制的 PostgreSQL SQL 迁移和快照。

`sites.removed_at` 是软移除标记；统一发布目录只查询 `published` 且未移除的数据库记录。`sites_active_published_category_page_idx` 仅覆盖活跃发布记录，继续为分类读取和后续扩大数据量时的数据库分页优化保留。

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

写入使用单一事务：URL 唯一键冲突、连接中断或返回记录数不一致都会回滚，不会留下只导入了前几批的数据。

`db:migrate` 和 `db:studio` 会连接真实数据库，其中迁移会修改远程 schema。它们不应放进普通构建命令，也不要在未核对连接目标和 SQL 时运行。

`sites` 位于 Supabase 默认暴露给 Data API 的 `public` schema，因此初始迁移会主动启用 Row Level Security。目前没有创建面向 `anon` 或 `authenticated` 的策略，Data API 默认拒绝访问；应用只通过服务端连接串查询，后续确需浏览器直连时再按最小权限补充策略。

## 上线步骤

1. 在 Supabase 项目中设置 `DIRECT_URL`，审查并执行 `drizzle/0000`、`0001`、`0002` 迁移；
2. 在 Vercel Production 设置 transaction pooler 的 `DATABASE_URL`，不要暴露给浏览器；
3. 本地执行一次 `pnpm run data:import:db -- --write` 完成初始导入；
4. 核对记录数、分类数、旧 ID、URL、翻译 JSON、发布日期、排序和软移除标记；
5. 部署后检查首页数量、分类页“加载更多”、数据库新增详情页和 sitemap；
6. 在 GitHub Actions Secrets 添加 `DATABASE_URL`；以后 `sites.json` 合并到主分支时由 `Publish site data to database` 工作流自动事务同步；
7. 保留 JSON 快照作为数据库故障回退，并定期检查工作流的导入记录数。

参考：[Supabase 连接模式](https://supabase.com/docs/guides/database/connecting-to-postgres)、[Drizzle + Supabase](https://orm.drizzle.team/docs/connect-supabase) 和 [Drizzle migrations](https://orm.drizzle.team/docs/drizzle-kit-migrate)。
