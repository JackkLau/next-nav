import { NextResponse } from 'next/server'
import { siteCategories, type CategoryKey } from '@/data/site-model'
import {
  decodeOptionalSiteCursor,
  normalizeSitePageLimit,
} from '@/lib/database-sites'
import { getPublishedSiteDirectory } from '@/lib/published-sites'
import { paginateNavigationItems } from '@/lib/site-pagination'

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

  try {
    const directory = await getPublishedSiteDirectory(locale)
    const categoryItems = category
      ? directory.items.filter(
          (item) => item.categoryKey === (category as CategoryKey),
        )
      : directory.items
    const page = paginateNavigationItems(categoryItems, cursor, limit)

    return response({ ...page, source: directory.source })
  } catch (error) {
    console.error(
      'Site directory page unavailable:',
      error instanceof Error ? error.message : 'Unknown database error',
    )
    return response(
      {
        error: 'SERVICE_UNAVAILABLE',
        message: 'Site directory is temporarily unavailable',
      },
      503,
    )
  }
}
