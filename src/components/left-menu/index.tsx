'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { leftMenu } from '@/data/left-menu';
import { getCategorySlug } from '@/lib/category';
import { useTranslations } from 'next-intl';
import { CategoryMapping } from '@/data/navigation';
import { useEffect, useState } from 'react';


function LeftMenu({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const pathSegments = pathname.split('/');
  const currentCategorySlug = pathSegments[2] === 'category'
    ? decodeURIComponent(pathSegments[3] || '')
    : '';
  const isHome = pathname === `/${locale}`;
  const [activeHash, setActiveHash] = useState('');

  useEffect(() => {
    const updateHash = () => setActiveHash(window.location.hash);
    updateHash();
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, [pathname]);

  return (
    <nav className="w-full flex-1 overflow-y-auto overscroll-contain px-3 py-3" aria-label={t('navigation_menu')}>
      <ul className="w-full space-y-1">
        {leftMenu.map((item) => {
          const slug = getCategorySlug(item.name);
          const href = isHome ? `/${locale}/#${item.name}` : `/${locale}/category/${slug}`;
          // 首页高亮：锚点hash和菜单名匹配，分类页高亮：slug匹配
          const isActive = isHome
            ? activeHash === `#${item.name}`
            : currentCategorySlug === slug;
          return (
            <li key={item.id}>
              <Link
                href={href}
                scroll={isHome}
                onClick={onNavigate}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex min-h-11 items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isActive ? 'bg-white text-blue-600 ring-1 ring-blue-100' : 'bg-slate-100 text-slate-500 group-hover:bg-white'
                }`}>
                  <FontAwesomeIcon icon={item.icon} className="size-3.5"/>
                </span>
                <span className="truncate">{t(`category.${CategoryMapping[item.name]}`)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default LeftMenu;
