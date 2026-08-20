import { NextRequest, NextResponse } from 'next/server'
import { legacyIdToSlug } from './data/navigation'
import { routing } from './i18n/routing'

const PUBLIC_FILE = /\.(.*)$/
const locales = routing.locales
const defaultLocale = routing.defaultLocale
const retiredLocales = new Set(['zh-CN', 'zh-TW'])

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignore static assets and API routes.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return
  }

  const pathSegments = pathname.split('/').filter(Boolean)
  const firstSegment = pathSegments[0] || ''
  const legacySlug =
    pathSegments.length === 2 ? legacyIdToSlug[pathSegments[1]] : undefined

  // Keep removed Chinese URLs recoverable while consolidating indexing on English.
  if (retiredLocales.has(firstSegment)) {
    const redirectUrl = request.nextUrl.clone()
    const redirectSegments = [...pathSegments]
    redirectSegments[0] = defaultLocale
    if (legacySlug) redirectSegments[1] = legacySlug
    redirectUrl.pathname = `/${redirectSegments.join('/')}`
    return NextResponse.redirect(redirectUrl, 308)
  }

  // Resolve legacy numeric detail URLs before they reach a dynamic page fallback.
  if (locales.includes(firstSegment as (typeof locales)[number])) {
    if (legacySlug) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = `/${firstSegment}/${legacySlug}`
      return NextResponse.redirect(redirectUrl, 308)
    }
    return
  }

  // Use a deterministic default locale for users and crawlers.
  const redirectUrl = request.nextUrl.clone()
  const unprefixedLegacySlug =
    pathSegments.length === 1 ? legacyIdToSlug[firstSegment] : undefined
  redirectUrl.pathname = unprefixedLegacySlug
    ? `/${defaultLocale}/${unprefixedLegacySlug}`
    : pathname === '/'
      ? `/${defaultLocale}`
      : `/${defaultLocale}${pathname}`
  return NextResponse.redirect(redirectUrl, 308)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
