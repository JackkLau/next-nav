import {
  CategoryMapping,
  findNavigationItem,
  findNavigationItemByLegacyId,
  findSiteRecord,
  getLocalizedNavigationData,
  hasLocalizedContent,
  NavigationItem,
} from '@/data/navigation';
import Link from 'next/link';
import QrBox from '@/components/qr-box';
import RelatedSites from '@/components/related-sites';
import SiteIcon from '@/components/ui/site-icon';
import {notFound, permanentRedirect} from 'next/navigation';
import {Metadata} from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faShieldHalved, 
  faTag, 
  faExternalLinkAlt 
} from '@fortawesome/free-solid-svg-icons';
import FavoriteButtonWrapper from "@/components/favorite-button-wrapper";
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import {
  indexableLocales,
  isIndexableLocale,
  languageAlternatesFor,
  localizedPath,
  localizedUrl,
  openGraphLocale,
  siteOrigin,
} from '@/lib/seo';
import { findPublishedSiteFromDatabase } from '@/lib/database-sites';

type Props = {
  params: Promise<{ slug: string, locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const {locale, slug} = await params;
  const t = await getTranslations({locale, namespace: 'Metadata'});
  const legacyItem = findNavigationItemByLegacyId(slug)
  const resolvedSlug = legacyItem?.id || slug
  const jsonNavItem = findNavigationItem(resolvedSlug, locale)
  const jsonSiteRecord = findSiteRecord(resolvedSlug)
  const databaseSite =
    jsonNavItem && jsonSiteRecord
      ? undefined
      : await findPublishedSiteFromDatabase(resolvedSlug, locale)
  const navItem = jsonNavItem || databaseSite?.navItem
  const siteRecord = jsonSiteRecord || databaseSite?.siteRecord

  if (!navItem || !siteRecord) {
    return {
      title: t('title'),
      description: t('description'),
      robots: { index: false, follow: false },
    }
  }

  const canonical = localizedUrl(locale, `/${navItem.id}`)
  const availableLocales = indexableLocales.filter(
    (candidate) => hasLocalizedContent(siteRecord, candidate),
  )
  const indexable =
    isIndexableLocale(locale) && availableLocales.includes(locale)
  const description = navItem.description || t('description')

  return {
    title: `${navItem.name} | ${t('site_name')}`,
    description,
    alternates: {
      canonical,
      languages: languageAlternatesFor(`/${navItem.id}`, availableLocales),
    },
    robots: { index: indexable, follow: true },
    openGraph: {
      title: navItem.name,
      description,
      url: canonical,
      siteName: t('site_name'),
      images: navItem.imgUrl ? [
        {
          url: navItem.imgUrl.startsWith('http') ? navItem.imgUrl : `${siteOrigin}${navItem.imgUrl}`,
          width: 1200,
          height: 630,
          alt: navItem.name,
        }
      ] : undefined,
      locale: openGraphLocale(locale),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: navItem.name,
      description,
      images: navItem.imgUrl ? [
        navItem.imgUrl.startsWith('http') ? navItem.imgUrl : `${siteOrigin}${navItem.imgUrl}`
      ] : undefined,
    },
  }
}

export function generateStaticParams() {
  const params = [];
  for (const locale of routing.locales) {
    for (const navItem of getLocalizedNavigationData(locale)) {
      params.push({
        slug: navItem.id,
        locale,
      });
    }
  }
  return params;
}

function getRelatedSites(currentSite: NavigationItem, allSites: NavigationItem[]) {
  const sameCategorySites = allSites.filter(site => 
    site.category === currentSite.category && 
    site.id !== currentSite.id
  );

  const sortedSites = sameCategorySites.sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    
    return a.name.localeCompare(b.name);
  });

  return sortedSites.slice(0, 6);
}

export default async function Home({
                                     params,
                                   }: {
  params: Promise<{ slug: string, locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
})
{
  const { locale, slug } = await params;
  const t = await getTranslations({locale});
  const legacyItem = findNavigationItemByLegacyId(slug)
  if (legacyItem) {
    permanentRedirect(localizedPath(locale, `/${legacyItem.id}`))
  }

  const navItem =
    findNavigationItem(slug, locale) ||
    (await findPublishedSiteFromDatabase(slug, locale))?.navItem
  if (!navItem) {
    notFound()
  }

  const navigationData = getLocalizedNavigationData(locale)
  const relatedSites = getRelatedSites(navItem, navigationData);
  const canonical = localizedUrl(locale, `/${navItem.id}`)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": canonical,
    "name": navItem.name,
    "description": navItem.description,
    "inLanguage": locale,
    "image": navItem.imgUrl ? (navItem.imgUrl.startsWith('http') ? navItem.imgUrl : `${siteOrigin}${navItem.imgUrl}`) : undefined,
    "isPartOf": {
      "@type": "WebSite",
      "url": localizedUrl(locale),
    },
    "about": {
      "@type": "WebSite",
      "name": navItem.name,
      "url": navItem.url,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <main className="flex min-h-full justify-center py-2 md:py-4">
        <div className="flex w-full max-w-5xl flex-col px-1 sm:px-2">
          {/* 主要信息卡片 */}
          <section className="rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-5 shadow-sm shadow-slate-950/[0.03] sm:px-6 md:py-6">
            <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-5">
              {/* 网站图标 */}
              <div className="flex-shrink-0 relative flex justify-center items-center">
                <SiteIcon 
                  src={navItem?.imgUrl} 
                  alt={`${navItem?.name} ${t('site_icon')}`}
                  size="lg"
                />
                {navItem?.favorite && (
                  <div className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-amber-400 ring-4 ring-white" aria-label={t('recommend_site')}>
                    <FontAwesomeIcon icon={faStar} className="size-3.5 text-white" />
                  </div>
                )}
              </div>

              {/* 网站信息 */}
              <div className="flex-1 min-w-0 flex flex-col items-center md:items-start w-full">
                <div className="mb-2 flex w-full flex-col items-center gap-2 md:flex-row md:items-center">
                  <h1 className="w-full break-words text-center text-xl font-bold tracking-[-0.02em] text-slate-950 md:text-left md:text-2xl">
                    {navItem?.name}
                  </h1>
                  {/* 收藏按钮 */}
                  <FavoriteButtonWrapper item={navItem} />
                  {navItem?.needVPN && (
                    <Link 
                      href={'https://y-too.com/aff.php?aff=6690'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex min-h-8 items-center rounded-full bg-rose-50 px-3 text-xs font-medium text-rose-700 ring-1 ring-rose-100"
                      aria-label={t('need_vpn_desc')}
                    >
                      <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4 mr-1" />
                      <span>{t('need_vpn')}</span>
                    </Link>
                  )}
                </div>
                <div className="mb-3 flex w-full items-center justify-center md:justify-start">
                  <span className="inline-flex min-h-7 items-center rounded-lg bg-blue-50 px-2.5 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
                    <FontAwesomeIcon icon={faTag} className="mr-1.5 size-3" />
                    {t(`category.${CategoryMapping[navItem?.category as keyof typeof CategoryMapping]}`)}
                  </span>
                </div>
                {/* 描述 */}
                <p className="mb-4 w-full text-center text-sm leading-6 text-slate-600 md:text-left">
                  {navItem?.description || t('no_description')}
                </p>
                {/* 操作按钮 */}
                <div className="flex w-full flex-col items-center gap-2 sm:flex-row md:justify-start">
                  <Link 
                    title={`${t('direct_access')} ${navItem?.name}`}
                    href={navItem?.url || `/${locale}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:w-auto"
                    aria-label={`${t('direct_access')} ${navItem?.name}`}
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="w-4 h-4 mr-2" />
                    {t('direct_access')}
                  </Link>
                  <div className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:w-auto">
                    <QrBox url={navItem?.url || `/${locale}`} />
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
