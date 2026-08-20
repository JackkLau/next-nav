import assert from 'node:assert/strict'
import test from 'node:test'
import { POST } from './route'

const TEST_PASSWORD = 'correct-test-password'

function createRequest(password: string, url = 'file:///etc/passwd') {
  return new Request('http://localhost/api/meta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, url }),
  })
}

test('a correct password bypasses database configuration and rate limiting', async () => {
  const previousPassword = process.env.TOOL_SUBMISSION_PASSWORD
  const previousDatabaseUrl = process.env.DATABASE_URL

  process.env.TOOL_SUBMISSION_PASSWORD = TEST_PASSWORD
  delete process.env.DATABASE_URL

  try {
    const response = await POST(createRequest(TEST_PASSWORD))
    const body = (await response.json()) as {
      error?: string
      unlimited?: boolean
    }

    assert.equal(response.status, 400)
    assert.equal(body.error, 'INVALID_URL')
    assert.equal(body.unlimited, true)
  } finally {
    if (previousPassword === undefined) {
      delete process.env.TOOL_SUBMISSION_PASSWORD
    } else {
      process.env.TOOL_SUBMISSION_PASSWORD = previousPassword
    }

    if (previousDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL
    } else {
      process.env.DATABASE_URL = previousDatabaseUrl
    }
  }
})

test('an incorrect password still requires the database-backed limiter', async () => {
  const previousPassword = process.env.TOOL_SUBMISSION_PASSWORD
  const previousDatabaseUrl = process.env.DATABASE_URL

  process.env.TOOL_SUBMISSION_PASSWORD = TEST_PASSWORD
  delete process.env.DATABASE_URL

  try {
    const response = await POST(createRequest('wrong-password'))
    const body = (await response.json()) as { error?: string }

    assert.equal(response.status, 503)
    assert.equal(body.error, 'SERVICE_NOT_CONFIGURED')
  } finally {
    if (previousPassword === undefined) {
      delete process.env.TOOL_SUBMISSION_PASSWORD
    } else {
      process.env.TOOL_SUBMISSION_PASSWORD = previousPassword
    }

    if (previousDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL
    } else {
      process.env.DATABASE_URL = previousDatabaseUrl
    }
  }
})
