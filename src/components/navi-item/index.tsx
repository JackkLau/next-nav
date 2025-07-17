'use client';

import React from 'react';
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip';
import Link from 'next/link';
import {CategoryMapping, NavigationItem} from '@/data/navigation';
import Image from 'next/image';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowAltCircleRight, faStar} from '@fortawesome/free-regular-svg-icons';
import {faStar as faStarSolid} from '@fortawesome/free-solid-svg-icons';
import { getCategorySlug } from '@/lib/category';
import { useFavoriteSites } from '@/lib/utils';
import { useTranslations } from 'next-intl';

function Index({navItems, title, showAll, hideTitle, gridCols}: { navItems: NavigationItem[], title: string, showAll?: boolean, hideTitle?: boolean, gridCols?: number }) {
  const t = useTranslations();
  const { favorites, toggleFavorite } = useFavoriteSites();
  // 收藏的排前面
  const sortedNavItems = [...navItems].sort((a, b) => {
    const aFav = favorites.includes(a.id);
    const bFav = favorites.includes(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });
  const itemsToShow = showAll ? sortedNavItems : sortedNavItems.slice(0, 5);
  const ulClass = gridCols && gridCols > 1
    ? `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${gridCols} gap-4`
    : 'flex flex-col gap-2 md:gap-3 md:flex-col md:overflow-visible';
  return (
    <section aria-labelledby={t(`category.${title}`)} className="w-full">
      <div className="flex items-center justify-between mb-2 pl-2 pr-2">
        {!hideTitle && <h2 id={title} className="text-xl font-bold text-dark">{t(`category.${title}`)}</h2>}
        {!showAll && navItems.length > 5 && (
          <Link
            href={`/category/${getCategorySlug(title)}`}
            className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100 shadow-sm ml-2"
          >
            {t('more')}
          </Link>
        )}
      </div>
      <ul className={ulClass}>
        {itemsToShow.map((item, index) => (
          <Tooltip key={index}>
            <li
              className="relative flex items-center min-h-[84px] bg-white rounded-lg shadow hover:shadow-lg border border-gray-100 hover:border-blue-200 transition-all cursor-pointer pl-2 pr-1 py-2 md:px-3 md:py-2 w-full">
              {item.needVPN && (
                <span
                  className="absolute top-0 right-0 z-20 px-2 py-1 text-red-500 text-xs bg-red-50 border border-red-100 rounded-tr-xl rounded-bl-md rounded-tl-none rounded-br-none translate-x-[1px] -translate-y-[1px] shadow-sm pointer-events-none select-none flex items-center"
                  aria-label={t('need_vpn')}
                >
                  <span className="pointer-events-auto">{t('need_vpn')}</span>
                </span>
              )}
              <TooltipTrigger asChild>
                <Link href={`/${item.id}`} className="flex items-center flex-1 min-w-0" prefetch={false}>
                  <Image className="w-12 h-12 shrink-0 bg-gray-100 rounded-lg object-contain"
                         width={48}
                         height={48}
                    src={item.imgUrl || '/favicon.png'}
                    alt={item.name}
                  />
                  <div className="flex flex-col ml-3 min-w-0">
                    <h3 className="text-md font-medium truncate text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                  </div>
                </Link>
              </TooltipTrigger>
              {/* 卡片底部按钮区域：星星和直接访问按钮 */}
              <div className="flex flex-col items-center justify-center pt-8 ml-2">
                <Link href={item.url || '/'} target={'_blank'} title={t('direct_access')}
                  className={'text-xl text-blue-400 hover:text-blue-600 transition-colors'}>
                  <FontAwesomeIcon icon={faArrowAltCircleRight} />
                </Link>
                <button
                  className={`text-yellow-400 z-10 ${favorites.includes(item.id) ? '' : 'opacity-30'}`}
                  onClick={() => toggleFavorite(item.id)}
                  aria-label={favorites.includes(item.id) ? t('cancel_favorite') : t('add_favorite')}
                  tabIndex={0}
                >
                  <FontAwesomeIcon icon={favorites.includes(item.id) ? faStarSolid : faStar} className="w-4 h-4" />
                </button>
              
              </div>
            </li>
            <TooltipContent side="bottom">
              <p className={'max-w-40'}>{item.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </ul>
    </section>
  );
}

export default Index;