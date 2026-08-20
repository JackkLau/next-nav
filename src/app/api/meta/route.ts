import { NextResponse } from 'next/server'
import {
  createRateLimitKey,
  getClientIdentifier,
  passwordMatches,
  PublicUrlError,
} from '@/lib/nav-gen-security'
import { fetchPublicSiteMetadata, SiteMetadataError } from '@/lib/site-metadata'
import {
  consumeToolSubmissionLimit,
  type ToolRateLimitResult,
} from '@/lib/tool-rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_REQUEST_BYTES = 4_096
const MAX_PASSWORD_LENGTH = 256
const MAX_URL_LENGTH = 2_048

interface SubmissionBody {
  password?: unknown
  url?: unknown
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

async function readSubmissionBody(request: Request): Promise<SubmissionBody> {
  const contentType = request.headers.get('content-type')?.toLowerCase() || ''
  if (!contentType.startsWith('application/json')) {
    throw new Response('JSON content type required', { status: 415 })
  }

  const declaredLength = Number(request.headers.get('content-length') || 0)
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    throw new Response('Request body too large', { status: 413 })
  }

  const rawBody = await request.text()
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_REQUEST_BYTES) {
    throw new Response('Request body too large', { status: 413 })
  }

  try {
    return JSON.parse(rawBody) as SubmissionBody
  } catch {
    throw new Response('Invalid JSON body', { status: 400 })
  }
}

export async function POST(request: Request) {
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

  let body: SubmissionBody
  try {
    body = await readSubmissionBody(request)
  } catch (error) {
    if (error instanceof Response) return error
    return NextResponse.json(
      { error: 'INVALID_REQUEST', message: 'Invalid request body' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const candidatePassword =
    typeof body.password === 'string' ? body.password : ''
  const isAuthorized =
    candidatePassword.length <= MAX_PASSWORD_LENGTH &&
    passwordMatches(candidatePassword, expectedPassword)

  if (!isAuthorized) {
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
        'Tool submission rate limiter unavailable:',
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

  const url = typeof body.url === 'string' ? body.url.trim() : ''
  if (!url || url.length > MAX_URL_LENGTH) {
    return responseWithoutRateLimit(
      {
        error: 'INVALID_URL',
        message: 'Invalid site address',
        unlimited: true,
      },
      400,
    )
  }

  try {
    const metadata = await fetchPublicSiteMetadata(url)
    return responseWithoutRateLimit({ metadata, unlimited: true })
  } catch (error) {
    if (error instanceof PublicUrlError) {
      return responseWithoutRateLimit(
        { error: 'INVALID_URL', message: error.message, unlimited: true },
        400,
      )
    }

    if (error instanceof SiteMetadataError) {
      return responseWithoutRateLimit(
        {
          error: 'METADATA_FETCH_FAILED',
          message: error.message,
          unlimited: true,
        },
        502,
      )
    }

    if (error instanceof Error && error.name === 'TimeoutError') {
      return responseWithoutRateLimit(
        {
          error: 'METADATA_FETCH_TIMEOUT',
          message: 'The site request timed out',
          unlimited: true,
        },
        504,
      )
    }

    console.error(
      'Metadata fetch failed:',
      error instanceof Error ? error.message : 'Unknown metadata error',
    )
    return responseWithoutRateLimit(
      {
        error: 'METADATA_FETCH_FAILED',
        message: 'Failed to fetch site metadata',
        unlimited: true,
      },
      502,
    )
  }
}
