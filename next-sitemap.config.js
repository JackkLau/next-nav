/** @type {import('next-sitemap').IConfig} */
module.exports = {
  // 推荐使用不带 www 的版本，更简洁且符合现代趋势
  // 搜索引擎会将 www 和非 www 视为不同域名，需要选择其中一个作为首选
  siteUrl: process.env.SITE_URL || 'https://loverezhao.top',
  
  // 生成 robots.txt 文件
  generateRobotsTxt: true,
  
  // 网站地图配置
  sitemapSize: 7000, // 每个网站地图文件的最大 URL 数量
  generateIndexSitemap: true, // 生成索引网站地图（推荐开启）
  
  // 默认优先级和更新频率
  priority: 0.7, // 默认优先级（0.0-1.0）
  changefreq: 'weekly', // 默认更新频率
  
  // 排除的路径
  exclude: [
    '/api/*', // 排除 API 路由
    '/_next/*', // 排除 Next.js 内部文件
    '/admin/*', // 排除管理页面（如果有）
    '*.json', // 排除 JSON 文件
  ],
  
  // 自定义配置
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
        ],
      },
    ],
    additionalSitemaps: [
      'https://loverezhao.top/sitemap.xml',
    ],
  },
  
  // 自定义转换函数，为不同页面设置不同的优先级和更新频率
  transform: async (config, path) => {
    // 首页最高优先级
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      }
    }
    
    // 分类页面高优先级
    if (path.startsWith('/category/')) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      }
    }
    
    // 详情页面中等优先级（实际路由是 /[slug]，不是 /detail/[slug]）
    if (path.match(/^\/[^\/]+$/) && path !== '/') {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: new Date().toISOString(),
      }
    }
    
    // 其他页面默认配置
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    }
  },
}