import rawSites from '@/data/sites.json'
import type { SiteRecord } from '@/data/site-model'
import type { SiteQuery, SiteRepository } from './site-repository'

const records = rawSites as SiteRecord[]

/** Current production adapter. It keeps the existing build independent of a DB. */
export const jsonSiteRepository: SiteRepository = {
  async list(query?: SiteQuery) {
    return records.filter(
      (site) =>
        !site.removedAt &&
        (!query?.category || site.category === query.category) &&
        (!query?.status || site.status === query.status),
    )
  },

  async findBySlug(slug: string) {
    return records.find((site) => site.slug === slug)
  },

  async findByLegacyId(legacyId: string) {
    return records.find((site) => site.legacyId === legacyId)
  },
}
