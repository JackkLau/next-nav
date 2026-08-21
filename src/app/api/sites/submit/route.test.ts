import assert from 'node:assert/strict'
import test from 'node:test'
import { POST } from './route'

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
