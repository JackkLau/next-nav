import he from 'he'
import { assertPublicHttpUrl, PublicUrlError } from './nav-gen-security'

const MAX_HTML_BYTES = 1_000_000
const MAX_REDIRECTS = 3
const REQUEST_TIMEOUT_MS = 10_000

export interface SiteMetadata {
  title: string
  description: string
  favicon: string
}

export class SiteMetadataError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SiteMetadataError'
  }
}

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return match ? he.decode(match[1].trim()) : ''
}

function extractMetaContent(name: string, html: string, property = false) {
  const attributeType = property ? 'property' : 'name'
  const patterns = [
    new RegExp(
      `<meta[^>]*${attributeType}=["']${name}["'][^>]*content=["']([^"']*)["'][^>]*>`,
      'i',
    ),
    new RegExp(
      `<meta[^>]*content=["']([^"']*)["'][^>]*${attributeType}=["']${name}["'][^>]*>`,
      'i',
    ),
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match) return he.decode(match[1].trim())
  }

  return ''
}

function extractIconHref(html: string) {
  const patterns = [
    /<link[^>]*rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']*)["'][^>]*>/i,
    /<link[^>]*href=["']([^"']*)["'][^>]*rel=["'][^"']*icon[^"']*["'][^>]*>/i,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match) return he.decode(match[1].trim())
  }

  return ''
}

async function readTextWithLimit(response: Response) {
  if (!response.body) return ''

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let receivedBytes = 0
  let result = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    receivedBytes += value.byteLength
    if (receivedBytes > MAX_HTML_BYTES) {
      await reader.cancel()
      throw new SiteMetadataError('The site response is too large')
    }
    result += decoder.decode(value, { stream: true })
  }

  return result + decoder.decode()
}

async function fetchHtml(input: string) {
  let currentUrl = await assertPublicHttpUrl(input)

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    const response = await fetch(currentUrl, {
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'user-agent': 'NextNavMetadataFetcher/1.0',
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location || redirectCount === MAX_REDIRECTS) {
        throw new SiteMetadataError('The site redirected too many times')
      }
      currentUrl = await assertPublicHttpUrl(
        new URL(location, currentUrl).toString(),
      )
      continue
    }

    if (!response.ok) {
      throw new SiteMetadataError(`The site returned HTTP ${response.status}`)
    }

    const contentType = response.headers.get('content-type')?.toLowerCase()
    if (
      contentType &&
      !contentType.includes('text/html') &&
      !contentType.includes('application/xhtml+xml')
    ) {
      throw new SiteMetadataError('The site did not return an HTML document')
    }

    return { html: await readTextWithLimit(response), finalUrl: currentUrl }
  }

  throw new SiteMetadataError('The site redirected too many times')
}

export async function fetchPublicSiteMetadata(
  input: string,
): Promise<SiteMetadata> {
  const { html, finalUrl } = await fetchHtml(input)
  const iconHref = extractIconHref(html)
  let favicon = `${finalUrl.origin}/favicon.ico`

  if (iconHref) {
    try {
      favicon = (
        await assertPublicHttpUrl(new URL(iconHref, finalUrl).toString())
      ).toString()
    } catch (error) {
      if (!(error instanceof PublicUrlError)) throw error
    }
  }

  return {
    title: extractTitle(html) || extractMetaContent('og:title', html, true),
    description:
      extractMetaContent('description', html) ||
      extractMetaContent('og:description', html, true),
    favicon,
  }
}
