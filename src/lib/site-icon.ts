function secureIconSource(value?: string) {
  const source = value?.trim()
  if (!source) return undefined
  if (source.startsWith('/')) return source

  try {
    const url = new URL(source)
    return url.protocol === 'https:' ? url.toString() : undefined
  } catch {
    return undefined
  }
}

function hostnameFallback(siteUrl?: string) {
  try {
    if (!siteUrl) return undefined
    const url = new URL(siteUrl)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined

    return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(url.hostname)}.ico`
  } catch {
    return undefined
  }
}

export function buildSiteIconSources(iconUrl?: string, siteUrl?: string) {
  return Array.from(new Set(
    [secureIconSource(iconUrl), hostnameFallback(siteUrl)].filter(
      (source): source is string => Boolean(source),
    ),
  ))
}

export function siteIconInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    return `${Array.from(words[0])[0] || ''}${Array.from(words[1])[0] || ''}`.toUpperCase()
  }

  return Array.from(words[0] || '?').slice(0, 2).join('').toUpperCase()
}
