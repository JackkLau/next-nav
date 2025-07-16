import { MetadataRoute } from 'next'
import { navigationData, CategoryNameMapping } from '@/data/navigation'

const locales = ['en', 'zh-CN', 'zh-TW']
const defaultLocale = 'en'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.SITE_URL || 'https://loverezhao.top'

  // 多语言静态页面
  const staticPages = locales.map(locale => ({
    url: locale === defaultLocale ? baseUrl : `${baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }))

  // 多语言分类页面
  const categoryPages = locales.flatMap(locale =>
    Object.keys(CategoryNameMapping).map(category => ({
      url: locale === defaultLocale
        ? `${baseUrl}/category/${category}`
        : `${baseUrl}/${locale}/category/${category}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  )

  // 多语言详情页面
  const detailPages = locales.flatMap(locale =>
    navigationData.map(item => ({
      url: locale === defaultLocale
        ? `${baseUrl}/${item.id}`
        : `${baseUrl}/${locale}/${item.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  )

  // 合并所有页面
  return [...staticPages, ...categoryPages, ...detailPages]
} 