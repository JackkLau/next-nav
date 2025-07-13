import { MetadataRoute } from 'next'
import { navigationData, CategoryType } from '@/data/navigation'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.SITE_URL || 'https://loverezhao.top'
  
  // 静态页面
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
  ]

  // 分类页面
  const categoryPages = Object.values(CategoryType).map((category) => ({
    url: `${baseUrl}/category/${encodeURIComponent(category)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // 详情页面（基于导航数据）
  const detailPages = navigationData.map((item) => ({
    url: `${baseUrl}/${item.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // 合并所有页面
  return [...staticPages, ...categoryPages, ...detailPages]
} 