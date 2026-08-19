import { routing } from '@/i18n/routing'

const DEFAULT_SITE_ORIGIN = 'https://loverezhao.top'

export const minimumIndexableLocalizedItems = 3

export const siteOrigin = (
  process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_ORIGIN
).replace(/\/$/, '')

const configuredIndexableLocales = (process.env.INDEXABLE_LOCALES || 'en')
  .split(',')
  .map((locale) => locale.trim())
  .filter((locale) => routing.locales.includes(locale as never))

export const indexableLocales = configuredIndexableLocales.length
  ? configuredIndexableLocales
  : ['en']

export const isProductionDeployment =
  !process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production'

export function absoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${siteOrigin}${normalizedPath}`
}

export function localizedPath(locale: string, path = '') {
  const normalizedPath = path && !path.startsWith('/') ? `/${path}` : path
  return `/${locale}${normalizedPath}`
}

export function localizedUrl(locale: string, path = '') {
  return absoluteUrl(localizedPath(locale, path))
}

export function languageAlternates(path = '') {
  return Object.fromEntries([
    ...indexableLocales.map((locale) => [locale, localizedUrl(locale, path)]),
    ['x-default', localizedUrl(indexableLocales[0], path)],
  ])
}

export function languageAlternatesFor(path: string, locales: string[]) {
  const availableLocales = indexableLocales.filter((locale) =>
    locales.includes(locale),
  )
  if (!availableLocales.length) return undefined

  return Object.fromEntries([
    ...availableLocales.map((locale) => [locale, localizedUrl(locale, path)]),
    ['x-default', localizedUrl(availableLocales[0], path)],
  ])
}

export function isIndexableLocale(locale: string) {
  return isProductionDeployment && indexableLocales.includes(locale)
}

export function openGraphLocale(locale: string) {
  return locale.replace('-', '_')
}
