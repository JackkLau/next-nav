import { useFavoriteSites } from '@/lib/utils';
import type { NavigationItem } from '@/data/navigation';
import NaviItem from '@/components/navi-item';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

export default function MyFavorites({ navItems }: { navItems: NavigationItem[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const { favorites } = useFavoriteSites();
  const sitesById = new Map(navItems.map((site) => [site.id, site]));
  const favoriteSites = favorites.flatMap((id) => {
    const site = sitesById.get(id);
    return site ? [site] : [];
  });

  if (favoriteSites.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white/75 px-5 py-12 text-center" aria-labelledby="favorites-empty-heading">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 ring-1 ring-amber-100" aria-hidden="true">
          <Star className="size-5" />
        </span>
        <h2 id="favorites-empty-heading" className="mt-4 text-base font-semibold text-slate-900">
          {t('favorites.empty_title')}
        </h2>
        <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
          {t('favorites.empty_description')}
        </p>
        <Link
          href={`/${locale}`}
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          {t('favorites.browse_sites')}
        </Link>
      </section>
    );
  }

  return (
    <section aria-labelledby="favorites-list-heading">
      <h2 id="favorites-list-heading" className="mb-3 text-sm font-medium text-slate-500" aria-live="polite">
        {t('favorites.count', {count: favoriteSites.length})}
      </h2>
      <NaviItem
        navItems={favoriteSites}
        title="favorites-list-heading"
        showAll
        hideTitle
        gridCols={4}
      />
    </section>
  );
}
