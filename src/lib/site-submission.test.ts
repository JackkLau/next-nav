import assert from 'node:assert/strict'
import test from 'node:test'
import type { SiteRecord } from '@/data/site-model'
import {
  canonicalSiteUrlKey,
  findDuplicateSite,
  mergeSiteSources,
  resolveSiteSave,
  shouldVerifyPublicSiteUrl,
  siteUrlLookupCandidates,
} from './site-submission'

function site(slug: string, url: string): SiteRecord {
  return {
    slug,
    name: slug,
    url,
    category: 'common',
    sourceLocale: 'en',
    status: 'published',
    updatedAt: '2026-09-06',
  }
}

test('canonical site URLs ignore transport, www, query strings, and trailing slashes', () => {
  const expected = 'example.com/docs'

  assert.equal(canonicalSiteUrlKey('https://www.example.com/docs/'), expected)
  assert.equal(
    canonicalSiteUrlKey('http://example.com/docs?utm_source=test'),
    expected,
  )
  assert.equal(canonicalSiteUrlKey('https://example.com/docs#intro'), expected)
})

test('canonical site URLs keep distinct paths separate', () => {
  assert.notEqual(
    canonicalSiteUrlKey('https://github.com/'),
    canonicalSiteUrlKey('https://github.com/openai/codex'),
  )
})

test('URL lookup candidates cover common equivalent URL spellings', () => {
  const candidates = siteUrlLookupCandidates(
    'https://www.example.com/docs/?utm_source=test',
  )

  assert.ok(
    candidates.includes('https://www.example.com/docs/?utm_source=test'),
  )
  assert.ok(candidates.includes('https://example.com/docs'))
  assert.ok(candidates.includes('http://www.example.com/docs/'))

  const homepageCandidates = siteUrlLookupCandidates('https://example.com/')
  assert.ok(homepageCandidates.includes('https://example.com'))
  assert.ok(homepageCandidates.includes('https://example.com/'))
})

test('duplicate detection matches slug or canonical URL and can exclude the edited site', () => {
  const records = [
    site('example', 'https://example.com/'),
    site('docs', 'https://example.com/docs'),
  ]

  assert.equal(
    findDuplicateSite(records, {
      slug: 'new-slug',
      url: 'http://www.example.com/?ref=nav',
    })?.slug,
    'example',
  )
  assert.equal(
    findDuplicateSite(records, {
      slug: 'docs',
      url: 'https://different.example/',
    })?.slug,
    'docs',
  )
  assert.equal(
    findDuplicateSite(
      records,
      { slug: 'example', url: 'https://example.com/' },
      'example',
    ),
    undefined,
  )
})

test('database records override static records with the same slug', () => {
  const merged = mergeSiteSources(
    [site('example', 'https://old.example.com')],
    [site('example', 'https://new.example.com')],
  )

  assert.equal(merged.length, 1)
  assert.equal(merged[0]?.url, 'https://new.example.com')
})

test('database records take priority when a historical snapshot uses another slug for the same URL', () => {
  const merged = mergeSiteSources(
    [site('historical-slug', 'https://example.com')],
    [site('database-slug', 'https://example.com/')],
  )

  assert.equal(
    findDuplicateSite(merged, { url: 'http://www.example.com' })?.slug,
    'database-slug',
  )
})

test('save resolution only updates an explicit target and rejects conflicts with another site', () => {
  const records = [
    site('example', 'https://example.com'),
    site('docs', 'https://example.com/docs'),
  ]

  const createAttempt = resolveSiteSave(records, {
    slug: 'example',
    url: 'https://new.example.com',
  })
  assert.equal(createAttempt.updateTarget, undefined)
  assert.equal(createAttempt.conflictingSite?.slug, 'example')

  const safeUpdate = resolveSiteSave(
    records,
    { slug: 'changed-by-client', url: 'https://example.com' },
    'example',
  )
  assert.equal(safeUpdate.updateTarget?.slug, 'example')
  assert.equal(safeUpdate.conflictingSite, undefined)

  const conflictingUpdate = resolveSiteSave(
    records,
    { slug: 'example', url: 'https://example.com/docs/?ref=admin' },
    'example',
  )
  assert.equal(conflictingUpdate.conflictingSite?.slug, 'docs')
})

test('an unavailable existing site can be archived even when its unchanged host no longer resolves', () => {
  const existing = site('expired', 'https://expired.example')

  assert.equal(
    shouldVerifyPublicSiteUrl(
      { url: existing.url, status: 'archived' },
      existing,
    ),
    false,
  )
  assert.equal(
    shouldVerifyPublicSiteUrl(
      { url: existing.url, status: 'published' },
      existing,
    ),
    true,
  )
  assert.equal(
    shouldVerifyPublicSiteUrl(
      { url: 'https://replacement.example', status: 'archived' },
      existing,
    ),
    true,
  )
  assert.equal(
    shouldVerifyPublicSiteUrl({
      url: 'https://new.example',
      status: 'archived',
    }),
    true,
  )
})
