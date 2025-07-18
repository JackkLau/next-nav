import {CategoryType, navigationData} from '@/data/navigation';
import NaviItem from '@/components/navi-item';
import SearchBar from '@/components/search-bar';
import {Suspense} from 'react';
import { useTranslations } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getTranslations, setRequestLocale } from 'next-intl/server';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://loverezhao.top';
export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}



function SearchParamsComponent({locale}: {locale: string}) {
  setRequestLocale(locale);
  const t = useTranslations();
  // 结构化数据 - 网站集合
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": t('site_collection_name') ,
    "description": t('site_collection_desc'),
    "url": siteUrl,
    "numberOfItems": navigationData.length,
    "itemListElement": navigationData.slice(0, 10).map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "WebSite",
        "name": item.name,
        "url": item.url,
        "description": item.description,
        "category": item.category
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="w-full flex  items-center min-h-screen bg-transparent">
        <div className="w-full  mx-auto flex flex-col gap-3 px-2 md:px-0">
          {/* 搜索栏卡片 */}
          <section className="mb-0 flex flex-col items-center">
            <div className="max-w-full md:w-1/2 w-full  bg-white/95 backdrop-blur rounded-2xl shadow-md px-6 py-5">
              <SearchBar />
            </div>
          </section>
          {/* 分类导航多列平铺区块 */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 max-w-none">
            {
              Object.keys(CategoryType).map((type) => (
                <section
                  key={type}
                  id={CategoryType[type]}
                  className="w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-md border border-gray-200 p-3 scroll-mt-24"
                  tabIndex={-1}
                >
                  {/* title 不能国际化，会导致找不到路由 */}
                  <NaviItem navItems={navigationData.filter(item => item.category === CategoryType[type])} title={type} />
                </section>
              ))
            }
          </div>
        </div>
      </div>
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