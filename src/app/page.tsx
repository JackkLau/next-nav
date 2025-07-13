import {CategoryType, navigationData} from '@/data/navigation';
import NaviItem from '@/components/navi-item';
import SearchBar from '@/components/search-bar';
import {Suspense} from 'react';
import {Metadata} from 'next';
import {DefaultMetaData} from '@/constant/metaData';

export const metadata: Metadata = {
  title: DefaultMetaData.title,
  description: DefaultMetaData.description,
  alternates: {
    canonical: 'https://loverezhao.top',
  },
  openGraph: {
    title: DefaultMetaData.title,
    description: DefaultMetaData.description,
    url: 'https://loverezhao.top',
    siteName: '价值导航',
    locale: 'zh_CN',
    type: 'website',
  },
};

function SearchParamsComponent() {
  // 结构化数据 - 网站集合
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "价值导航网站集合",
    "description": "汇聚全网优质分类站点的导航平台",
    "url": "https://loverezhao.top",
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
      <div className="w-full flex flex-col items-center min-h-screen bg-transparent">
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-3 px-2 md:px-0">
          {/* 搜索栏卡片 */}
          <section className="mb-0 flex flex-col items-center">
            <div className="w-full bg-white/95 backdrop-blur rounded-2xl shadow-md px-6 py-5">
              <SearchBar />
            </div>
          </section>
          {/* 分类导航多列平铺区块 */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-none">
            {
              Object.keys(CategoryType).map((type) => (
                <section
                  key={type}
                  id={CategoryType[type]}
                  className="w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-md border border-gray-200 p-3 scroll-mt-24"
                  tabIndex={-1}
                >
                  <NaviItem navItems={navigationData.filter(item => item.category === CategoryType[type])} title={CategoryType[type]} />
                </section>
              ))
            }
          </div>
        </div>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchParamsComponent />
    </Suspense>
  );
}