import {
  CategoryType,
  CategoryNameMapping,
  sortNavigationItems,
  getLocalizedNavigationData,
  hasLocalizedContent,
  publishedSiteRecords,
} from '@/data/navigation'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faFolder
} from '@fortawesome/free-solid-svg-icons';
import SiteLoadMore from '@/components/site-load-more';
import { getTranslations } from 'next-intl/server';
import { CategoryIconMap } from '@/data/left-menu'
import { routing } from '@/i18n/routing'
import {
  isIndexableLocale,
  languageAlternates,
  localizedUrl,
  minimumIndexableLocalizedItems,
  openGraphLocale,
} from '@/lib/seo'

const categoryInitialPageSize = 24

type Props = {
  params: Promise<{ category: string, locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const {locale, category} = await params;
  const metadata = await getTranslations({locale, namespace: 'Metadata'});
  const t = await getTranslations({locale});
  const categoryName = CategoryNameMapping[category as keyof typeof CategoryType]

  if (!categoryName) {
    return {
      title: metadata('title'),
      description: metadata('description'),
      robots: { index: false, follow: false },
    }
  }

  const localizedCategoryName = t(`category.${category}`)
  const canonical = localizedUrl(locale, `/category/${category}`)
  const categoryCount = getLocalizedNavigationData(locale).filter(
    (site) => site.categoryKey === category,
  ).length
  const localizedCategoryCount = publishedSiteRecords.filter(
    (site) =>
      site.category === category && hasLocalizedContent(site, locale),
  ).length
  const indexable =
    isIndexableLocale(locale) &&
    localizedCategoryCount >= minimumIndexableLocalizedItems
  const title = locale === 'en'
    ? `${localizedCategoryName} Directory | ${metadata('site_name')}`
    : `${localizedCategoryName} - ${metadata('site_name')}`
  const description = locale === 'en'
    ? `Explore ${categoryCount} hand-picked sites in ${localizedCategoryName.toLowerCase()}. Find useful websites faster with ${metadata('site_name')}.`
    : `${localizedCategoryName} · ${t('category_count', { count: categoryCount })} · ${metadata('site_name')}`

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: languageAlternates(`/category/${category}`),
    },
    robots: { index: indexable, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: metadata('site_name'),
      locale: openGraphLocale(locale),
      type: 'website',
    },
  }
}

export function generateStaticParams() {
  return routing.locales.flatMap(locale =>
    Object.keys(CategoryNameMapping).map(category => ({
      locale,
      category
    }))
  );
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string, locale: string }>
}) {
  const { locale, category } = await params;
  const t = await getTranslations({locale});
  const categoryName = CategoryNameMapping[category as keyof typeof CategoryType]

  if (!categoryName) {
    notFound()
  }

  const categorySites = getLocalizedNavigationData(locale).filter(
    (site) => site.categoryKey === category,
  )

  const sortedSites = sortNavigationItems(categorySites)
  const databaseLoadMoreEnabled = Boolean(process.env.DATABASE_URL)
  const initialSites = databaseLoadMoreEnabled
    ? sortedSites.slice(0, categoryInitialPageSize)
    : sortedSites

  // 结构化数据
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": t(`category.${category}`),
    "url": localizedUrl(locale, `/category/${category}`),
    "inLanguage": locale,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": sortedSites.length,
      "itemListElement": sortedSites.map((site, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": localizedUrl(locale, `/${site.id}`),
        "name": site.name,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <main className="flex min-h-full justify-center py-2 md:py-4">
        <div className="flex w-full max-w-[1680px] flex-col px-1 sm:px-2">
          {/* 分类标题卡片 */}
          <section className="mb-4 px-1 py-2 md:mb-5" aria-labelledby="category-header">
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <div className="flex shrink-0 items-center justify-center">
                <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100 md:size-12" aria-hidden="true">
                  <FontAwesomeIcon icon={CategoryIconMap[categoryName]} className="size-5 text-blue-600" />
                </div>
              </div>
              <div className="min-w-32 flex-1">
                <h1 id="category-header" className="text-xl font-bold tracking-[-0.02em] text-slate-950 md:text-2xl">
                  {t(`category.${category}`)}
                </h1>
                <p className="mt-0.5 text-xs text-slate-500 md:text-sm">
                  {t('category_count', { count: categorySites.length })}
                </p>
              </div>
              <div className="shrink-0">
                <Link
                  href={`/${locale}`}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-3 text-sm font-medium text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label={t('back_home')}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
                  {t('back_home')}
                </Link>
              </div>
            </div>
          </section>

          {/* 网站列表（首屏 JSON，翻页后查询数据库） */}
          <SiteLoadMore
            category={category as keyof typeof CategoryType}
            initialCursor={null}
            initialHasMore={databaseLoadMoreEnabled}
            initialItems={initialSites}
            locale={locale}
          />

          {/* 空状态 */}
          {sortedSites.length === 0 && (
            <section className="rounded-2xl border border-dashed border-slate-200 bg-white/60 py-12 text-center" aria-label={t('empty_state')}>
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-slate-100" aria-hidden="true">
                <FontAwesomeIcon icon={faFolder} className="size-5 text-slate-400" />
              </div>
              <h2 className="mb-1 text-base font-semibold text-slate-900">
                {t('empty_title')}
              </h2>
              <p className="text-sm text-slate-500">
                {t('empty_desc')}
              </p>
            </section>
          )}
        </div>
      </main>
    </>
  )
}
