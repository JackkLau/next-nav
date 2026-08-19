import rawSites from './sites.json'

export const CategoryType = {
  common: 'common',
  community: 'community',
  tools: 'tools',
  remote: 'remote',
  personal: 'personal',
  resources: 'resources',
  mirror: 'mirror',
  navigation: 'navigation',
  entertainment: 'entertainment',
  game: 'game',
} as const

export type CategoryKey = keyof typeof CategoryType

export const CategoryMapping = Object.fromEntries(
  Object.entries(CategoryType).map(([key, name]) => [name, key]),
) as Record<string, CategoryKey>

export const CategoryNameMapping = Object.fromEntries(
  Object.entries(CategoryType),
) as Record<CategoryKey, string>

export interface NavigationTranslation {
  name?: string
  description?: string
}

export interface SiteRecord {
  slug: string
  legacyId?: string
  name: string
  url: string
  imgUrl?: string
  category: CategoryKey
  favorite?: boolean
  description?: string
  needVPN?: boolean
  sourceLocale: string
  translations?: Record<string, NavigationTranslation>
  status: 'draft' | 'published' | 'archived'
  updatedAt: string
}

export interface NavigationItem {
  id: string
  legacyId?: string
  name: string
  url: string
  imgUrl?: string
  category: string
  categoryKey: CategoryKey
  favorite?: boolean
  description?: string
  needVPN?: boolean
  sourceLocale: string
  translations?: Record<string, NavigationTranslation>
  updatedAt: string
}

export const siteRecords = rawSites as SiteRecord[]
export const publishedSiteRecords = siteRecords.filter(
  (site) => site.status === 'published',
)

const EAST_ASIAN_SCRIPT_PATTERN = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u

function hasEnglishSourceCopy(site: SiteRecord) {
  const copy = `${site.name} ${site.description || ''}`
  return (site.description?.trim().length || 0) >= 30 &&
    /[A-Za-z]/.test(copy) &&
    !EAST_ASIAN_SCRIPT_PATTERN.test(copy)
}

function toNavigationItem(site: SiteRecord, locale?: string): NavigationItem {
  const translation = locale ? site.translations?.[locale] : undefined
  const canUseSourceDescription =
    !locale ||
    site.sourceLocale === locale ||
    (locale === 'en' && hasEnglishSourceCopy(site))

  return {
    id: site.slug,
    legacyId: site.legacyId,
    name: translation?.name || site.name,
    url: site.url,
    imgUrl: site.imgUrl,
    category: CategoryType[site.category],
    categoryKey: site.category,
    favorite: site.favorite,
    description:
      translation?.description ||
      (canUseSourceDescription ? site.description : undefined),
    needVPN: site.needVPN,
    sourceLocale: site.sourceLocale,
    translations: site.translations,
    updatedAt: site.updatedAt,
  }
}

export const navigationData = publishedSiteRecords.map((site) =>
  toNavigationItem(site),
)

export const legacyIdToSlug = Object.fromEntries(
  publishedSiteRecords
    .filter((site) => site.legacyId)
    .map((site) => [site.legacyId as string, site.slug]),
)

export function getLocalizedNavigationData(locale: string) {
  return publishedSiteRecords.map((site) => toNavigationItem(site, locale))
}

export function findNavigationItem(identifier: string, locale?: string) {
  const site = publishedSiteRecords.find((item) => item.slug === identifier)
  return site ? toNavigationItem(site, locale) : undefined
}

export function findSiteRecord(identifier: string) {
  return publishedSiteRecords.find((item) => item.slug === identifier)
}

export function findNavigationItemByLegacyId(legacyId: string) {
  const site = publishedSiteRecords.find((item) => item.legacyId === legacyId)
  return site ? toNavigationItem(site) : undefined
}

export function hasLocalizedContent(site: SiteRecord, locale: string) {
  if (site.sourceLocale === locale) return true
  if (locale === 'en' && hasEnglishSourceCopy(site)) return true
  return Boolean(site.translations?.[locale]?.description)
}
