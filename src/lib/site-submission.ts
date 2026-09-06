import type { SiteRecord } from '@/data/site-model'

/**
 * Compare public website URLs without treating transport, a leading `www`,
 * tracking parameters, fragments, or a trailing slash as a new website.
 * Paths remain significant because one host may intentionally contain several
 * separately listed resources.
 */
export function canonicalSiteUrlKey(input: string) {
  try {
    const url = new URL(input)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined

    const hostname = url.hostname.toLowerCase().replace(/^www\./, '')
    const port = url.port ? `:${url.port}` : ''
    const pathname = url.pathname.replace(/\/+$/, '') || '/'

    return `${hostname}${port}${pathname}`
  } catch {
    return undefined
  }
}

/**
 * Produce a small, index-friendly set of equivalent URL spellings for the
 * database's existing unique URL index.
 */
export function siteUrlLookupCandidates(input: string) {
  const candidates = new Set<string>([input])

  try {
    const url = new URL(input)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return Array.from(candidates)
    }

    const bareHostname = url.hostname.toLowerCase().replace(/^www\./, '')
    const hostnames = new Set([url.hostname.toLowerCase(), bareHostname])
    if (!bareHostname.startsWith('www.')) hostnames.add(`www.${bareHostname}`)

    const trimmedPath = url.pathname.replace(/\/+$/, '')
    const paths = trimmedPath
      ? new Set([trimmedPath, `${trimmedPath}/`])
      : new Set(['', '/'])
    const searches = new Set([url.search, ''])

    for (const protocol of ['https:', 'http:']) {
      for (const hostname of hostnames) {
        const port = url.port ? `:${url.port}` : ''
        for (const pathname of paths) {
          for (const search of searches) {
            candidates.add(
              `${protocol}//${hostname}${port}${pathname}${search}`,
            )
          }
        }
      }
    }
  } catch {
    // Validation happens before this helper is used by the API.
  }

  return Array.from(candidates)
}

export function findDuplicateSite(
  records: SiteRecord[],
  submission: { slug?: string; url: string },
  excludedSlug?: string,
) {
  const urlKey = canonicalSiteUrlKey(submission.url)

  return records.find((record) => {
    if (record.slug === excludedSlug) return false
    if (submission.slug && record.slug === submission.slug) return true
    return Boolean(urlKey && canonicalSiteUrlKey(record.url) === urlKey)
  })
}

/** Database rows are authoritative overrides of the versioned JSON snapshot. */
export function mergeSiteSources(
  snapshotRecords: SiteRecord[],
  databaseRecords: SiteRecord[],
) {
  const databaseSlugs = new Set(databaseRecords.map((site) => site.slug))
  return [
    ...databaseRecords,
    ...snapshotRecords.filter((site) => !databaseSlugs.has(site.slug)),
  ]
}

export function resolveSiteSave(
  records: SiteRecord[],
  submission: { slug: string; url: string },
  existingSlug?: string,
) {
  const updateTarget = existingSlug
    ? records.find((site) => site.slug === existingSlug)
    : undefined
  const conflictingSite = findDuplicateSite(records, submission, existingSlug)

  return { updateTarget, conflictingSite }
}

export function shouldVerifyPublicSiteUrl(
  submission: { url: string; status: 'published' | 'archived' },
  updateTarget?: Pick<SiteRecord, 'url'>,
) {
  return !(
    submission.status === 'archived' &&
    updateTarget &&
    canonicalSiteUrlKey(updateTarget.url) ===
      canonicalSiteUrlKey(submission.url)
  )
}
