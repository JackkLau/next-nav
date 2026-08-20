import type { CategoryKey, SiteRecord, SiteStatus } from '@/data/site-model'

export interface SiteQuery {
  category?: CategoryKey
  status?: SiteStatus
}

/**
 * Storage boundary for navigation records.
 *
 * Database-specific drivers should implement this contract instead of being
 * imported directly by pages or components.
 */
export interface SiteRepository {
  list(query?: SiteQuery): Promise<SiteRecord[]>
  findBySlug(slug: string): Promise<SiteRecord | undefined>
  findByLegacyId(legacyId: string): Promise<SiteRecord | undefined>
}
