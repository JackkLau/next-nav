'use client'
import { CategoryMapping, NavigationItem } from '@/data/navigation'
import Link from 'next/link'
import SiteIcon from '@/components/ui/site-icon'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faShieldHalved, 
  faBolt,
  faFolder
} from '@fortawesome/free-solid-svg-icons';
import { getCategorySlug } from '@/lib/category';
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation';
interface RelatedSitesProps {
  currentSite: NavigationItem
  relatedSites: NavigationItem[]
}

export default function RelatedSites({ currentSite, relatedSites }: RelatedSitesProps) {
  const t = useTranslations()
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  if (relatedSites.length === 0) {
    return null
  }

  return (
    <section className="mt-5 px-1 py-1" aria-labelledby="related-sites-heading">
      <div className="mb-3 flex items-center justify-between gap-2 px-0.5">
        <h2 id="related-sites-heading" className="flex items-center text-base font-semibold tracking-tight text-slate-900 md:text-lg">
          <span className="mr-2 flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <FontAwesomeIcon icon={faBolt} className="size-3.5" />
          </span>
          <span >{t('related_sites')}</span>
        </h2>
        <span className="truncate rounded-lg bg-white/70 px-2.5 py-1 text-xs text-slate-500 ring-1 ring-slate-200/70">
          {t(`category.${CategoryMapping[currentSite.category as keyof typeof CategoryMapping]}`)}
        </span>
      </div>
      
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3" role="list">
        {relatedSites.map((site) => (
          <article key={site.id} role="listitem" className="group relative block rounded-xl border border-slate-200/80 bg-white/90 p-3 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-950/[0.05]">
            <Link
              href={`/${locale}/${site.id}`}
              
              aria-label={`${t('related_sites_view')} ${site.name} ${t('related_sites_detail')}`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 relative">
                  <SiteIcon 
                    src={site.imgUrl} 
                    alt={`${site.name} ${t('site_icon')}`}
                    size="md"
                    className="transition-transform duration-200 group-hover:scale-105"
                  />
                  {site.favorite && (
                    <div className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-amber-400 ring-2 ring-white" aria-label={t('recommend_site')}>
                      <FontAwesomeIcon icon={faStar} className="size-2.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
                    {site.name}
                  </h3>
                  <p className="mt-1 truncate text-xs leading-relaxed text-slate-500">
                    {site.description && site.description.length > 60 
                      ? `${site.description.substring(0, 60)}...` 
                      : site.description || t('no_description')}
                  </p>
             
                </div>
              </div>
            </Link>
            {site.needVPN && (
                    <Link 
                        href={'https://y-too.com/aff.php?aff=6690'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute right-2 top-2 z-10 inline-flex min-h-6 items-center rounded-md bg-rose-50 px-1.5 text-[10px] font-medium text-rose-600 ring-1 ring-rose-100 transition-colors hover:bg-rose-100"
                        aria-label={t('need_vpn_desc')}
                    >
                      <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3 mr-1" />
                      {t('need_vpn')}
                    </Link>
                  )}
          </article>
        ))}
      </div>
      
      {relatedSites.length >= 6 && (
        <div className="mt-3 text-center">
          <Link
            href={`/${locale}/category/${getCategorySlug(currentSite.category)}`}
            className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            aria-label={`${t('related_sites_view')} ${t(`category.${CategoryMapping[currentSite.category as keyof typeof CategoryMapping]}`)} ${t('related_sites_detail')}`}
          >
            <FontAwesomeIcon icon={faFolder} className="w-4 h-4 mr-2" />
            {t('related_sites_view_more')} {t(`category.${CategoryMapping[currentSite.category as keyof typeof CategoryMapping]}`)} {t('related_sites_detail')}
          </Link>
        </div>
      )}
    </section>
  )
}
