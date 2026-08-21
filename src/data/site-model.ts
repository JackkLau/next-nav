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

export const siteCategories = Object.values(CategoryType) as [
  CategoryKey,
  ...CategoryKey[],
]

export const siteStatuses = ['draft', 'published', 'archived'] as const

export type CategoryKey = keyof typeof CategoryType
export type SiteStatus = (typeof siteStatuses)[number]

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
  status: SiteStatus
  updatedAt: string
  removedAt?: string
  removalReason?: string
}
