import type { Metadata } from 'next';
import MyFavoritesClient from '@/components/my-favorites/client-wrapper';
import { getPublishedSiteDirectory } from '@/lib/published-sites';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type FavoritesPageProps = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: FavoritesPageProps): Promise<Metadata> {
  const {locale} = await params;
  const metadata = await getTranslations({locale, namespace: 'Metadata'});
  const t = await getTranslations({locale});

  return {
    title: `${t('favorites.title')} | ${metadata('site_name')}`,
    description: t('favorites.description'),
    robots: {index: false, follow: true},
  };
}

export default async function FavoritesPage({params}: FavoritesPageProps) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations({locale});
  const directory = await getPublishedSiteDirectory(locale);

  return (
    <main className="flex min-h-full w-full bg-transparent">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col px-1 pb-6 pt-3 sm:px-2 md:pt-5">
        <header className="px-2 pb-5 text-center">
          <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-amber-400" aria-hidden="true" />
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-slate-950 md:text-3xl">
            {t('favorites.title')}
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-[15px]">
            {t('favorites.description')}
          </p>
        </header>
        <MyFavoritesClient navItems={directory.items} />
      </div>
    </main>
  );
}
