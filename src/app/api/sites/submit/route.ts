import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { eq, inArray, or } from 'drizzle-orm'
import {
  createRateLimitKey,
  getClientIdentifier,
  passwordMatches,
  PublicUrlError,
  assertPublicHttpUrl,
} from '@/lib/nav-gen-security'
import {
  consumeToolSubmissionLimit,
  type ToolRateLimitResult,
} from '@/lib/tool-rate-limit'
import { siteCategories, type CategoryKey } from '@/data/site-model'
import { siteRecords } from '@/data/navigation'
import { getDatabase, sites, toSiteRecord, type NewSiteRow } from '@/db'
import { PUBLISHED_SITES_CACHE_TAG } from '@/lib/published-sites'
import {
  findDuplicateSite,
  mergeSiteSources,
  resolveSiteSave,
  shouldVerifyPublicSiteUrl,
  siteUrlLookupCandidates,
} from '@/lib/site-submission'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_REQUEST_BYTES = 8_192
const MAX_PASSWORD_LENGTH = 256
const MAX_SLUG_LENGTH = 96
const MAX_NAME_LENGTH = 200
const MAX_URL_LENGTH = 2_048
const MAX_DESCRIPTION_LENGTH = 2_000

const allowedCategories = new Set<string>(siteCategories)

interface SiteSubmitBody {
  password?: unknown
  action?: unknown
  url?: unknown
  existingSlug?: unknown
  site?: unknown
}

interface NormalizedSiteSubmission {
  site: NewSiteRow & {
    status: 'published' | 'archived'
    url: string
  }
  rawUrl: string
}

function rateLimitHeaders(rateLimit: ToolRateLimitResult) {
  return {
    'Cache-Control': 'no-store',
    'X-RateLimit-Limit': String(rateLimit.limit),
    'X-RateLimit-Remaining': String(rateLimit.remaining),
    'X-RateLimit-Reset': String(
      Math.ceil(new Date(rateLimit.resetAt).getTime() / 1000),
    ),
  }
}

function responseWithRateLimit(
  body: Record<string, unknown>,
  status: number,
  rateLimit: ToolRateLimitResult,
) {
  return NextResponse.json(
    { ...body, rateLimit },
    { status, headers: rateLimitHeaders(rateLimit) },
  )
}

function responseWithoutRateLimit(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

function invalidSite(message: string) {
  return responseWithoutRateLimit({ error: 'INVALID_SITE', message }, 400)
}

function invalidRequest(message: string) {
  return responseWithoutRateLimit({ error: 'INVALID_REQUEST', message }, 400)
}

async function readSubmissionBody(
  request: Request,
): Promise<SiteSubmitBody | Response> {
  const contentType = request.headers.get('content-type')?.toLowerCase() || ''
  if (!contentType.startsWith('application/json')) {
    return responseWithoutRateLimit(
      { error: 'INVALID_REQUEST', message: 'JSON content type required' },
      415,
    )
  }

  const declaredLength = Number(request.headers.get('content-length') || 0)
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    return responseWithoutRateLimit(
      { error: 'INVALID_REQUEST', message: 'Request body too large' },
      413,
    )
  }

  const rawBody = await request.text()
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_REQUEST_BYTES) {
    return responseWithoutRateLimit(
      { error: 'INVALID_REQUEST', message: 'Request body too large' },
      413,
    )
  }

  try {
    return JSON.parse(rawBody) as SiteSubmitBody
  } catch {
    return responseWithoutRateLimit(
      { error: 'INVALID_REQUEST', message: 'Invalid JSON body' },
      400,
    )
  }
}

async function authorizeSubmission(request: Request, candidate: unknown) {
  const expectedPassword = process.env.TOOL_SUBMISSION_PASSWORD
  if (!expectedPassword) {
    return responseWithoutRateLimit(
      {
        error: 'SERVICE_NOT_CONFIGURED',
        message: 'The submission password is not configured',
      },
      503,
    )
  }

  const candidatePassword = typeof candidate === 'string' ? candidate : ''
  const isAuthorized =
    candidatePassword.length <= MAX_PASSWORD_LENGTH &&
    passwordMatches(candidatePassword, expectedPassword)

  if (isAuthorized) return null

  if (!process.env.DATABASE_URL) {
    return responseWithoutRateLimit(
      {
        error: 'SERVICE_NOT_CONFIGURED',
        message: 'Invalid-password rate limiting is not configured',
      },
      503,
    )
  }

  const clientKey = createRateLimitKey(
    getClientIdentifier(request.headers),
    expectedPassword,
  )

  let rateLimit: ToolRateLimitResult
  try {
    rateLimit = await consumeToolSubmissionLimit(clientKey)
  } catch (error) {
    console.error(
      'Tool site submission rate limiter unavailable:',
      error instanceof Error ? error.message : 'Unknown database error',
    )
    return responseWithoutRateLimit(
      {
        error: 'SERVICE_UNAVAILABLE',
        message: 'Invalid-password rate limiting is temporarily unavailable',
      },
      503,
    )
  }

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'RATE_LIMITED',
        message: 'Too many invalid password attempts. Try again later.',
        rateLimit,
      },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders(rateLimit),
          'Retry-After': String(rateLimit.retryAfterSeconds),
        },
      },
    )
  }

  return responseWithRateLimit(
    { error: 'INVALID_PASSWORD', message: 'Invalid access password' },
    401,
    rateLimit,
  )
}

function requiredString(
  value: unknown,
  field: string,
  maxLength: number,
): string | Response {
  if (typeof value !== 'string' || !value.trim()) {
    return invalidSite(`${field} is required`)
  }

  const trimmed = value.trim()
  if (trimmed.length > maxLength) {
    return invalidSite(`${field} is too long`)
  }

  return trimmed
}

function optionalString(
  value: unknown,
  field: string,
  maxLength: number,
): string | undefined | Response {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string') return invalidSite(`${field} is invalid`)

  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (trimmed.length > maxLength) return invalidSite(`${field} is too long`)

  return trimmed
}

function optionalHttpUrl(value: unknown, field: string) {
  const url = optionalString(value, field, MAX_URL_LENGTH)
  if (url instanceof Response || !url) return url

  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return invalidSite(`${field} must use http or https`)
    }
    if (parsed.username || parsed.password) {
      return invalidSite(`${field} must not contain credentials`)
    }
  } catch {
    return invalidSite(`${field} is invalid`)
  }

  return url
}

function requiredHttpUrl(value: unknown, field: string) {
  const url = requiredString(value, field, MAX_URL_LENGTH)
  if (url instanceof Response) return url

  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return invalidSite(`${field} must use http or https`)
    }
    if (parsed.username || parsed.password) {
      return invalidSite(`${field} must not contain credentials`)
    }
    return parsed.href
  } catch {
    return invalidSite(`${field} is invalid`)
  }
}

function normalizeSiteSubmission(
  input: unknown,
): NormalizedSiteSubmission | Response {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return invalidSite('site must be an object')
  }

  const payload = input as Record<string, unknown>
  const slug = requiredString(payload.slug, 'slug', MAX_SLUG_LENGTH)
  if (slug instanceof Response) return slug
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return invalidSite('slug must use lowercase letters, numbers, and hyphens')
  }

  const name = requiredString(payload.name, 'name', MAX_NAME_LENGTH)
  if (name instanceof Response) return name

  const rawUrl = requiredHttpUrl(payload.url, 'url')
  if (rawUrl instanceof Response) return rawUrl

  const imgUrl = optionalHttpUrl(payload.imgUrl, 'imgUrl')
  if (imgUrl instanceof Response) return imgUrl

  const category = requiredString(payload.category, 'category', 64)
  if (category instanceof Response) return category
  if (!allowedCategories.has(category)) {
    return invalidSite(`category "${category}" is not supported`)
  }

  const description = optionalString(
    payload.description,
    'description',
    MAX_DESCRIPTION_LENGTH,
  )
  if (description instanceof Response) return description

  const status = payload.status ?? 'published'
  if (status !== 'published' && status !== 'archived') {
    return invalidSite('status must be published or archived')
  }

  return {
    rawUrl,
    site: {
      slug,
      name,
      url: rawUrl,
      imgUrl: imgUrl || null,
      category: category as CategoryKey,
      favorite: payload.favorite === true,
      description: description || null,
      needVPN: payload.needVPN === true,
      sourceLocale: 'en',
      status,
      updatedAt: new Date().toISOString().slice(0, 10),
      sortOrder: 0,
    },
  }
}

function editableSite(site: ReturnType<typeof toSiteRecord>) {
  return {
    slug: site.slug,
    name: site.name,
    url: site.url,
    imgUrl: site.imgUrl || '',
    category: site.category,
    favorite: site.favorite === true,
    description: site.description || '',
    needVPN: site.needVPN === true,
    sourceLocale: site.sourceLocale,
    status:
      site.status === 'published' && !site.removedAt
        ? ('published' as const)
        : ('archived' as const),
    updatedAt: site.updatedAt,
  }
}

async function findSiteRecords(url: string, slugs: string[] = []) {
  const snapshotMatch = findDuplicateSite(siteRecords, { url })
  const lookupSlugs = Array.from(
    new Set([...slugs, ...(snapshotMatch ? [snapshotMatch.slug] : [])]),
  )
  const urlCandidates = siteUrlLookupCandidates(url)
  const database = getDatabase()
  const databaseRows = await database.query.sites.findMany({
    where: or(
      inArray(sites.url, urlCandidates),
      lookupSlugs.length ? inArray(sites.slug, lookupSlugs) : undefined,
    ),
  })

  return {
    database,
    databaseRows,
    records: mergeSiteSources(
      siteRecords,
      databaseRows.map((row) => toSiteRecord(row)),
    ),
  }
}

function isUniqueViolation(error: unknown) {
  return (
    !!error &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code?: unknown }).code === '23505'
  )
}

function revalidatePublishedSites() {
  revalidateTag(PUBLISHED_SITES_CACHE_TAG, { expire: 0 })
  revalidatePath('/[locale]', 'page')
  revalidatePath('/[locale]/category/[category]', 'page')
  revalidatePath('/[locale]/[slug]', 'page')
  revalidatePath('/sitemap.xml')
}

export async function POST(request: Request) {
  const body = await readSubmissionBody(request)
  if (body instanceof Response) return body

  const authFailure = await authorizeSubmission(request, body.password)
  if (authFailure) return authFailure

  const action = body.action ?? 'save'
  if (action !== 'check' && action !== 'save') {
    return invalidRequest('action must be check or save')
  }

  if (action === 'check') {
    const lookupUrl = requiredHttpUrl(body.url, 'url')
    if (lookupUrl instanceof Response) return lookupUrl

    if (!process.env.DATABASE_URL) {
      return responseWithoutRateLimit(
        {
          error: 'SERVICE_NOT_CONFIGURED',
          message: 'Site submission database is not configured',
        },
        503,
      )
    }

    try {
      const { databaseRows, records } = await findSiteRecords(lookupUrl)
      const existingSite = findDuplicateSite(records, { url: lookupUrl })

      return responseWithoutRateLimit({
        duplicate: Boolean(existingSite),
        ...(existingSite
          ? {
              site: editableSite(existingSite),
              source: databaseRows.some((row) => row.slug === existingSite.slug)
                ? 'database'
                : 'snapshot',
            }
          : {}),
        unlimited: true,
      })
    } catch (error) {
      console.error(
        'Site duplicate check unavailable:',
        error instanceof Error ? error.message : 'Unknown database error',
      )
      return responseWithoutRateLimit(
        {
          error: 'SERVICE_UNAVAILABLE',
          message: 'Site duplicate check is temporarily unavailable',
          unlimited: true,
        },
        503,
      )
    }
  }

  const normalized = normalizeSiteSubmission(body.site)
  if (normalized instanceof Response) return normalized

  if (!process.env.DATABASE_URL) {
    return responseWithoutRateLimit(
      {
        error: 'SERVICE_NOT_CONFIGURED',
        message: 'Site submission database is not configured',
      },
      503,
    )
  }

  const existingSlug = optionalString(
    body.existingSlug,
    'existingSlug',
    MAX_SLUG_LENGTH,
  )
  if (existingSlug instanceof Response) return existingSlug
  if (existingSlug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(existingSlug)) {
    return invalidSite('existingSlug is invalid')
  }

  const siteToSave = {
    ...normalized.site,
    url: normalized.rawUrl,
  }

  try {
    const { database, databaseRows, records } = await findSiteRecords(
      siteToSave.url,
      [siteToSave.slug, ...(existingSlug ? [existingSlug] : [])],
    )
    const { updateTarget, conflictingSite } = resolveSiteSave(
      records,
      { slug: siteToSave.slug, url: siteToSave.url },
      existingSlug,
    )

    if (existingSlug && !updateTarget) {
      return responseWithoutRateLimit(
        {
          error: 'SITE_NOT_FOUND',
          message: 'The site to update no longer exists',
          unlimited: true,
        },
        404,
      )
    }

    if (conflictingSite) {
      return responseWithoutRateLimit(
        {
          error: 'DUPLICATE_SITE',
          message: 'A site with this slug or URL already exists',
          site: editableSite(conflictingSite),
          source: databaseRows.some((row) => row.slug === conflictingSite.slug)
            ? 'database'
            : 'snapshot',
          unlimited: true,
        },
        409,
      )
    }

    if (shouldVerifyPublicSiteUrl(siteToSave, updateTarget)) {
      try {
        siteToSave.url = (await assertPublicHttpUrl(siteToSave.url)).href
      } catch (error) {
        if (error instanceof PublicUrlError) {
          return responseWithoutRateLimit(
            { error: 'INVALID_SITE', message: error.message, unlimited: true },
            400,
          )
        }
        throw error
      }
    }

    if (updateTarget) {
      const existingDatabaseRow = databaseRows.find(
        (row) => row.slug === updateTarget.slug,
      )
      const updateValues = {
        ...siteToSave,
        slug: updateTarget.slug,
        sourceLocale: updateTarget.sourceLocale,
        sortOrder: existingDatabaseRow?.sortOrder ?? siteToSave.sortOrder,
        ...(siteToSave.status === 'published'
          ? { removedAt: null, removalReason: null }
          : {}),
        modifiedAt: new Date(),
      }

      if (!existingDatabaseRow) {
        const [insertedOverride] = await database
          .insert(sites)
          .values({
            ...updateValues,
            legacyId: updateTarget.legacyId,
            translations: updateTarget.translations,
          })
          .returning({
            slug: sites.slug,
            url: sites.url,
            status: sites.status,
            updatedAt: sites.updatedAt,
          })

        revalidatePublishedSites()
        return responseWithoutRateLimit(
          { site: insertedOverride, operation: 'updated', unlimited: true },
          200,
        )
      }

      const [updatedSite] = await database
        .update(sites)
        .set(updateValues)
        .where(eq(sites.slug, updateTarget.slug))
        .returning({
          slug: sites.slug,
          url: sites.url,
          status: sites.status,
          updatedAt: sites.updatedAt,
        })

      revalidatePublishedSites()

      return responseWithoutRateLimit(
        { site: updatedSite, operation: 'updated', unlimited: true },
        200,
      )
    }

    const [insertedSite] = await database
      .insert(sites)
      .values(siteToSave)
      .returning({
        slug: sites.slug,
        url: sites.url,
        status: sites.status,
        updatedAt: sites.updatedAt,
      })

    revalidatePublishedSites()

    return responseWithoutRateLimit(
      { site: insertedSite, operation: 'created', unlimited: true },
      201,
    )
  } catch (error) {
    if (isUniqueViolation(error)) {
      return responseWithoutRateLimit(
        {
          error: 'DUPLICATE_SITE',
          message: 'A site with this slug or URL already exists',
          unlimited: true,
        },
        409,
      )
    }

    console.error(
      'Site submission database unavailable:',
      error instanceof Error ? error.message : 'Unknown database error',
    )
    return responseWithoutRateLimit(
      {
        error: 'SERVICE_UNAVAILABLE',
        message: 'Site submission database is temporarily unavailable',
        unlimited: true,
      },
      503,
    )
  }
}
