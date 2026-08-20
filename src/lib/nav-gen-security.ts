import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import type { LookupAddress } from 'node:dns'
import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

const CLIENT_IDENTIFIER_MAX_LENGTH = 256

export class PublicUrlError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PublicUrlError'
  }
}

export function passwordMatches(candidate: string, expected: string) {
  const candidateDigest = createHash('sha256').update(candidate).digest()
  const expectedDigest = createHash('sha256').update(expected).digest()
  return timingSafeEqual(candidateDigest, expectedDigest)
}

export function getClientIdentifier(headers: Headers) {
  const forwardedFor =
    headers.get('x-vercel-forwarded-for') ||
    headers.get('x-forwarded-for') ||
    headers.get('x-real-ip') ||
    'unknown-client'

  return forwardedFor
    .split(',')[0]
    .trim()
    .slice(0, CLIENT_IDENTIFIER_MAX_LENGTH)
}

export function createRateLimitKey(identifier: string, secret: string) {
  return createHmac('sha256', secret).update(identifier).digest('hex')
}

function isPublicIpv4(address: string) {
  const octets = address.split('.').map(Number)
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet))) {
    return false
  }

  const [first, second, third] = octets
  if (first === 0 || first === 10 || first === 127 || first >= 224) return false
  if (first === 100 && second >= 64 && second <= 127) return false
  if (first === 169 && second === 254) return false
  if (first === 172 && second >= 16 && second <= 31) return false
  if (first === 192 && second === 0 && third === 0) return false
  if (first === 192 && second === 0 && third === 2) return false
  if (first === 192 && second === 168) return false
  if (first === 198 && (second === 18 || second === 19)) return false
  if (first === 198 && second === 51 && third === 100) return false
  if (first === 203 && second === 0 && third === 113) return false

  return true
}

function expandIpv6(address: string) {
  let normalized = address.toLowerCase().split('%')[0]
  const ipv4Match = normalized.match(/(\d+\.\d+\.\d+\.\d+)$/)

  if (ipv4Match) {
    if (isIP(ipv4Match[1]) !== 4) return null
    const octets = ipv4Match[1].split('.').map(Number)
    const high = ((octets[0] << 8) | octets[1]).toString(16)
    const low = ((octets[2] << 8) | octets[3]).toString(16)
    normalized = normalized.replace(ipv4Match[1], `${high}:${low}`)
  }

  const halves = normalized.split('::')
  if (halves.length > 2) return null

  const left = halves[0] ? halves[0].split(':') : []
  const right = halves[1] ? halves[1].split(':') : []
  const missing = 8 - left.length - right.length
  if (missing < 0 || (halves.length === 1 && missing !== 0)) return null

  const groups = [...left, ...Array(missing).fill('0'), ...right]
  if (
    groups.length !== 8 ||
    groups.some((group) => !/^[0-9a-f]{1,4}$/.test(group))
  ) {
    return null
  }

  return groups.map((group) => Number.parseInt(group, 16))
}

function isPublicIpv6(address: string) {
  const embeddedIpv4 = address.match(/(\d+\.\d+\.\d+\.\d+)$/)?.[1]
  if (embeddedIpv4 && !isPublicIpv4(embeddedIpv4)) return false

  const groups = expandIpv6(address)
  if (!groups) return false

  if (groups.every((group) => group === 0)) return false
  if (groups.slice(0, 7).every((group) => group === 0) && groups[7] === 1) {
    return false
  }

  // IPv4-mapped IPv6 addresses inherit the embedded IPv4 classification.
  if (
    groups.slice(0, 5).every((group) => group === 0) &&
    groups[5] === 0xffff
  ) {
    const embedded = `${groups[6] >> 8}.${groups[6] & 255}.${groups[7] >> 8}.${groups[7] & 255}`
    return isPublicIpv4(embedded)
  }

  const first = groups[0]
  if ((first & 0xfe00) === 0xfc00) return false // Unique local (fc00::/7)
  if ((first & 0xffc0) === 0xfe80) return false // Link local (fe80::/10)
  if ((first & 0xff00) === 0xff00) return false // Multicast (ff00::/8)
  if (first === 0x2001 && groups[1] === 0x0db8) return false // Documentation
  if (first === 0x2001 && groups[1] === 0) return false // Teredo
  if (first === 0x2002) return false // 6to4

  return true
}

export function isPublicIpAddress(address: string) {
  const version = isIP(address)
  if (version === 4) return isPublicIpv4(address)
  if (version === 6) return isPublicIpv6(address)
  return false
}

export async function assertPublicHttpUrl(input: string) {
  let url: URL
  try {
    url = new URL(input)
  } catch {
    throw new PublicUrlError('The site address is invalid')
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new PublicUrlError('Only HTTP and HTTPS URLs are supported')
  }
  if (url.username || url.password) {
    throw new PublicUrlError('URLs containing credentials are not supported')
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase()
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    throw new PublicUrlError('Private network addresses are not supported')
  }

  const literalVersion = isIP(hostname)
  if (literalVersion) {
    if (!isPublicIpAddress(hostname)) {
      throw new PublicUrlError('Private network addresses are not supported')
    }
    return url
  }

  let addresses: LookupAddress[]
  try {
    addresses = await lookup(hostname, { all: true, verbatim: true })
  } catch {
    throw new PublicUrlError('The site hostname could not be resolved')
  }

  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => !isPublicIpAddress(address))
  ) {
    throw new PublicUrlError('Private network addresses are not supported')
  }

  return url
}
