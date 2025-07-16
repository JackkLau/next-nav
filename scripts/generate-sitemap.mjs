import { writeFileSync } from 'fs';
import { globby } from 'globby';
import prettier from 'prettier';
import nextIntlConfig from '../next-intl.config.js';

(async () => {
  const prettierConfig = await prettier.resolveConfig('./.prettierrc.js');
  const pages = await globby([
    'src/app/**/*.tsx',
    'src/app/**/*.jsx',
    'src/app/**/*.ts',
    'src/app/**/*.js',
    '!src/app/**/_*.tsx',
    '!src/app/**/_*.jsx',
    '!src/app/**/_*.ts',
    '!src/app/**/_*.js',
    '!src/app/**/layout.tsx',
    '!src/app/**/layout.jsx',
    '!src/app/**/loading.tsx',
    '!src/app/**/loading.jsx',
    '!src/app/**/error.tsx',
    '!src/app/**/error.jsx',
    '!src/app/**/not-found.tsx',
    '!src/app/**/not-found.jsx',
  ]);

  const siteUrl = process.env.SITE_URL || 'https://loverezhao.top';
  const locales = nextIntlConfig.locales;
  const defaultLocale = nextIntlConfig.defaultLocale;

  // 导入导航数据
  const { navigationData, CategoryType } = await import('../src/data/navigation.ts');

  // 生成静态页面 URL
  const staticPages = pages.map((page) => {
    const path = page
      .replace('src/app', '')
      .replace(/\.(tsx|jsx|ts|js)$/, '')
      .replace(/\/page$/, '')
      .replace(/\/\(.*?\)/, '') // 移除路由组
      .replace(/\/\[.*?\]/, '') // 移除动态路由参数
      .replace(/\/$/, '') || '/';
    return path;
  });

  // 生成分类页面 URL
  const categoryPages = Object.values(CategoryType).map(category =>
    `/category/${encodeURIComponent(category)}`
  );

  // 生成详情页面 URL（基于导航数据）
  const detailPages = navigationData.map(item =>
    `/${item.id}`
  );

  // 合并所有页面
  const allPages = [...new Set([...staticPages, ...categoryPages, ...detailPages])];

  // 生成多语言 URL
  const localizedPages = [];
  for (const page of allPages) {
    for (const locale of locales) {
      // 首页特殊处理
      if (page === '/') {
        localizedPages.push(locale === defaultLocale ? '/' : `/${locale}`);
      } else {
        localizedPages.push(locale === defaultLocale ? page : `/${locale}${page}`);
      }
    }
  }

  // 生成网站地图 XML
  const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${localizedPages
        .map((page) => {
          const path = page;
          const route = path === '/index' ? '' : path;

          // 根据页面类型设置不同的优先级和更新频率
          let priority = '0.7';
          let changefreq = 'weekly';

          if (path === '/' || locales.some(l => path === `/${l}`)) {
            priority = '1.0';
            changefreq = 'daily';
          } else if (path.includes('/category/')) {
            priority = '0.8';
            changefreq = 'weekly';
          } else if (path.match(/^\/\d+$/)) {
            priority = '0.6';
            changefreq = 'monthly';
          }

          return `
            <url>
              <loc>${siteUrl}${route}</loc>
              <lastmod>${new Date().toISOString()}</lastmod>
              <changefreq>${changefreq}</changefreq>
              <priority>${priority}</priority>
            </url>
          `;
        })
        .join('')}
    </urlset>
  `;

  const formatted = prettier.format(sitemap, {
    ...prettierConfig,
    parser: 'html',
  });

  writeFileSync('public/sitemap.xml', formatted);
  console.log('✅ Sitemap generated successfully!');
})(); 