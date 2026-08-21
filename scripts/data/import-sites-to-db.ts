import process from 'node:process'
import { loadEnvConfig } from '@next/env'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import rawSites from '../../src/data/sites.json'
import type { SiteRecord } from '../../src/data/site-model'
import { sites, type NewSiteRow } from '../../src/db/schema'

loadEnvConfig(process.cwd())

const shouldWrite = process.argv.includes('--write')
const records = rawSites as SiteRecord[]
const publishedCount = records.filter(
  (site) => site.status === 'published' && !site.removedAt,
).length
const removedCount = records.filter((site) => site.removedAt).length

function toNewSiteRow(site: SiteRecord, sortOrder: number): NewSiteRow {
  return {
    slug: site.slug,
    legacyId: site.legacyId,
    name: site.name,
    url: site.url,
    imgUrl: site.imgUrl,
    category: site.category,
    favorite: site.favorite ?? false,
    description: site.description,
    needVPN: site.needVPN ?? false,
    sourceLocale: site.sourceLocale,
    translations: site.translations,
    status: site.status,
    updatedAt: site.updatedAt,
    removedAt: site.removedAt,
    removalReason: site.removalReason,
    sortOrder,
  }
}

function chunkRows<T>(items: T[], size: number) {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

async function main() {
  if (!shouldWrite) {
    console.log(
      `Prepared ${records.length} JSON site records (${publishedCount} active published, ${removedCount} removed).`,
    )
    console.log(
      'Dry run only. Re-run with --write to upsert into the database.',
    )
    return
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to import sites into the database')
  }

  const client = postgres(databaseUrl, {
    connect_timeout: 10,
    idle_timeout: 20,
    max: 1,
    prepare: false,
  })
  const database = drizzle({ client, schema: { sites } })

  try {
    const rows = records.map((site, index) => toNewSiteRow(site, index))

    for (const chunk of chunkRows(rows, 100)) {
      await database
        .insert(sites)
        .values(chunk)
        .onConflictDoUpdate({
          target: sites.slug,
          set: {
            legacyId: sql`excluded.legacy_id`,
            name: sql`excluded.name`,
            url: sql`excluded.url`,
            imgUrl: sql`excluded.image_url`,
            category: sql`excluded.category`,
            favorite: sql`excluded.favorite`,
            description: sql`excluded.description`,
            needVPN: sql`excluded.need_vpn`,
            sourceLocale: sql`excluded.source_locale`,
            translations: sql`excluded.translations`,
            status: sql`excluded.status`,
            updatedAt: sql`excluded.updated_at`,
            removedAt: sql`coalesce(${sites.removedAt}, excluded.removed_at)`,
            removalReason: sql`coalesce(${sites.removalReason}, excluded.removal_reason)`,
            sortOrder: sql`excluded.sort_order`,
            modifiedAt: sql`now()`,
          },
        })
    }

    console.log(
      `Upserted ${rows.length} JSON site records into the database (${publishedCount} active published, ${removedCount} removed).`,
    )
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
