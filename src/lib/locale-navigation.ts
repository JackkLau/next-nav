export function localizedPathWithQuery(
  pathname: string,
  nextLocale: string,
  queryString = '',
) {
  const segments = pathname.split('/')
  segments[1] = nextLocale
  const localizedPath = segments.join('/') || `/${nextLocale}`
  const normalizedQuery = queryString.replace(/^\?/, '')

  return normalizedQuery
    ? `${localizedPath}?${normalizedQuery}`
    : localizedPath
}
