import {CategoryMapping, navigationData} from '@/data/navigation';
import Link from 'next/link';
import QrBox from '@/components/qr-box';
import RelatedSites from '@/components/related-sites';
import SiteIcon from '@/components/ui/site-icon';
import {redirect} from 'next/navigation';
import {Metadata} from 'next';
import {DefaultMetaData} from '@/constant/metaData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faShieldHalved, 
  faTag, 
  faExternalLinkAlt 
} from '@fortawesome/free-solid-svg-icons';
import {NavigationItem} from '@/data/navigation';
import FavoriteButtonWrapper from "@/components/favorite-button-wrapper";
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';

type Props = {
  params: Promise<{ slug: string, locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Metadata'});
  const { slug } = (await params)

  const navItem = navigationData.find((post) => post.id === slug)
  const baseUrl = 'https://loverezhao.top';

  if (!navItem) {
    return {
      title: t('title'),
      description: t('description'),
      alternates: {
        canonical: baseUrl,
      },
    }
  }

  return {
    title: `${navItem.name} - ${DefaultMetaData.title}`,
    description: navItem.description,
    alternates: {
      canonical: `${baseUrl}/${navItem.id}`,
    },
    openGraph: {
      title: navItem.name,
      description: navItem.description,
      url: `${baseUrl}/${navItem.id}`,
      siteName: DefaultMetaData.title,
      images: navItem.imgUrl ? [
        {
          url: navItem.imgUrl.startsWith('http') ? navItem.imgUrl : `${baseUrl}${navItem.imgUrl}`,
          width: 1200,
          height: 630,
          alt: navItem.name,
        }
      ] : undefined,
      locale: 'zh_CN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: navItem.name,
      description: navItem.description,
      images: navItem.imgUrl ? [
        navItem.imgUrl.startsWith('http') ? navItem.imgUrl : `${baseUrl}${navItem.imgUrl}`
      ] : undefined,
    },
  }
}

export function generateStaticParams() {
  const params = [];
  for (const locale of routing.locales) {
    for (const navItem of navigationData) {
      params.push({
        slug: String(navItem.id),
        locale,
      });
    }
  }
  return params;
}

// export function generateStaticParams() {
//   return routing.locales.flatMap(locale =>
//     navigationData.map(navItem => ({
//       slug: String(navItem.id),
//       locale,
//     }))
//   )
// }

// )智能推荐算法：获取同分类下的其他网站（排除当前网站）
function getRelatedSites(currentSite: NavigationItem, allSites: NavigationItem[]) {
  // 1. 首先获取同分类的网站
  const sameCategorySites = allSites.filter(site => 
    site.category === currentSite.category && 
    site.id !== currentSite.id
  );

  // 2. 按优先级排序：推荐网站 > 普通网站
  const sortedSites = sameCategorySites.sort((a, b) => {
    // 优先显示推荐网站
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    
    // 然后按名称排序
    return a.name.localeCompare(b.name);
  });

  // 3. 返回前6个
  return sortedSites.slice(0, 6);
}

export default async function Home({
                                     params,
                                   }: {
  params: Promise<{ slug: string, locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
})
{
  const { locale } = await params;
  const t = await getTranslations({locale});
  const { slug: menuId } = await params
  const navItem = navigationData.find((item) => item.id === menuId);
  // 没找到对应导航的详情就重定向到首页
  if (!navItem) {
    return redirect('/');
  }

  // 获取同分类下的其他网站
  const relatedSites = getRelatedSites(navItem, navigationData);

  // 结构化数据 (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": `https://loverezhao.top/${navItem.id}`,
    "name": navItem.name,
    "description": navItem.description,
    "inLanguage": "zh-CN",
    "image": navItem.imgUrl ? (navItem.imgUrl.startsWith('http') ? navItem.imgUrl : `https://loverezhao.top${navItem.imgUrl}`) : undefined,
    "sameAs": navItem.url ? [navItem.url] : undefined,
    "category": navItem.category,
    "isAccessibleForFree": true,
    "potentialAction": {
      "@type": "VisitAction",
      "target": navItem.url
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex justify-center min-h-full py-4">
        <div className="flex flex-col w-11/12 max-w-6xl">
          {/* 主要信息卡片 */}
          <section className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            <div className="flex flex-col items-center md:flex-row md:items-center md:space-x-6 space-y-4 md:space-y-0">
              {/* 网站图标 */}
              <div className="flex-shrink-0 relative flex justify-center items-center">
                <SiteIcon 
                  src={navItem?.imgUrl} 
                  alt={`${navItem?.name} ${t('site_icon')}`}
                  size="lg"
                />
                {navItem?.favorite && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-md" aria-label={t('recommend_site')}>
                    <FontAwesomeIcon icon={faStar} className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* 网站信息 */}
              <div className="flex-1 min-w-0 flex flex-col items-center md:items-start w-full">
                <div className="flex flex-col items-center md:flex-row md:items-center md:space-x-3 mb-3 w-full">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate text-center md:text-left w-full">
                    {navItem?.name}
                  </h1>
                  {/* 收藏按钮 */}
                  <FavoriteButtonWrapper item={navItem} />
                  {navItem?.needVPN && (
                    <Link 
                      href={'https://y-too.com/aff.php?aff=6690'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center  text-center  px-4 py-1 text-sm bg-red-100 text-red-700 rounded-full mt-2 md:mt-0"
                      aria-label={t('need_vpn_desc')}
                    >
                      <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4 mr-1" />
                      <span className=" w-12 text-center">{t('need_vpn')}</span>
                    </Link>
                  )}
                </div>
                <div className="flex flex-col items-center md:flex-row md:items-center md:space-x-3 mb-4 w-full">
                  <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full mb-2 md:mb-0">
                    <FontAwesomeIcon icon={faTag} className="w-4 h-4 mr-1" />
                    {t(`category.${CategoryMapping[navItem?.category as keyof typeof CategoryMapping]}`)}
                  </span>
                </div>
                {/* 描述 */}
                <p className="text-gray-600 leading-relaxed mb-4 text-center md:text-left w-full">
                  {navItem?.description || t('no_description')}
                </p>
                {/* 操作按钮 */}
                <div className="flex flex-col space-y-3 w-full md:flex-row md:space-y-0 md:space-x-3 md:justify-start items-center md:items-center">
                  <Link 
                    title={`${t('direct_access')} ${navItem?.name}`}
                    href={navItem?.url || '/'} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full md:w-auto px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                    aria-label={`${t('direct_access')} ${navItem?.name}`}
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="w-4 h-4 mr-2" />
                    {t('direct_access')}
                  </Link>
                  <div className="inline-flex items-center justify-center w-full md:w-auto px-6 py-3 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                    <QrBox url={navItem?.url || '/'} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 你可能感兴趣模块 */}
          <aside aria-label={t('related_sites')}>
            <RelatedSites currentSite={navItem} relatedSites={relatedSites} />
          </aside>
        </div>
      </main>
    </>
  )
}