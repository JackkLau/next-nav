import type { MetadataRoute } from 'next'
import {
  CategoryType,
  hasLocalizedContent,
  publishedSiteRecords,
} from '@/data/navigation'
import {
  indexableLocales,
  localizedUrl,
  minimumIndexableLocalizedItems,
} from '@/lib/seo'

function latestDate(dates: string[]) {
  return new Date([...dates].sort().at(-1) || '2025-07-22')
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of indexableLocales) {
    const localizedDetailSites = publishedSiteRecords.filter((site) =>
      hasLocalizedContent(site, locale),
    )

    entries.push({
      url: localizedUrl(locale),
      lastModified: latestDate(publishedSiteRecords.map((site) => site.updatedAt)),
    })

    for (const category of Object.keys(CategoryType)) {
      const categorySites = publishedSiteRecords.filter(
        (site) =>
          site.category === category && hasLocalizedContent(site, locale),
      )
      if (categorySites.length < minimumIndexableLocalizedItems) continue

      entries.push({
        url: localizedUrl(locale, `/category/${category}`),
        lastModified: latestDate(categorySites.map((site) => site.updatedAt)),
      })
    }

    for (const site of localizedDetailSites) {
      entries.push({
        url: localizedUrl(locale, `/${site.slug}`),
        lastModified: new Date(site.updatedAt),
      })
    }
  }

  return entries
}
