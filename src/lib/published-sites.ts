import { unstable_cache } from 'next/cache'
import { PHASE_PRODUCTION_BUILD } from 'next/constants'
import {
  publishedSiteRecords,
  sortNavigationItems,
  toNavigationItem,
  type NavigationItem,
} from '@/data/navigation'
import type { SiteRecord } from '@/data/site-model'
import { getDatabase, toSiteRecord } from '@/db'

export const PUBLISHED_SITES_CACHE_TAG = 'published-sites'
const PUBLISHED_SITES_REVALIDATE_SECONDS = 300

export type PublishedSiteDirectorySource = 'database' | 'json'

export interface PublishedSiteDirectory {
  items: NavigationItem[]
  records: SiteRecord[]
  source: PublishedSiteDirectorySource
}

export function shouldReadPublishedSitesFromDatabase(
  databaseUrl = process.env.DATABASE_URL,
  nextPhase = process.env.NEXT_PHASE,
) {
  return Boolean(databaseUrl) && nextPhase !== PHASE_PRODUCTION_BUILD
}

const listCachedPublishedSiteRecordsFromDatabase = unstable_cache(
  async () => {
    const rows = await getDatabase().query.sites.findMany()

    return rows.map(toSiteRecord)
  },
  ['published-site-directory-v1'],
  {
    revalidate: PUBLISHED_SITES_REVALIDATE_SECONDS,
    tags: [PUBLISHED_SITES_CACHE_TAG],
  },
)

/**
 * Database rows override the committed snapshot by slug. Draft, archived, and
 * removed rows act as tombstones, while DB-only published rows are appended.
 */
export function mergePublishedSiteRecords(
  snapshotRecords: SiteRecord[],
  databaseRecords: SiteRecord[],
) {
  const mergedBySlug = new Map(
    snapshotRecords
      .filter((site) => site.status === 'published' && !site.removedAt)
      .map((site) => [site.slug, site]),
  )

  for (const site of databaseRecords) {
    if (site.status === 'published' && !site.removedAt) {
      mergedBySlug.set(site.slug, site)
    } else {
      mergedBySlug.delete(site.slug)
    }
  }

  return Array.from(mergedBySlug.values())
}

function createDirectory(
  records: SiteRecord[],
  locale: string | undefined,
  source: PublishedSiteDirectorySource,
): PublishedSiteDirectory {
  return {
    records,
    items: sortNavigationItems(
      records.map((site) => toNavigationItem(site, locale)),
    ),
    source,
  }
}

/**
 * Return the public directory from Postgres, with the committed JSON snapshot
 * as a complete fallback when the database is not configured or unavailable.
 */
export async function getPublishedSiteDirectory(
  locale?: string,
): Promise<PublishedSiteDirectory> {
  // Static generation must stay deterministic and must not fan out database
  // connections across Next.js build workers. Runtime requests merge the
  // cached database rows back into this versioned snapshot.
  if (!shouldReadPublishedSitesFromDatabase()) {
    return createDirectory(publishedSiteRecords, locale, 'json')
  }

  try {
    const databaseRecords = await listCachedPublishedSiteRecordsFromDatabase()
    const records = mergePublishedSiteRecords(
      publishedSiteRecords,
      databaseRecords,
    )
    return createDirectory(records, locale, 'database')
  } catch (error) {
    console.error(
      'Published site directory database unavailable; using JSON snapshot:',
      error instanceof Error ? error.message : 'Unknown database error',
    )
    return createDirectory(publishedSiteRecords, locale, 'json')
  }
}

export async function findPublishedSite(
  slug: string,
  locale?: string,
): Promise<
  | {
      siteRecord: SiteRecord
      navItem: NavigationItem
      source: PublishedSiteDirectorySource
    }
  | undefined
> {
  const directory = await getPublishedSiteDirectory(locale)
  const siteRecord = directory.records.find((site) => site.slug === slug)
  if (!siteRecord) return undefined

  return {
    siteRecord,
    navItem: toNavigationItem(siteRecord, locale),
    source: directory.source,
  }
}
