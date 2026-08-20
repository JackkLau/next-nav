import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import {
  siteCategories,
  siteStatuses,
  type NavigationTranslation,
} from '../data/site-model'

export const siteCategoryEnum = pgEnum('site_category', siteCategories)
export const siteStatusEnum = pgEnum('site_status', siteStatuses)

export const sites = pgTable(
  'sites',
  {
    slug: text('slug').primaryKey(),
    legacyId: text('legacy_id'),
    name: text('name').notNull(),
    url: text('url').notNull(),
    imgUrl: text('image_url'),
    category: siteCategoryEnum('category').notNull(),
    favorite: boolean('favorite').notNull().default(false),
    description: text('description'),
    needVPN: boolean('need_vpn').notNull().default(false),
    sourceLocale: text('source_locale').notNull().default('en'),
    translations:
      jsonb('translations').$type<Record<string, NavigationTranslation>>(),
    status: siteStatusEnum('status').notNull().default('draft'),
    updatedAt: date('updated_at', { mode: 'string' }).notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    modifiedAt: timestamp('modified_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('sites_legacy_id_unique').on(table.legacyId),
    uniqueIndex('sites_url_unique').on(table.url),
    index('sites_status_category_order_idx').on(
      table.status,
      table.category,
      table.sortOrder,
    ),
  ],
).enableRLS()

export const toolSubmissionRateLimits = pgTable(
  'tool_submission_rate_limits',
  {
    clientKey: text('client_key').primaryKey(),
    requestCount: smallint('request_count').notNull().default(1),
    windowStartedAt: timestamp('window_started_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      'tool_submission_rate_limits_request_count_check',
      sql`${table.requestCount} between 1 and 11`,
    ),
  ],
).enableRLS()

export type SiteRow = typeof sites.$inferSelect
export type NewSiteRow = typeof sites.$inferInsert
export type ToolSubmissionRateLimitRow =
  typeof toolSubmissionRateLimits.$inferSelect
