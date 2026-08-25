# Giscus 评论系统

工具详情页已经接入 giscus。评论通过 GitHub 登录发布，存储在公开仓库的 GitHub Discussions 中；应用本身不保存评论数据或 OAuth 密钥。

## GitHub 设置

1. 选择一个公开仓库存放评论。建议使用独立仓库，例如 `JackkLau/next-nav-comments`，避免评论讨论和代码仓库混在一起。
2. 在仓库 `Settings` → `General` → `Features` 中开启 `Discussions`。
3. 安装 [giscus GitHub App](https://github.com/apps/giscus)，并且只授权给评论仓库。
4. 打开 [giscus 配置页](https://giscus.app/zh-CN)，填写仓库并选择一个 Discussion 分类。建议使用 `Announcements` 类型的 `Comments` 分类。
5. 从生成的配置中复制 `data-repo`、`data-repo-id`、`data-category` 和 `data-category-id`。

## 环境变量

将复制的四项公开配置写入本地 `.env.local` 和 Vercel 项目环境变量：

```dotenv
NEXT_PUBLIC_GISCUS_REPO=JackkLau/next-nav-comments
NEXT_PUBLIC_GISCUS_REPO_ID=R_xxxxxxxxx
NEXT_PUBLIC_GISCUS_CATEGORY=Comments
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_xxxxxxxxx
```

这些是 giscus 嵌入组件必须公开的仓库标识，不是 OAuth 密钥。四项配置全部存在并且仓库格式正确时，评论区才会显示。修改 Vercel 环境变量后需要重新部署。

评论使用 `site:<slug>` 作为 Discussion 映射键，因此同一工具的不同语言页面共享评论，域名或页面语言路径变化也不会创建重复讨论。
