/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://loverezhao.top',
  generateRobotsTxt: true, // (optional)
  // ...other options
  priority: 1,
  changefreq: 'daily',
  sitemapSize: 7000,
  generateIndexSitemap: false,
}