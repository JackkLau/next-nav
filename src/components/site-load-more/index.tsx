'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import NaviItem from '@/components/navi-item'
import type { CategoryKey, NavigationItem } from '@/data/navigation'

interface SitePageResponse {
  error?: string
  items?: NavigationItem[]
  hasMore?: boolean
  nextCursor?: string | null
}

interface SiteLoadMoreProps {
  category: CategoryKey
  initialCursor: string | null
  initialHasMore: boolean
  initialItems: NavigationItem[]
  locale: string
}

export default function SiteLoadMore({
  category,
  initialCursor,
  initialHasMore,
  initialItems,
  locale,
}: SiteLoadMoreProps) {
  const t = useTranslations()
  const [items, setItems] = useState(initialItems)
  const [cursor, setCursor] = useState(initialCursor)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadMore = async () => {
    if (!cursor || loading) return

    setLoading(true)
    setError('')

    try {
      const requestUrl = new URL('/api/sites', window.location.origin)
      requestUrl.searchParams.set('category', category)
      requestUrl.searchParams.set('locale', locale)
      requestUrl.searchParams.set('limit', '24')
      requestUrl.searchParams.set('cursor', cursor)

      const response = await fetch(requestUrl)
      const payload = (await response.json().catch(() => ({}))) as SitePageResponse

      if (!response.ok || payload.error) {
        throw new Error(payload.error || 'SITE_PAGE_FAILED')
      }

      const existingIds = new Set(items.map((item) => item.id))
      const nextItems = (payload.items || []).filter(
        (item) => !existingIds.has(item.id),
      )

      setItems((currentItems) => [...currentItems, ...nextItems])
      setCursor(payload.nextCursor || null)
      setHasMore(payload.hasMore === true)
    } catch (loadError) {
      console.error('Failed to load more sites:', loadError)
      setError(t('load_more_failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <NaviItem
        navItems={items}
        title={category}
        showAll
        hideTitle
        gridCols={4}
      />
      <div className="flex flex-col items-center gap-2">
        {error && (
          <p className="text-sm text-rose-600" role="status">
            {error}
          </p>
        )}
        {hasMore ? (
          <button
            type="button"
            onClick={loadMore}
            disabled={loading || !cursor}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white/85 px-4 text-sm font-medium text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? t('loading_more') : t('load_more')}
          </button>
        ) : (
          items.length > initialItems.length && (
            <p className="text-sm text-slate-500" role="status">
              {t('no_more_sites')}
            </p>
          )
        )}
      </div>
    </div>
  )
}
