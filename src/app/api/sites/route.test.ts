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

test('site pagination falls back to the JSON snapshot without a database', async () => {
  await withDatabaseUrl(undefined, async () => {
    const response = await GET(
      new Request('http://localhost/api/sites?category=common&limit=2'),
    )
    const body = (await response.json()) as {
      items?: unknown[]
      hasMore?: boolean
      nextCursor?: string | null
      source?: string
    }

    assert.equal(response.status, 200)
    assert.equal(body.source, 'json')
    assert.equal(body.items?.length, 2)
    assert.equal(body.hasMore, true)
    assert.equal(typeof body.nextCursor, 'string')
  })
})

test('site pagination accepts a valid cursor when using the JSON fallback', async () => {
  await withDatabaseUrl(undefined, async () => {
    const cursor = encodeSiteCursor({
      favorite: true,
      name: 'GitHub',
      slug: 'github',
    })
    const response = await GET(
      new Request(`http://localhost/api/sites?category=common&cursor=${cursor}`),
    )
    const body = (await response.json()) as {
      items?: Array<{ id?: string }>
      source?: string
    }

    assert.equal(response.status, 200)
    assert.equal(body.source, 'json')
    assert.equal(body.items?.some((item) => item.id === 'github'), false)
  })
})
