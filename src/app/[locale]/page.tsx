import {CategoryKey, CategoryType, getLocalizedNavigationData} from '@/data/navigation';
import NaviItem from '@/components/navi-item';
import SearchBar from '@/components/search-bar';
import {Suspense} from 'react';
import { useTranslations } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localizedUrl } from '@/lib/seo';
export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}



function SearchParamsComponent({locale}: {locale: string}) {
  setRequestLocale(locale);
  const t = useTranslations();
  const navigationData = getLocalizedNavigationData(locale);
  const pageUrl = localizedUrl(locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": t('site_collection_name') ,
    "description": t('site_collection_desc'),
    "url": pageUrl,
    "numberOfItems": navigationData.length,
    "itemListElement": navigationData.slice(0, 10).map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "WebPage",
        "name": item.name,
        "url": localizedUrl(locale, `/${item.id}`),
        "description": item.description,
        "category": item.category
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <main className="flex min-h-full w-full bg-transparent">
        <div className="mx-auto flex w-full max-w-[1680px] flex-col px-0.5 pb-4 sm:px-1 md:pb-6">
          <header className="px-3 pb-2 pt-3 text-center md:pb-3 md:pt-5">
            <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-blue-500/80" aria-hidden="true" />
            <h1 className="text-2xl font-bold tracking-[-0.03em] text-slate-950 md:text-3xl">
              {t('site_collection_name')}
            </h1>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-[15px]">
              {t('site_collection_desc')}
            </p>
          </header>
          {/* 搜索栏卡片 */}
          <section className="mb-4 flex flex-col items-center px-1 md:mb-5">
            <div className="w-full max-w-2xl">
              <SearchBar />
            </div>
          </section>
          {/* 每个分类独占一行，分类内的网站从左到右排列并自然换行 */}
          <div className="flex w-full max-w-none flex-col gap-4 md:gap-5">
            {
              (Object.entries(CategoryType) as [CategoryKey, string][]).map(([type, categoryName]) => (
                <section
                  key={type}
                  id={categoryName}
                  className="w-full scroll-mt-24 px-1"
                  tabIndex={-1}
                >
                  {/* title 不能国际化，会导致找不到路由 */}
                  <NaviItem navItems={navigationData.filter(item => item.categoryKey === type)} title={type} />
                </section>
              ))
            }
          </div>
        </div>
      </main>
    </>
  );
}

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const { locale } = await params;
  const t = await getTranslations({locale});

  return (
    <Suspense fallback={<div>{t('loading')}</div>}>
      <SearchParamsComponent locale={locale} />
    </Suspense>
  );
}
