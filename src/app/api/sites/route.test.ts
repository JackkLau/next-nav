import assert from 'node:assert/strict'
import test from 'node:test'
import { GET } from './route'
import { encodeSiteCursor } from '@/lib/site-pagination'

async function withDatabaseUrl(
  databaseUrl: string | undefined,
  run: () => Promise<void>,
) {
  const previousDatabaseUrl = process.env.DATABASE_URL

  if (databaseUrl === undefined) {
    delete process.env.DATABASE_URL
  } else {
    process.env.DATABASE_URL = databaseUrl
  }

  try {
    await run()
  } finally {
    if (previousDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL
    } else {
      process.env.DATABASE_URL = previousDatabaseUrl
    }
  }
}

test('site pagination rejects unsupported categories before requiring a database', async () => {
  await withDatabaseUrl(undefined, async () => {
    const response = await GET(
      new Request('http://localhost/api/sites?category=unknown'),
    )
    const body = (await response.json()) as { error?: string }

    assert.equal(response.status, 400)
    assert.equal(body.error, 'INVALID_CATEGORY')
  })
})

test('site pagination rejects invalid cursors before requiring a database', async () => {
  await withDatabaseUrl(undefined, async () => {
    const response = await GET(
      new Request('http://localhost/api/sites?cursor=not-a-cursor'),
    )
    const body = (await response.json()) as { error?: string }

    assert.equal(response.status, 400)
    assert.equal(body.error, 'INVALID_CURSOR')
  })
})

test('site pagination rejects invalid excluded site ids before requiring a database', async () => {
  await withDatabaseUrl(undefined, async () => {
    const response = await GET(
      new Request('http://localhost/api/sites?exclude=valid-id,Bad%20Id'),
    )
    const body = (await response.json()) as { error?: string }

    assert.equal(response.status, 400)
    assert.equal(body.error, 'INVALID_EXCLUDE')
  })
})

test('site pagination requires a configured database for valid requests', async () => {
  await withDatabaseUrl(undefined, async () => {
    const cursor = encodeSiteCursor({
      favorite: false,
      name: 'Example',
      slug: 'example',
    })
    const response = await GET(
      new Request(`http://localhost/api/sites?category=common&cursor=${cursor}`),
    )
    const body = (await response.json()) as { error?: string }

    assert.equal(response.status, 503)
    assert.equal(body.error, 'SERVICE_NOT_CONFIGURED')
  })
})
