# 网站地图配置指南 - 最大化谷歌收录效果

## 概述

本指南详细说明了如何配置自动生成网站地图，以最大化谷歌搜索引擎的收录效果。

## 配置架构

### 1. 主要配置文件

- `next-sitemap.config.js` - next-sitemap 主配置
- `src/app/sitemap.ts` - Next.js 13+ 动态网站地图
- `public/robots.txt` - 搜索引擎爬虫配置
- `scripts/generate-sitemap.js` - 自定义网站地图生成器
- `scripts/validate-sitemap.js` - 网站地图验证工具

### 2. 优先级策略

| 页面类型 | 优先级 | 更新频率 | 说明 |
|---------|--------|----------|------|
| 首页 | 1.0 | daily | 最重要的页面 |
| 分类页面 | 0.8 | weekly | 导航分类页面 |
| 详情页面 | 0.6 | monthly | 具体工具/网站详情 |
| 其他页面 | 0.7 | weekly | 默认配置 |

## 使用方法

### 1. 自动生成（推荐）

```bash
# 构建时自动生成
npm run build

# 手动生成
npm run generate-sitemap

# 验证网站地图
npm run validate-sitemap
```

### 2. 环境变量配置

创建 `.env.local` 文件：

```bash
SITE_URL=https://loverezhao.top
NEXT_PUBLIC_SITE_URL=https://loverezhao.top
```

## 配置详解

### 1. next-sitemap.config.js

```javascript
module.exports = {
  siteUrl: 'https://loverezhao.top',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  generateIndexSitemap: true,
  priority: 0.7,
  changefreq: 'weekly',
  exclude: ['/api/*', '/_next/*'],
  transform: async (config, path) => {
    // 自定义转换逻辑
  }
}
```

### 2. 动态网站地图 (sitemap.ts)

```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  // 基于导航数据动态生成
  return [
    // 静态页面
    // 分类页面
    // 详情页面
  ]
}
```

## 最佳实践

### 1. URL 规范化

- ✅ 使用绝对 URL
- ✅ 使用 HTTPS
- ✅ 移除不必要的参数
- ❌ 避免相对路径
- ❌ 避免循环引用

### 2. 内容策略

- 每个页面只有一个 canonical URL
- 指向最权威、最完整的版本
- 定期更新 lastmod 时间戳

### 3. 性能优化

- 文件大小控制在 50MB 以内
- 使用 gzip 压缩
- 设置适当的缓存头

## 验证和监控

### 1. 本地验证

```bash
npm run validate-sitemap
```

### 2. 在线验证工具

- [Google Search Console](https://search.google.com/search-console)
- [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
- [Screaming Frog](https://www.screamingfrog.co.uk/seo-spider/)

### 3. 监控指标

- 索引状态
- 爬取统计
- 错误报告
- 性能指标

## 常见问题

### 1. 网站地图不更新

**解决方案：**
- 检查构建脚本是否正确执行
- 验证文件权限
- 检查环境变量配置

### 2. 谷歌不收录页面

**解决方案：**
- 确保 robots.txt 配置正确
- 检查 canonical URL 设置
- 验证页面可访问性

### 3. 重复内容问题

**解决方案：**
- 使用 canonical 标签
- 配置 301 重定向
- 统一 URL 格式

## 部署检查清单

- [ ] 网站地图文件存在且可访问
- [ ] robots.txt 配置正确
- [ ] 所有页面都有 canonical URL
- [ ] 重定向配置正确
- [ ] Google Search Console 验证通过
- [ ] 网站地图已提交到搜索引擎

## 性能优化建议

1. **压缩文件**：使用 gzip 压缩网站地图
2. **缓存策略**：设置适当的缓存头
3. **CDN 加速**：使用 CDN 分发网站地图
4. **定期更新**：保持内容新鲜度

## 监控和维护

### 1. 定期检查

- 每周检查网站地图状态
- 每月审查索引报告
- 季度性能评估

### 2. 自动化

- 构建时自动生成
- CI/CD 集成验证
- 自动提交到搜索引擎

通过以上配置，你的网站将获得最佳的搜索引擎收录效果。 