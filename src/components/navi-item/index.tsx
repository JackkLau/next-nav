'use client';

import React from 'react';
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip';
import Link from 'next/link';
import {NavigationItem} from '@/data/navigation';
import SiteIcon from '@/components/ui/site-icon';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faStar} from '@fortawesome/free-regular-svg-icons';
import {faArrowUpRightFromSquare, faChevronRight, faStar as faStarSolid} from '@fortawesome/free-solid-svg-icons';
import { getCategorySlug } from '@/lib/category';
import { useFavoriteSites } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

const previewItemCount = 8;

function Index({navItems, title, showAll, hideTitle, gridCols, hasMoreItems}: { navItems: NavigationItem[], title: string, showAll?: boolean, hideTitle?: boolean, gridCols?: number, hasMoreItems?: boolean }) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const t = useTranslations();
  const { favorites, toggleFavorite } = useFavoriteSites();
  const itemsToShow = showAll ? navItems : navItems.slice(0, previewItemCount);
  const usesGridLayout = Boolean(gridCols && gridCols > 1);
  const ulClass = usesGridLayout
    ? 'grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
    : 'grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4';
  return (
    <section aria-labelledby={title} className="w-full">
      <div className="mb-2 flex items-center justify-between px-0.5">
        {!hideTitle && (
          <h2 id={title} className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-900 md:text-base">
            <span className="size-1.5 rounded-full bg-blue-500" aria-hidden="true" />
            {t(`category.${title}`)}
          </h2>
        )}
        {!showAll && (hasMoreItems ?? navItems.length > previewItemCount) && (
          <Link
            href={`/${locale}/category/${getCategorySlug(title)}`}
            className="ml-2 inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-slate-500 transition-colors hover:bg-white hover:text-blue-700"
          >
            {t('more')}
            <FontAwesomeIcon icon={faChevronRight} className="size-2.5" />
          </Link>
        )}
      </div>
      <ul className={ulClass}>
        {itemsToShow.map((item) => (
          <Tooltip key={item.id}>
            <li
              className="group relative flex min-h-[74px] items-center rounded-xl border border-slate-200/80 bg-white/90 p-2.5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-950/[0.05]">
              {item.needVPN && (
                <span
                  className="pointer-events-none absolute right-1.5 top-1.5 z-20 flex select-none items-center rounded-md bg-rose-50 px-1.5 py-0.5 text-[9px] font-medium text-rose-600 ring-1 ring-rose-100"
                  aria-label={t('need_vpn')}
                >
                  <span className="pointer-events-auto">{t('need_vpn')}</span>
                </span>
              )}
              <TooltipTrigger asChild>
                <Link href={`/${locale}/${item.id}`} className="flex min-w-0 flex-1 items-center" prefetch={false}>
                  <SiteIcon
                    src={item.imgUrl}
                    siteUrl={item.url}
                    alt={item.name}
                    size="card"
                  />
                  <div className="ml-3 min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold leading-5 text-slate-900 transition-colors group-hover:text-blue-700">{item.name}</h3>
                    {item.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs leading-4 text-slate-500">{item.description}</p>
                    )}
                  </div>
                </Link>
              </TooltipTrigger>
              <div className={`ml-1.5 flex shrink-0 items-center gap-0.5 ${item.needVPN ? 'pt-5' : ''}`}>
                <Link href={item.url || `/${locale}`} target="_blank" rel="noopener noreferrer" title={t('direct_access')}
                  className="flex size-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:size-8">
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="size-3" />
                </Link>
                <button
                  type="button"
                  className={`z-10 flex size-10 items-center justify-center rounded-lg text-amber-400 transition-colors hover:bg-amber-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:size-8 ${favorites.includes(item.id) ? '' : 'text-slate-300 hover:text-amber-400'}`}
                  onClick={() => {
                    const isFavorite = toggleFavorite(item.id);
                    toast(isFavorite
                      ? t('favorites.added', {name: item.name})
                      : t('favorites.removed', {name: item.name}));
                  }}
                  aria-label={favorites.includes(item.id) ? t('cancel_favorite') : t('add_favorite')}
                  aria-pressed={favorites.includes(item.id)}
                  tabIndex={0}
                >
                  <FontAwesomeIcon icon={favorites.includes(item.id) ? faStarSolid : faStar} className="size-3.5" />
                </button>
              </div>
            </li>
            {item.description && (
              <TooltipContent
                side="bottom"
                align="start"
                sideOffset={10}
                collisionPadding={12}
                showArrow={false}
                className="w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-3.5 text-left text-slate-700 shadow-xl shadow-slate-950/10 sm:w-96"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-semibold text-slate-950">
                    {item.name}
                  </p>
                  <span className="shrink-0 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-blue-100">
                    {t(`category.${item.categoryKey}`)}
                  </span>
                </div>
                <p className="mt-2 line-clamp-6 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        ))}
      </ul>
    </section>
  );
}

export default Index;
