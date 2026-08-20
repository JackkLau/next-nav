import assert from 'node:assert/strict'
import test from 'node:test'
import {
  assertPublicHttpUrl,
  createRateLimitKey,
  getClientIdentifier,
  isPublicIpAddress,
  passwordMatches,
  PublicUrlError,
} from './nav-gen-security'

test('password comparison only accepts an exact match', () => {
  assert.equal(passwordMatches('correct horse', 'correct horse'), true)
  assert.equal(passwordMatches('correct Horse', 'correct horse'), false)
  assert.equal(passwordMatches('', 'correct horse'), false)
})

test('client identity prefers the Vercel-controlled forwarding header', () => {
  const headers = new Headers({
    'x-forwarded-for': '198.51.100.20',
    'x-vercel-forwarded-for': '203.0.113.10, 10.0.0.2',
  })

  assert.equal(getClientIdentifier(headers), '203.0.113.10')
})

test('rate-limit keys are stable HMACs and do not reveal the IP', () => {
  const first = createRateLimitKey('203.0.113.10', 'server-secret')
  const second = createRateLimitKey('203.0.113.10', 'server-secret')

  assert.equal(first, second)
  assert.equal(first.length, 64)
  assert.equal(first.includes('203.0.113.10'), false)
  assert.notEqual(first, createRateLimitKey('203.0.113.11', 'server-secret'))
})

test('IP classification rejects private and reserved ranges', () => {
  for (const address of [
    '127.0.0.1',
    '10.0.0.1',
    '169.254.169.254',
    '172.16.0.1',
    '192.168.1.1',
    '::1',
    'fc00::1',
    'fe80::1',
    '::ffff:127.0.0.1',
  ]) {
    assert.equal(isPublicIpAddress(address), false, address)
  }

  assert.equal(isPublicIpAddress('8.8.8.8'), true)
  assert.equal(isPublicIpAddress('2606:4700:4700::1111'), true)
})

test('URL validation rejects credentials, private hosts, and unsafe protocols', async () => {
  for (const input of [
    'file:///etc/passwd',
    'http://localhost:3000',
    'http://127.0.0.1',
    'http://user:password@8.8.8.8',
  ]) {
    await assert.rejects(assertPublicHttpUrl(input), PublicUrlError)
  }

  assert.equal(
    (await assertPublicHttpUrl('https://8.8.8.8')).hostname,
    '8.8.8.8',
  )
})
