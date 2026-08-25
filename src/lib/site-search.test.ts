import assert from 'node:assert/strict'
import test from 'node:test'
import type { NavigationItem } from '@/data/navigation'
import {
  normalizeSiteSearchQuery,
  searchNavigationItems,
} from './site-search'

function item(
  id: string,
  name: string,
  overrides: Partial<NavigationItem> = {},
): NavigationItem {
  return {
    id,
    name,
    url: `https://${id}.example.com`,
    category: 'tools',
    categoryKey: 'tools',
    sourceLocale: 'en',
    updatedAt: '2026-08-25',
    ...overrides,
  }
}

test('searches names, descriptions, URLs, and localized categories', () => {
  const items = [
    item('image-editor', 'Pixel Studio', {
      description: 'Edit product photos in the browser',
    }),
    item('developer-community', 'Code Together', {
      url: 'https://community.example.dev/topics',
      category: 'community',
      categoryKey: 'community',
    }),
  ]
  const categories = {
    tools: 'Online Tools',
    community: 'Online Communities',
  }

  assert.deepEqual(
    searchNavigationItems(items, 'product photos', categories).map(
      (result) => result.id,
    ),
    ['image-editor'],
  )
  assert.deepEqual(
    searchNavigationItems(items, 'example.dev', categories).map(
      (result) => result.id,
    ),
    ['developer-community'],
  )
  assert.deepEqual(
    searchNavigationItems(items, 'online communities', categories).map(
      (result) => result.id,
    ),
    ['developer-community'],
  )
})

test('searches translated copy and ignores case and accents', () => {
  const items = [
    item('resume-builder', 'Resume Builder', {
      translations: {
        fr: {
          name: 'Créateur de CV',
          description: 'Créez un CV professionnel',
        },
      },
    }),
  ]

  assert.deepEqual(
    searchNavigationItems(items, 'createur professionnel').map(
      (result) => result.id,
    ),
    ['resume-builder'],
  )
})

test('ranks exact and prefix name matches ahead of description matches', () => {
  const items = [
    item('other', 'Developer Resources', {
      description: 'GitHub documentation and tutorials',
      favorite: true,
    }),
    item('github-actions', 'GitHub Actions'),
    item('github', 'GitHub'),
  ]

  assert.deepEqual(
    searchNavigationItems(items, 'github').map((result) => result.id),
    ['github', 'github-actions', 'other'],
  )
})

test('normalizes whitespace, limits query size, and rejects empty searches', () => {
  assert.equal(normalizeSiteSearchQuery('  image\n editor  '), 'image editor')
  assert.equal(normalizeSiteSearchQuery('x'.repeat(150)).length, 100)
  assert.deepEqual(searchNavigationItems([item('one', 'One')], '   '), [])
})
