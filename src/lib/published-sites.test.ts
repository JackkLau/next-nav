import assert from 'node:assert/strict'
import test from 'node:test'
import type { SiteRecord } from '@/data/site-model'
import {
  mergePublishedSiteRecords,
  shouldReadPublishedSitesFromDatabase,
} from './published-sites'

function site(
  slug: string,
  overrides: Partial<SiteRecord> = {},
): SiteRecord {
  return {
    slug,
    name: slug,
    url: `https://${slug}.example.com`,
    category: 'tools',
    sourceLocale: 'en',
    status: 'published',
    updatedAt: '2026-08-24',
    ...overrides,
  }
}

test('database records override, append, and remove snapshot records by slug', () => {
  const snapshot = [site('kept'), site('updated'), site('removed')]
  const database = [
    site('updated', { name: 'Updated in database' }),
    site('removed', {
      removedAt: '2026-08-24T00:00:00.000Z',
      removalReason: 'Unavailable',
    }),
    site('database-only'),
    site('draft-tombstone', { status: 'draft' }),
  ]

  const merged = mergePublishedSiteRecords(snapshot, database)
  const bySlug = new Map(merged.map((record) => [record.slug, record]))

  assert.equal(bySlug.get('kept')?.name, 'kept')
  assert.equal(bySlug.get('updated')?.name, 'Updated in database')
  assert.equal(bySlug.has('removed'), false)
  assert.equal(bySlug.has('database-only'), true)
  assert.equal(bySlug.has('draft-tombstone'), false)
})

test('production builds use the committed snapshot instead of opening database connections', () => {
  assert.equal(
    shouldReadPublishedSitesFromDatabase(
      'postgresql://configured.example/database',
      'phase-production-build',
    ),
    false,
  )
  assert.equal(
    shouldReadPublishedSitesFromDatabase(
      'postgresql://configured.example/database',
      'phase-production-server',
    ),
    true,
  )
  assert.equal(
    shouldReadPublishedSitesFromDatabase(
      undefined,
      'phase-production-server',
    ),
    false,
  )
})
