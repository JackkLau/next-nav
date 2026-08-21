import { and, asc, desc, eq, gt, isNull, notInArray, or } from 'drizzle-orm'
import {
  toNavigationItem,
  type NavigationItem,
} from '@/data/navigation'
import type { CategoryKey, SiteRecord } from '@/data/site-model'
import { getDatabase, sites, toSiteRecord } from '@/db'
import {
  decodeSiteCursor,
  encodeSiteCursor,
  type SiteCursor,
} from './site-pagination'

export const DEFAULT_SITE_PAGE_SIZE = 24
export const MAX_SITE_PAGE_SIZE = 48
const MAX_EXCLUDED_SITE_IDS = 200
const siteIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

interface ListPublishedSitesOptions {
  category?: CategoryKey
  cursor?: SiteCursor
  excludeSlugs?: string[]
  limit?: number
  locale?: string
}

interface PublishedSitePage {
  items: NavigationItem[]
  hasMore: boolean
  nextCursor: string | null
}

function cursorFilter(cursor: SiteCursor) {
  const sameNameAfterSlug = and(
    eq(sites.name, cursor.name),
    gt(sites.slug, cursor.slug),
  )
  const afterName = or(gt(sites.name, cursor.name), sameNameAfterSlug)

  if (cursor.favorite) {
    return or(
      and(eq(sites.favorite, true), afterName),
      eq(sites.favorite, false),
    )
  }

  return and(eq(sites.favorite, false), afterName)
}

export function normalizeSitePageLimit(value: string | null) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) return DEFAULT_SITE_PAGE_SIZE
  return Math.min(parsed, MAX_SITE_PAGE_SIZE)
}

export function decodeOptionalSiteCursor(value: string | null) {
  if (!value) return undefined
  return decodeSiteCursor(value)
}

export function parseExcludedSiteIds(value: string | null) {
  if (!value) return []

  const ids = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  if (
    ids.length > MAX_EXCLUDED_SITE_IDS ||
    ids.some((item) => !siteIdPattern.test(item))
  ) {
    return undefined
  }

  return Array.from(new Set(ids))
}

export async function listPublishedSitesFromDatabase({
  category,
  cursor,
  excludeSlugs = [],
  limit = DEFAULT_SITE_PAGE_SIZE,
  locale,
}: ListPublishedSitesOptions): Promise<PublishedSitePage> {
  const database = getDatabase()
  const rows = await database.query.sites.findMany({
    where: and(
      eq(sites.status, 'published'),
      isNull(sites.removedAt),
      category ? eq(sites.category, category) : undefined,
      excludeSlugs.length ? notInArray(sites.slug, excludeSlugs) : undefined,
      cursor ? cursorFilter(cursor) : undefined,
    ),
    orderBy: [desc(sites.favorite), asc(sites.name), asc(sites.slug)],
    limit: limit + 1,
  })

  const pageRows = rows.slice(0, limit)
  const lastRow = pageRows.at(-1)

  return {
    items: pageRows.map((row) => toNavigationItem(toSiteRecord(row), locale)),
    hasMore: rows.length > limit,
    nextCursor: lastRow
      ? encodeSiteCursor({
          favorite: lastRow.favorite,
          name: lastRow.name,
          slug: lastRow.slug,
        })
      : null,
  }
}

export async function findPublishedSiteFromDatabase(
  slug: string,
  locale?: string,
): Promise<
  | {
      siteRecord: SiteRecord
      navItem: NavigationItem
    }
  | undefined
> {
  if (!process.env.DATABASE_URL) return undefined

  try {
    const row = await getDatabase().query.sites.findFirst({
      where: and(
        eq(sites.slug, slug),
        eq(sites.status, 'published'),
        isNull(sites.removedAt),
      ),
    })

    if (!row) return undefined

    const siteRecord = toSiteRecord(row)
    return {
      siteRecord,
      navItem: toNavigationItem(siteRecord, locale),
    }
  } catch (error) {
    console.error(
      'Database site lookup unavailable:',
      error instanceof Error ? error.message : 'Unknown database error',
    )
    return undefined
  }
}
