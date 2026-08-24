import { decodeSiteCursor } from './site-pagination'

export const DEFAULT_SITE_PAGE_SIZE = 24
export const MAX_SITE_PAGE_SIZE = 48

export function normalizeSitePageLimit(value: string | null) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) return DEFAULT_SITE_PAGE_SIZE
  return Math.min(parsed, MAX_SITE_PAGE_SIZE)
}

export function decodeOptionalSiteCursor(value: string | null) {
  if (!value) return undefined
  return decodeSiteCursor(value)
}
