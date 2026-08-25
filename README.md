# Navigation To Value

## 项目简介
Navigation To Value 是一个基于 Next.js 的英文导航站，主要面向海外用户，按分类整理实用网站、在线工具、社区和数字资源。

## 项目地址
[价值导航](https://loverezhao.top/)
欢迎观摩，并留下您宝贵的意见。

## 项目部署
本项目通过 vercel 进行部署，您可以 fork 本项目后，通过vercel进行一键部署。  
链接访问：https://vercel.com/

## 本地开发

```bash
pnpm install --frozen-lockfile
pnpm run dev
```

提交前运行：

```bash
pnpm run check
pnpm test
pnpm run lint
pnpm run seo:verify
```

`seo:verify` 会先创建全新的生产构建，再启动本地生产服务器检查 sitemap、canonical、重定向、noindex 和 404 行为。

## 数据维护

Supabase PostgreSQL 是线上发布目录的主要数据源，`src/data/sites.json` 保留为版本化快照和数据库不可用时的完整回退。项目提供数据格式校验、稳定 slug、旧数字 URL 重定向、飞书多维表格导入，以及主分支 JSON 变更自动同步数据库的 GitHub Actions 工作流。

字段说明、飞书配置和发布流程见 [导航数据维护工作流](./docs/data-workflow.md)。

## 评论系统

工具详情页支持通过 GitHub 登录的 giscus 评论区。GitHub Discussions、giscus App 和环境变量配置见 [Giscus 评论系统](./docs/giscus-comments.md)。

## 支持与反馈
如果您在使用过程中遇到任何问题或有任何建议，欢迎通过以下方式与我们联系：  
vx: xiaoke_edit

还可以关注我的公众号，发现更多内容：  
![](./public/qrcode.png)


喜欢ben的话，欢迎star支持一下！你的支持是我最大的动力！
