import { NextResponse } from 'next/server'
import { siteCategories, type CategoryKey } from '@/data/site-model'
import {
  decodeOptionalSiteCursor,
  listPublishedSitesFromDatabase,
  normalizeSitePageLimit,
} from '@/lib/database-sites'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const allowedCategories = new Set<string>(siteCategories)

function response(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const category = url.searchParams.get('category')
  const locale = url.searchParams.get('locale') || undefined
  const limit = normalizeSitePageLimit(url.searchParams.get('limit'))
  const cursorValue = url.searchParams.get('cursor')
  const cursor = decodeOptionalSiteCursor(cursorValue)

  if (category && !allowedCategories.has(category)) {
    return response(
      {
        error: 'INVALID_CATEGORY',
        message: `Category "${category}" is not supported`,
      },
      400,
    )
  }

  if (cursorValue && !cursor) {
    return response(
      {
        error: 'INVALID_CURSOR',
        message: 'The pagination cursor is invalid',
      },
      400,
    )
  }

  if (!process.env.DATABASE_URL) {
    return response(
      {
        error: 'SERVICE_NOT_CONFIGURED',
        message: 'Site database is not configured',
      },
      503,
    )
  }

  try {
    const page = await listPublishedSitesFromDatabase({
      category: category as CategoryKey | undefined,
      cursor,
      limit,
      locale,
    })

    return response({ ...page, source: 'database' })
  } catch (error) {
    console.error(
      'Site database page unavailable:',
      error instanceof Error ? error.message : 'Unknown database error',
    )
    return response(
      {
        error: 'SERVICE_UNAVAILABLE',
        message: 'Site database is temporarily unavailable',
      },
      503,
    )
  }
}
