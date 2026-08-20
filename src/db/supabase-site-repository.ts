import type { SiteRecord } from '@/data/site-model'
import { and, asc, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sites, type SiteRow } from './schema'
import type { SiteQuery, SiteRepository } from './site-repository'

function toSiteRecord(row: SiteRow): SiteRecord {
  return {
    slug: row.slug,
    legacyId: row.legacyId ?? undefined,
    name: row.name,
    url: row.url,
    imgUrl: row.imgUrl ?? undefined,
    category: row.category,
    favorite: row.favorite,
    description: row.description ?? undefined,
    needVPN: row.needVPN,
    sourceLocale: row.sourceLocale,
    translations: row.translations ?? undefined,
    status: row.status,
    updatedAt: row.updatedAt,
  }
}

/**
 * Create a repository backed by Supabase Postgres.
 *
 * Use the Supavisor transaction-pooler URL in serverless runtimes. Prepared
 * statements are disabled because transaction mode does not support them.
 */
export function createSupabaseSiteRepository(
  databaseUrl: string,
): SiteRepository {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for the Supabase repository')
  }

  const client = postgres(databaseUrl, { prepare: false })
  const database = drizzle({ client, schema: { sites } })

  return {
    async list(query?: SiteQuery) {
      const rows = await database
        .select()
        .from(sites)
        .where(
          and(
            query?.category ? eq(sites.category, query.category) : undefined,
            query?.status ? eq(sites.status, query.status) : undefined,
          ),
        )
        .orderBy(asc(sites.category), asc(sites.sortOrder), asc(sites.name))

      return rows.map(toSiteRecord)
    },

    async findBySlug(slug: string) {
      const row = await database.query.sites.findFirst({
        where: eq(sites.slug, slug),
      })

      return row ? toSiteRecord(row) : undefined
    },

    async findByLegacyId(legacyId: string) {
      const row = await database.query.sites.findFirst({
        where: eq(sites.legacyId, legacyId),
      })

      return row ? toSiteRecord(row) : undefined
    },
  }
}
