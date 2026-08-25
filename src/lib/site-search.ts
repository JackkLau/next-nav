import type { CategoryKey, NavigationItem } from '@/data/navigation'

export const MAX_SITE_SEARCH_QUERY_LENGTH = 100

type CategoryLabels = Readonly<Partial<Record<CategoryKey, string>>>

function normalizeSearchText(value: string) {
  return value
    .normalize('NFKD')
    .replace(/\p{Mark}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeSiteSearchQuery(value: string) {
  return value
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_SITE_SEARCH_QUERY_LENGTH)
}

function searchableText(item: NavigationItem, categoryLabels: CategoryLabels) {
  const translatedCopy = Object.values(item.translations || {}).flatMap(
    (translation) => [translation.name, translation.description],
  )

  return normalizeSearchText(
    [
      item.name,
      item.description,
      item.url,
      item.id,
      item.category,
      item.categoryKey,
      categoryLabels[item.categoryKey],
      ...translatedCopy,
    ]
      .filter(Boolean)
      .join(' '),
  )
}

function relevanceScore(item: NavigationItem, normalizedQuery: string) {
  const name = normalizeSearchText(item.name)
  const slug = normalizeSearchText(item.id)
  const url = normalizeSearchText(item.url)

  if (name === normalizedQuery) return 0
  if (name.startsWith(normalizedQuery)) return 1
  if (name.includes(normalizedQuery)) return 2
  if (slug === normalizedQuery || slug.startsWith(normalizedQuery)) return 3
  if (url.includes(normalizedQuery)) return 4
  return 5
}

export function searchNavigationItems(
  items: NavigationItem[],
  query: string,
  categoryLabels: CategoryLabels = {},
) {
  const normalizedQuery = normalizeSearchText(
    normalizeSiteSearchQuery(query),
  )
  if (!normalizedQuery) return []

  const tokens = normalizedQuery.split(' ')

  return items
    .filter((item) => {
      const haystack = searchableText(item, categoryLabels)
      return tokens.every((token) => haystack.includes(token))
    })
    .sort((first, second) => {
      const scoreDifference =
        relevanceScore(first, normalizedQuery) -
        relevanceScore(second, normalizedQuery)
      if (scoreDifference) return scoreDifference
      if (first.favorite && !second.favorite) return -1
      if (!first.favorite && second.favorite) return 1
      return first.name.localeCompare(second.name) || first.id.localeCompare(second.id)
    })
}
