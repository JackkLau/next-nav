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
npm ci
npm run dev
```

提交前运行：

```bash
npm run check
npm run lint
npm run build
npm run seo:verify
```

## 数据维护

导航条目统一维护在 `src/data/sites.json`。项目提供数据格式校验、稳定 slug、旧数字 URL 重定向，以及从飞书多维表格导入并自动创建 Pull Request 的 GitHub Actions 工作流。

字段说明、飞书配置和发布流程见 [导航数据维护工作流](./docs/data-workflow.md)。

## 支持与反馈
如果您在使用过程中遇到任何问题或有任何建议，欢迎通过以下方式与我们联系：  
vx: xiaoke_edit

还可以关注我的公众号，发现更多内容：  
![](./public/qrcode.png)


喜欢ben的话，欢迎star支持一下！你的支持是我最大的动力！
