import assert from 'node:assert/strict'
import test from 'node:test'
import { buildSiteIconSources, siteIconInitials } from './site-icon'

test('uses a configured HTTPS icon before the hostname fallback', () => {
  assert.deepEqual(
    buildSiteIconSources(
      'https://cdn.example.com/icon.png',
      'https://www.example.com/path',
    ),
    [
      'https://cdn.example.com/icon.png',
      'https://icons.duckduckgo.com/ip3/www.example.com.ico',
    ],
  )
})

test('skips mixed-content icons and still provides a secure fallback', () => {
  assert.deepEqual(
    buildSiteIconSources('http://example.com/favicon.ico', 'http://example.com'),
    ['https://icons.duckduckgo.com/ip3/example.com.ico'],
  )
})

test('creates readable initials when every image source fails', () => {
  assert.equal(siteIconInitials('GitHub Actions'), 'GA')
  assert.equal(siteIconInitials('Figma'), 'FI')
})
