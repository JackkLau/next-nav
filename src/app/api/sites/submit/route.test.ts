import assert from 'node:assert/strict'
import test from 'node:test'
import { SiteMetadataError } from '@/lib/site-metadata'
import { confirmSiteUnavailable, POST } from './route'

const TEST_PASSWORD = 'correct-test-password'

function createRequest(password: string, site: Record<string, unknown> = {}) {
  return new Request('http://localhost/api/sites/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      password,
      site: {
        slug: 'example',
        name: 'Example',
        url: 'https://example.com',
        category: 'common',
        favorite: false,
        needVPN: false,
        ...site,
      },
    }),
  })
}

function createCheckRequest(password: string, url: unknown) {
  return new Request('http://localhost/api/sites/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, action: 'check', url }),
  })
}

function createRemoveRequest(
  password: string,
  existingSlug: unknown = 'example',
  url: unknown = 'https://example.com',
) {
  return new Request('http://localhost/api/sites/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, action: 'remove', existingSlug, url }),
  })
}

async function withEnvironment(
  environment: Record<string, string | undefined>,
  run: () => Promise<void>,
) {
  const previous = Object.fromEntries(
    Object.keys(environment).map((key) => [key, process.env[key]]),
  )

  for (const [key, value] of Object.entries(environment)) {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }

  try {
    await run()
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
  }
}

test('site submission rejects invalid generated data before requiring a database', async () => {
  await withEnvironment(
    {
      TOOL_SUBMISSION_PASSWORD: TEST_PASSWORD,
      DATABASE_URL: undefined,
    },
    async () => {
      const response = await POST(
        createRequest(TEST_PASSWORD, { slug: 'Bad Slug' }),
      )
      const body = (await response.json()) as { error?: string }

      assert.equal(response.status, 400)
      assert.equal(body.error, 'INVALID_SITE')
    },
  )
})

test('site submission requires a database after the password and payload are valid', async () => {
  await withEnvironment(
    {
      TOOL_SUBMISSION_PASSWORD: TEST_PASSWORD,
      DATABASE_URL: undefined,
    },
    async () => {
      const response = await POST(createRequest(TEST_PASSWORD))
      const body = (await response.json()) as { error?: string }

      assert.equal(response.status, 503)
      assert.equal(body.error, 'SERVICE_NOT_CONFIGURED')
    },
  )
})

test('site duplicate checks validate the URL before requiring a database', async () => {
  await withEnvironment(
    {
      TOOL_SUBMISSION_PASSWORD: TEST_PASSWORD,
      DATABASE_URL: undefined,
    },
    async () => {
      const response = await POST(
        createCheckRequest(TEST_PASSWORD, 'not-a-public-url'),
      )
      const body = (await response.json()) as { error?: string }

      assert.equal(response.status, 400)
      assert.equal(body.error, 'INVALID_SITE')
    },
  )
})

test('site duplicate checks require the configured database for a complete result', async () => {
  await withEnvironment(
    {
      TOOL_SUBMISSION_PASSWORD: TEST_PASSWORD,
      DATABASE_URL: undefined,
    },
    async () => {
      const response = await POST(
        createCheckRequest(TEST_PASSWORD, 'https://example.com'),
      )
      const body = (await response.json()) as { error?: string }

      assert.equal(response.status, 503)
      assert.equal(body.error, 'SERVICE_NOT_CONFIGURED')
    },
  )
})

test('site removal validates its target before requiring a database', async () => {
  await withEnvironment(
    {
      TOOL_SUBMISSION_PASSWORD: TEST_PASSWORD,
      DATABASE_URL: undefined,
    },
    async () => {
      const missingSlug = await POST(createRemoveRequest(TEST_PASSWORD, null))
      const invalidUrl = await POST(
        createRemoveRequest(TEST_PASSWORD, 'example', 'not-a-url'),
      )

      assert.equal(missingSlug.status, 400)
      assert.equal((await missingSlug.json()).error, 'INVALID_REQUEST')
      assert.equal(invalidUrl.status, 400)
      assert.equal((await invalidUrl.json()).error, 'INVALID_SITE')
    },
  )
})

test('authorized site removal requires the configured database', async () => {
  await withEnvironment(
    {
      TOOL_SUBMISSION_PASSWORD: TEST_PASSWORD,
      DATABASE_URL: undefined,
    },
    async () => {
      const response = await POST(createRemoveRequest(TEST_PASSWORD))
      const body = (await response.json()) as { error?: string }

      assert.equal(response.status, 503)
      assert.equal(body.error, 'SERVICE_NOT_CONFIGURED')
    },
  )
})

test('site removal rechecks availability and only accepts known access failures', async () => {
  assert.equal(
    await confirmSiteUnavailable('https://example.com', async () => ({
      title: 'Example',
      description: '',
      favicon: '',
    })),
    false,
  )
  assert.equal(
    await confirmSiteUnavailable('https://example.com', async () => {
      throw new SiteMetadataError('The site returned HTTP 404')
    }),
    true,
  )
  await assert.rejects(
    confirmSiteUnavailable('https://example.com', async () => {
      throw new Error('Unexpected implementation failure')
    }),
    /Unexpected implementation failure/,
  )
})

test('site submission only accepts editable availability states', async () => {
  await withEnvironment(
    {
      TOOL_SUBMISSION_PASSWORD: TEST_PASSWORD,
      DATABASE_URL: undefined,
    },
    async () => {
      const response = await POST(
        createRequest(TEST_PASSWORD, { status: 'draft' }),
      )
      const body = (await response.json()) as { error?: string }

      assert.equal(response.status, 400)
      assert.equal(body.error, 'INVALID_SITE')
    },
  )
})

test('site submission keeps invalid-password attempts behind the shared limiter', async () => {
  await withEnvironment(
    {
      TOOL_SUBMISSION_PASSWORD: TEST_PASSWORD,
      DATABASE_URL: undefined,
    },
    async () => {
      const response = await POST(createRequest('wrong-password'))
      const body = (await response.json()) as { error?: string }

      assert.equal(response.status, 503)
      assert.equal(body.error, 'SERVICE_NOT_CONFIGURED')
    },
  )
})
