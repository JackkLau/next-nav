import type { MetadataRoute } from 'next'
import { absoluteUrl, isProductionDeployment, siteOrigin } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  if (!isProductionDeployment) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteOrigin,
  }
}
