import { navigationData, CategoryType } from '@/data/navigation'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { DefaultMetaData } from '@/constant/metaData'
import SiteIcon from '@/components/ui/site-icon'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTag, 
  faShieldHalved, 
  faExternalLinkAlt,
  faArrowLeft,
  faStar,
  faFolder
} from '@fortawesome/free-solid-svg-icons';

type Props = {
  params: Promise<{ category: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)
  const baseUrl = 'https://loverezhao.top';
  
  // 验证分类是否存在
  const categoryExists = Object.values(CategoryType).includes(decodedCategory)
  
  if (!categoryExists) {
    return {
      title: DefaultMetaData.title,
      description: DefaultMetaData.description,
      alternates: {
        canonical: baseUrl,
      },
    }
  }

  return {
    title: `${decodedCategory} - ${DefaultMetaData.title}`,
    description: `${decodedCategory} 分类下的优质网站导航，汇聚${decodedCategory}相关的高质量网站资源`,
    alternates: {
      canonical: `${baseUrl}/category/${encodeURIComponent(decodedCategory)}`,
    },
    openGraph: {
      title: `${decodedCategory} - ${DefaultMetaData.title}`,
      description: `${decodedCategory} 分类下的优质网站导航`,
      url: `${baseUrl}/category/${encodeURIComponent(decodedCategory)}`,
      siteName: '价值导航',
      locale: 'zh_CN',
      type: 'website',
    },
  }
}

export function generateStaticParams() {
  return Object.values(CategoryType).map((category) => ({
    category: encodeURIComponent(category),
  }))
}

// 获取分类下的所有网站
function getCategorySites(categoryName: string) {
  return navigationData.filter(site => site.category === categoryName)
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)
  
  // 验证分类是否存在
  const categoryExists = Object.values(CategoryType).includes(decodedCategory)
  if (!categoryExists) {
    return redirect('/')
  }

  // 获取分类下的所有网站
  const categorySites = getCategorySites(decodedCategory)
  
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
    "name": `${decodedCategory} 网站导航`,
    "description": `${decodedCategory} 分类下的优质网站导航`,
    "url": `https://loverezhao.top/category/${encodeURIComponent(decodedCategory)}`,
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
      <main className="flex justify-center min-h-full py-8">
        <div className="flex flex-col w-11/12 max-w-6xl">
          {/* 分类标题卡片 */}
          <section className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 mb-6" aria-labelledby="category-header">
            <div className="flex flex-col items-center md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-shrink-0 flex justify-center items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center" aria-hidden="true">
                  <FontAwesomeIcon icon={faTag} className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center md:items-start w-full">
                <h1 id="category-header" className="text-3xl font-bold text-gray-900 mb-2 text-center md:text-left w-full">
                  {decodedCategory}
                </h1>
                <p className="text-gray-600 text-center md:text-left w-full">
                  共找到 {categorySites.length} 个优质网站
                </p>
              </div>
              <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-end">
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors duration-200 w-full md:w-auto justify-center"
                  aria-label="返回首页"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
                  返回首页
                </Link>
              </div>
            </div>
          </section>

          {/* 网站列表 */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label={`${decodedCategory} 网站列表`}>
            {sortedSites.map((site) => (
              <article
                key={site.id}
                className="group block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 relative">
                    <Link href={`/${site.id}`} aria-label={`查看 ${site.name} 详情`}>
                      <SiteIcon 
                        src={site.imgUrl} 
                        alt={`${site.name} 网站图标`}
                        size="lg"
                        className="group-hover:scale-110 transition-transform duration-200"
                      />
                    </Link>
                    {site.favorite && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-md" aria-label="推荐网站">
                        <FontAwesomeIcon icon={faStar} className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <Link href={`/${site.id}`} className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {site.name}
                        </h2>
                      </Link>
                      {site.needVPN && (
                        <span className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                          <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3 mr-1" />
                          VPN
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3">
                      {site.description || '暂无描述'}
                    </p>
                    
                    <div className="flex items-center mt-4">
                      <Link
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center w-full justify-center px-3 py-2 text-base font-medium text-white bg-blue-600 rounded h-10 hover:bg-blue-700 transition-colors md:w-auto md:justify-start md:text-xs md:h-7"
                        aria-label={`访问 ${site.name}`}
                      >
                        <FontAwesomeIcon icon={faExternalLinkAlt} className="w-4 h-4 mr-2 md:w-3 md:h-3 md:mr-1" />
                        访问
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {/* 空状态 */}
          {sortedSites.length === 0 && (
            <section className="text-center py-12" aria-label="空状态">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <FontAwesomeIcon icon={faFolder} className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">暂无网站</h2>
              <p className="text-gray-500">该分类下暂时没有网站</p>
            </section>
          )}
        </div>
      </main>
    </>
  )
} 