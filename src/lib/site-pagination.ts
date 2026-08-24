import {
  sortNavigationItems,
  type NavigationItem,
} from '@/data/navigation'

export interface SiteCursor {
  favorite: boolean
  name: string
  slug: string
}

export function encodeSiteCursor(cursor: SiteCursor) {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url')
}

export function decodeSiteCursor(value: string): SiteCursor | undefined {
  try {
    const parsed = JSON.parse(
      Buffer.from(value, 'base64url').toString('utf8'),
    ) as Partial<SiteCursor>

    if (
      typeof parsed.favorite !== 'boolean' ||
      typeof parsed.name !== 'string' ||
      typeof parsed.slug !== 'string'
    ) {
      return undefined
    }

    return {
      favorite: parsed.favorite,
      name: parsed.name,
      slug: parsed.slug,
    }
  } catch {
    return undefined
  }
}

export function cursorFromNavigationItem(
  item: NavigationItem | undefined,
): string | null {
  if (!item) return null

  return encodeSiteCursor({
    favorite: item.favorite === true,
    name: item.name,
    slug: item.id,
  })
}

export function compareNavigationItemToCursor(
  item: NavigationItem,
  cursor: SiteCursor,
) {
  const itemFavorite = item.favorite === true
  if (itemFavorite !== cursor.favorite) return itemFavorite ? -1 : 1

  return item.name.localeCompare(cursor.name) || item.id.localeCompare(cursor.slug)
}

export function paginateNavigationItems(
  items: NavigationItem[],
  cursor: SiteCursor | undefined,
  limit: number,
) {
  const sortedItems = sortNavigationItems(items)
  const startIndex = cursor
    ? sortedItems.findIndex(
        (item) => compareNavigationItemToCursor(item, cursor) > 0,
      )
    : 0
  const remainingItems = startIndex === -1 ? [] : sortedItems.slice(startIndex)
  const pageItems = remainingItems.slice(0, limit)
  const hasMore = remainingItems.length > limit

  return {
    items: pageItems,
    hasMore,
    nextCursor: hasMore
      ? cursorFromNavigationItem(pageItems.at(-1))
      : null,
  }
}
