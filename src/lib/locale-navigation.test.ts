import assert from 'node:assert/strict'
import test from 'node:test'
import { localizedPathWithQuery } from './locale-navigation'

test('changes the locale while preserving search parameters', () => {
  assert.equal(
    localizedPathWithQuery('/en/search', 'ja', 'q=github&page=2'),
    '/ja/search?q=github&page=2',
  )
})

test('does not add an empty query marker', () => {
  assert.equal(localizedPathWithQuery('/en/github', 'fr', ''), '/fr/github')
})
