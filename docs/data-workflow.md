# 导航数据维护工作流

`src/data/sites.json` 是唯一发布数据源。页面、旧 URL 重定向、分类列表和 sitemap 都从它生成，不再直接编辑 TypeScript 数组。

仓库已接入 Supabase PostgreSQL + Drizzle 的 schema、迁移和仓储接口，但当前线上仍由 JSON 读取，尚未连接、迁移或修改远程 Supabase 数据库。数据库命令和上线切换步骤见 [`docs/database.md`](./database.md)。

需要新增站点时，也可以使用受密码保护的 `/en/tools/nav-gen` 生成草稿 JSON；该工具只生成内容，不直接修改发布数据。部署配置与每分钟 10 次的限流规则见 [`docs/tool-submission.md`](./tool-submission.md)。

## 日常维护

1. 编辑 `src/data/sites.json`，或从飞书多维表格同步。
2. 新记录必须设置永久不变的 `slug`；修改名称或排序时不要修改它。
3. 新记录先使用 `draft`，人工检查描述、分类、图标和目标网址后改为 `published`。
4. 内容发生实质变化时更新 `updatedAt`，格式为 `YYYY-MM-DD`。
5. 运行 `pnpm run data:validate` 和 `pnpm run build`。
6. 提交 Pull Request；CI 会重复执行数据校验、类型检查、lint、生产构建和 SEO 路由验收。

## 字段

| 字段                        |   必填 | 说明                                                |
| --------------------------- | -----: | --------------------------------------------------- |
| `slug`                      |     是 | 永久 URL 标识，只允许小写字母、数字和连字符         |
| `legacyId`                  | 旧数据 | 原数字 URL，用于 308 重定向，不要复用               |
| `name` / `url` / `category` |     是 | 站点基本信息                                        |
| `description`               | 发布时 | 人工审核的原始语言简介                              |
| `sourceLocale`              |     是 | 简介所用语言，新记录默认 `en`                       |
| `translations`              |     否 | `{ "en": { "name": "...", "description": "..." } }` |
| `status`                    |     是 | `draft`、`published` 或 `archived`                  |
| `updatedAt`                 |     是 | 最后一次实质内容更新时间，供 sitemap 使用           |

## 飞书多维表格同步

表格默认列名为：`slug`、`名称`、`网址`、`图标`、`分类`、`推荐`、`描述`、`需梯子`、`原始语言`、`翻译 JSON`、`状态`、`更新时间`。列名不同可用 `FEISHU_FIELD_*` 环境变量覆盖。

在飞书开放平台创建企业自建应用，授予读取多维表格的权限，并将应用加入目标表格的协作者。然后配置 `.env.local` 中的四个必填变量（参考 `.env.example`）。

```bash
# 只读取和规范化，不修改仓库
pnpm run data:sync:feishu

# 确认字段映射后写入，并自动校验
pnpm run data:sync:feishu -- --write
```

同步默认是 dry-run，防止字段映射错误时覆盖数据。密钥只放在本地或 CI Secrets，不提交到 Git。

仓库还提供了 GitHub Actions 工作流 `Sync navigation data from Feishu`。在仓库的 Actions 页面手动运行后，它会：

1. 从飞书读取并规范化数据；
2. 执行数据、类型、lint 和生产构建检查；
3. 仅在 `sites.json` 有变化时新建分支并创建 Pull Request；
4. 不直接写入主分支，仍由维护者审核后合并。

使用前在 GitHub 仓库的 Actions secrets 中添加：`FEISHU_APP_ID`、`FEISHU_APP_SECRET`、`FEISHU_BITABLE_APP_TOKEN` 和 `FEISHU_BITABLE_TABLE_ID`。

## 语言与收录发布

`en` 是默认语言和当前唯一可索引语言。`zh-CN` 与 `zh-TW` 不再是站点路由，旧地址会 308 重定向到对应的英文地址。

历史记录可以保留 `sourceLocale: "zh-CN"` 以准确标记原文，但中文简介不会渲染到英文页面。已有数据中名称和简介都明确为英文、且简介达到基本信息长度的记录，可直接作为英文内容发布。其余详情页要进入英文 sitemap，应先添加经过人工审核的 `translations.en.description`；新收录项目则直接使用英文简介和 `sourceLocale: "en"`。

日文、韩文及欧洲语言界面暂时保留给用户访问，但在完成实质内容本地化之前保持 `noindex`。

## 上线检查

- 在 Vercel 中把 `loverezhao.top` 设为主域名，并让 `www` 与 `nav` 子域名永久重定向到它。
- 设置 `NEXT_PUBLIC_SITE_URL=https://loverezhao.top`。
- 部署后检查 `/robots.txt`、`/sitemap.xml`、`/en`、一个分类页、一个详情页、一个旧数字 URL 和一个退役的中文 URL。
- 在 Search Console 提交 sitemap，并观察 canonical、soft 404 和“已抓取但未编入索引”。
