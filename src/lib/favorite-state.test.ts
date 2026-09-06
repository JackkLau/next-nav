import assert from 'node:assert/strict'
import test from 'node:test'
import { toggleFavoriteId } from './favorite-state'

test('adds a new favorite without disturbing the existing order', () => {
  assert.deepEqual(toggleFavoriteId(['github'], 'figma'), {
    ids: ['github', 'figma'],
    isFavorite: true,
  })
})

test('removes an existing favorite and reports the resulting state', () => {
  assert.deepEqual(toggleFavoriteId(['github', 'figma'], 'github'), {
    ids: ['figma'],
    isFavorite: false,
  })
})
