import { navigationData, CategoryType, CategoryNameMapping, CategoryMapping } from '@/data/navigation'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { DefaultMetaData } from '@/constant/metaData'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft,
  faFolder
} from '@fortawesome/free-solid-svg-icons';
import NaviItem from '@/components/navi-item';
import { getTranslations } from 'next-intl/server';
import { CategoryIconMap } from '@/data/left-menu'
import { routing } from '@/i18n/routing'

type Props = {
  params: Promise<{ category: string, locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://loverezhao.top';

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Metadata'});
  const { category } = await params
  const categoryName = CategoryNameMapping[category]
  
  // 如果英文标识符不存在，尝试作为中文名称处理（向后兼容）
  const finalCategoryName = categoryName || category
  
  // 验证分类是否存在
  const categoryExists = categoryName || Object.values(CategoryType).includes(finalCategoryName)
  
  if (!categoryExists) {
    return {
      title: t('title'),
      description: t('description'),
      alternates: {
        canonical: siteUrl,
      },
    }
  }

  return {
    title: `${finalCategoryName} - ${DefaultMetaData.title}`,
    description: `${finalCategoryName} 分类下的优质网站导航，汇聚${finalCategoryName}相关的高质量网站资源`,
    alternates: {
      canonical: `${siteUrl}/category/${category}`,
    },
    openGraph: {
      title: `${finalCategoryName} - ${DefaultMetaData.title}`,
      description: `${finalCategoryName} 分类下的优质网站导航`,
      url: `${siteUrl}/category/${category}`,
      siteName: '价值导航',
      locale: 'zh_CN',
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

// 获取分类下的所有网站
function getCategorySites(categoryName: string) {
  return navigationData.filter(site => site.category === categoryName)
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string, locale: string }>
}) {
  const { locale, category } = await params;
  const t = await getTranslations({locale});
  const categoryName = CategoryNameMapping[category]
  
  // 如果英文标识符不存在，尝试作为中文名称处理（向后兼容）
  let finalCategoryName = categoryName || category
  let finalCategory = category
  
  // 如果是中文名称，尝试转换为英文标识符
  if (!categoryName && CategoryMapping[category]) {
    finalCategory = CategoryMapping[category]
    finalCategoryName = category
  }
  
  // 验证分类是否存在
  const categoryExists = categoryName || Object.values(CategoryType).includes(finalCategoryName)
  
  if (!categoryExists) {
    return redirect('/')
  }

  // 获取分类下的所有网站
  const categorySites = getCategorySites(finalCategoryName)
  
  // 按优先级排序：推荐网站 > 普通网站
  const sortedSites = categorySites.sort((a, b) => {
    if (a.favorite && !b.favorite) return -1
    if (!a.favorite && b.favorite) return 1
    return a.name.localeCompare(b.name)
  })

  // 结构化数据
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${finalCategoryName} 网站导航`,
    "description": `${finalCategoryName} 分类下的优质网站导航`,
    "url": `${siteUrl}/category/${finalCategory}`,
    "numberOfItems": sortedSites.length,
    "itemListElement": sortedSites.map((site, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "WebSite",
        "name": site.name,
        "url": site.url,
        "description": site.description,
        "category": site.category
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex justify-center min-h-full py-6">
        <div className="flex flex-col w-11/12 max-w-6xl">
          {/* 分类标题卡片 */}
          <section className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 mb-6" aria-labelledby="category-header">
            <div className="flex flex-col items-center md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-shrink-0 flex justify-center items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center" aria-hidden="true">
                  <FontAwesomeIcon icon={CategoryIconMap[finalCategoryName]} className="w-20 h-20 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center md:items-start w-full">
                <h1 id="category-header" className="text-3xl font-bold text-gray-900 mb-2 text-center md:text-left w-full">
                  {t(`category.${CategoryMapping[finalCategoryName]}`)}
                </h1>
                <p className="text-gray-600 text-center md:text-left w-full">
                  {t('category_count', { count: categorySites.length })}
                </p>
              </div>
              <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-end">
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors duration-200 w-full md:w-auto justify-center"
                  aria-label={t('back_home')}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
                  {t('back_home')}
                </Link>
              </div>
            </div>
          </section>

          {/* 网站列表（复用NaviItem） */}
          <NaviItem navItems={categorySites} title={finalCategoryName} showAll hideTitle gridCols={4} />

          {/* 空状态 */}
          {sortedSites.length === 0 && (
            <section className="text-center py-12" aria-label={t('empty_state')}>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <FontAwesomeIcon icon={faFolder} className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                {t('empty_title')}
              </h2>
              <p className="text-gray-500">
                {t('empty_desc')}
              </p>
            </section>
          )}
        </div>
      </main>
    </>
  )
} 