import assert from 'node:assert/strict'
import test from 'node:test'
import type { NavigationItem } from '@/data/navigation'
import {
  decodeSiteCursor,
  paginateNavigationItems,
  type SiteCursor,
} from './site-pagination'

function createItem(index: number): NavigationItem {
  const id = `site-${String(index).padStart(3, '0')}`
  return {
    id,
    name: `Site ${String(index).padStart(3, '0')}`,
    url: `https://example.com/${index}`,
    category: 'tools',
    categoryKey: 'tools',
    favorite: index % 17 === 0,
    sourceLocale: 'en',
    updatedAt: '2026-08-24',
  }
}

test('cursor pagination returns more than 200 sites without duplicates or omissions', () => {
  const input = Array.from({ length: 325 }, (_, index) => createItem(index))
  const visitedIds: string[] = []
  let cursor: SiteCursor | undefined

  for (let pageNumber = 0; pageNumber < 20; pageNumber += 1) {
    const page = paginateNavigationItems(input, cursor, 24)
    visitedIds.push(...page.items.map((item) => item.id))

    if (!page.hasMore) {
      assert.equal(page.nextCursor, null)
      break
    }

    assert.ok(page.nextCursor)
    cursor = decodeSiteCursor(page.nextCursor)
    assert.ok(cursor)
  }

  assert.equal(visitedIds.length, input.length)
  assert.equal(new Set(visitedIds).size, input.length)
  assert.deepEqual(
    new Set(visitedIds),
    new Set(input.map((item) => item.id)),
  )
})

test('cursor pagination uses slug as a stable tiebreaker for equal names', () => {
  const items = ['charlie', 'alpha', 'bravo'].map((id) => ({
    ...createItem(1),
    id,
    name: 'Same name',
    favorite: false,
  }))

  const firstPage = paginateNavigationItems(items, undefined, 2)
  assert.deepEqual(firstPage.items.map((item) => item.id), ['alpha', 'bravo'])

  const cursor = decodeSiteCursor(firstPage.nextCursor || '')
  assert.ok(cursor)
  const secondPage = paginateNavigationItems(items, cursor, 2)
  assert.deepEqual(secondPage.items.map((item) => item.id), ['charlie'])
  assert.equal(secondPage.hasMore, false)
})
