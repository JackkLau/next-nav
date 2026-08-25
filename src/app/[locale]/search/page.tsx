import type { Metadata } from 'next'
import SearchBar from '@/components/search-bar'
import NaviItem from '@/components/navi-item'
import { siteCategories, type CategoryKey } from '@/data/navigation'
import { getPublishedSiteDirectory } from '@/lib/published-sites'
import {
  normalizeSiteSearchQuery,
  searchNavigationItems,
} from '@/lib/site-search'
import { getTranslations, setRequestLocale } from 'next-intl/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type SearchPageProps = {
  params: Promise<{locale: string}>
  searchParams: Promise<{q?: string | string[]}>
}

function queryFromSearchParams(value?: string | string[]) {
  return normalizeSiteSearchQuery(Array.isArray(value) ? value[0] || '' : value || '')
}

export async function generateMetadata({
  params,
}: SearchPageProps): Promise<Metadata> {
  const {locale} = await params
  const metadata = await getTranslations({locale, namespace: 'Metadata'})
  const t = await getTranslations({locale})

  return {
    title: `${t('site_search.title')} | ${metadata('site_name')}`,
    description: t('site_search.description'),
    robots: {index: false, follow: true},
  }
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const {locale} = await params
  setRequestLocale(locale)

  const t = await getTranslations({locale})
  const query = queryFromSearchParams((await searchParams).q)
  const categoryLabels = Object.fromEntries(
    siteCategories.map((category) => [category, t(`category.${category}`)]),
  ) as Partial<Record<CategoryKey, string>>

  const results = query
    ? searchNavigationItems(
        (await getPublishedSiteDirectory(locale)).items,
        query,
        categoryLabels,
      )
    : []

  return (
    <main className="flex min-h-full w-full bg-transparent">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col px-1 pb-6 pt-3 sm:px-2 md:pt-5">
        <header className="px-2 text-center">
          <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-blue-500/80" aria-hidden="true" />
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-slate-950 md:text-3xl">
            {t('site_search.title')}
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-[15px]">
            {t('site_search.description')}
          </p>
        </header>

        <section className="mx-auto mt-4 w-full max-w-2xl px-1 md:mt-5" aria-label={t('site_search.title')}>
          <SearchBar key={query} initialQuery={query} />
        </section>

        <section className="mt-6 px-1" aria-live="polite">
          {!query ? (
            <p className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-8 text-center text-sm text-slate-500">
              {t('site_search.enter_query')}
            </p>
          ) : results.length ? (
            <>
              <h2 id="site-search-results" className="mb-3 text-sm font-semibold text-slate-700 md:text-base">
                {t('site_search.results', {count: results.length, query})}
              </h2>
              <NaviItem
                navItems={results}
                title="site-search-results"
                showAll
                hideTitle
                gridCols={4}
              />
            </>
          ) : (
            <p className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-8 text-center text-sm text-slate-500">
              {t('site_search.no_results', {query})}
            </p>
          )}
        </section>
      </div>
    </main>
  )
}
