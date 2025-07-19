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
    <section className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200" aria-labelledby="related-sites-heading">
      <div className="flex items-center justify-between mb-6">
        <h2 id="related-sites-heading" className="text-lg md:text-xl font-semibold text-gray-800 flex items-center">
          <FontAwesomeIcon icon={faBolt} className="w-5 h-5 mr-2 text-blue-500" />
          <span >{t('related_sites')}</span>
        </h2>
        <span className="text-sm text-gray-500 bg-white px-4 py-1 rounded-full border">
          {t(`category.${CategoryMapping[currentSite.category as keyof typeof CategoryMapping]}`)}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
        {relatedSites.map((site) => (
          <article key={site.id} role="listitem" className="relative group block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
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
                    className="group-hover:scale-110 transition-transform duration-200"
                  />
                  {site.favorite && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center" aria-label="推荐网站">
                      <FontAwesomeIcon icon={faStar} className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className=" flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {site.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate mt-1 leading-relaxed">
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
                        className="absolute top-0 right-1 z-10 hover:bg-red-100 hover:text-red-700 inline-block mt-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full"
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
        <div className="mt-6 text-center">
          <Link
            href={`/category/${getCategorySlug(currentSite.category)}`}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
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