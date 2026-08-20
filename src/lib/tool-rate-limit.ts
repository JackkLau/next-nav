import { sql } from 'drizzle-orm'
import { getDatabase } from '@/db/client'
import { toolSubmissionRateLimits } from '@/db/schema'

export const TOOL_SUBMISSION_LIMIT = 10
export const TOOL_SUBMISSION_WINDOW_SECONDS = 60
const BLOCKED_COUNT = TOOL_SUBMISSION_LIMIT + 1

export interface ToolRateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: string
  retryAfterSeconds: number
}

/**
 * Consume one attempt using one atomic upsert. Blocked attempts do not extend
 * the current window, and the counter is capped to satisfy its DB constraint.
 */
export async function consumeToolSubmissionLimit(
  clientKey: string,
): Promise<ToolRateLimitResult> {
  const database = getDatabase()
  const [row] = await database
    .insert(toolSubmissionRateLimits)
    .values({ clientKey })
    .onConflictDoUpdate({
      target: toolSubmissionRateLimits.clientKey,
      set: {
        requestCount: sql`case
          when ${toolSubmissionRateLimits.windowStartedAt} <= now() - interval '60 seconds'
            then 1
          else least(${toolSubmissionRateLimits.requestCount} + 1, ${BLOCKED_COUNT})
        end`,
        windowStartedAt: sql`case
          when ${toolSubmissionRateLimits.windowStartedAt} <= now() - interval '60 seconds'
            then now()
          else ${toolSubmissionRateLimits.windowStartedAt}
        end`,
        updatedAt: sql`now()`,
      },
    })
    .returning({
      requestCount: toolSubmissionRateLimits.requestCount,
      windowStartedAt: toolSubmissionRateLimits.windowStartedAt,
    })

  if (!row) {
    throw new Error('Rate limit counter did not return a row')
  }

  const resetAtDate = new Date(
    row.windowStartedAt.getTime() + TOOL_SUBMISSION_WINDOW_SECONDS * 1000,
  )
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((resetAtDate.getTime() - Date.now()) / 1000),
  )
  const allowed = row.requestCount <= TOOL_SUBMISSION_LIMIT

  return {
    allowed,
    limit: TOOL_SUBMISSION_LIMIT,
    remaining: Math.max(0, TOOL_SUBMISSION_LIMIT - row.requestCount),
    resetAt: resetAtDate.toISOString(),
    retryAfterSeconds,
  }
}
