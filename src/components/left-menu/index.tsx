'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { leftMenu } from '@/data/left-menu';
import { getCategorySlug } from '@/lib/category';
import { useTranslations } from 'next-intl';
import { CategoryMapping } from '@/data/navigation';


function LeftMenu() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  let currentCategorySlug = '';
  if (pathname.startsWith('/category/')) {
    currentCategorySlug = decodeURIComponent(pathname.replace('/category/', ''));
  }
  const isHome = pathname === `/${locale}`;

  return (
    <nav className="w-full mt-2">
      <ul className="w-full px-2">
        {leftMenu.map((item) => {
          const slug = getCategorySlug(item.name);
          const href = isHome ? `/${locale}/#${item.name}` : `/${locale}/category/${slug}`;
          // 首页高亮：锚点hash和菜单名匹配，分类页高亮：slug匹配
          let isActive = false;
          if (typeof window !== 'undefined' && isHome) {
            isActive = window.location.hash === `#${item.name}`;
          } else if (!isHome) {
            isActive = currentCategorySlug === slug;
          }
          return (
            <li key={item.id}>
              <Link
                href={href}
                scroll={isHome}
                className={`flex items-center gap-3 hover:text-primary hover:bg-blue-50 ${isActive ? 'text-primary bg-blue-50 font-bold' : 'text-gray-700'} px-4 py-3 rounded-xl transition-all text-base`}
              >
                <FontAwesomeIcon icon={item.icon} className="w-5 h-5"/>
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