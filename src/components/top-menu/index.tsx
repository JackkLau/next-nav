'use client'

import React, { Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MenuData } from '@/data/left-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTranslations } from 'next-intl';
import { topMenuMapping } from '@/data/top-menu';
import LanguageSwitcher from '../LanguageSwitcher';
import * as Drawer from '@radix-ui/react-dialog';
import { faEllipsisVertical, faXmark } from '@fortawesome/free-solid-svg-icons';
import { usePathname } from 'next/navigation';
import { useFavoriteSites } from '@/lib/utils';

const submissionFormUrl = 'https://d4fj7h0wc7.feishu.cn/share/base/form/shrcnpuNuNCYDTqjqB47fbzz9yY';

function Index({ topMenu, sheetTrigger, scrolled = false }: { topMenu: MenuData[]; sheetTrigger?: React.ReactNode; scrolled?: boolean }) {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);

  return (
    <header className="flex w-full bg-transparent">
      <nav
        data-scrolled={scrolled}
        className={`mb-2 mt-1 flex w-full items-center rounded-2xl border px-2 py-1.5 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 md:mt-2 md:px-3 ${
          scrolled
            ? 'border-slate-200/80 bg-white/85 shadow-sm shadow-slate-950/5 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75'
            : 'border-white/70 bg-white/55 shadow-none backdrop-blur-md supports-[backdrop-filter]:bg-white/45'
        }`}
      >
        <div className="flex w-full items-center gap-1 lg:hidden">
          <div className="flex shrink-0 items-center">{sheetTrigger}</div>
          <div className="flex min-w-0 flex-1 items-center justify-center">
            <Link href={`/${locale}`} className="flex min-w-0 items-center gap-2 rounded-xl px-2 py-1.5 text-slate-700 transition-colors hover:text-blue-700">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 ring-1 ring-blue-100">
                <Image src="/favicon.png" alt="logo" width={24} height={24} className="size-6" />
              </span>
              <span className="truncate text-sm font-semibold tracking-tight sm:text-base">{t('site_name')}</span>
            </Link>
          </div>
          <div className="flex shrink-0 items-center">
            <Drawer.Root open={mobileActionsOpen} onOpenChange={setMobileActionsOpen}>
              <Drawer.Trigger asChild>
                <button type="button" className="flex size-11 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label={t('open_actions')}>
                  <FontAwesomeIcon icon={faEllipsisVertical} className="h-5 w-5" />
                </button>
              </Drawer.Trigger>
              <Drawer.Portal >
                <Drawer.Overlay className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-[2px]" />
                <Drawer.Content className="fixed right-0 top-0 z-[60] flex h-dvh w-[min(20rem,88vw)] flex-col overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/15 animate-in slide-in-from-right-32">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <Drawer.Title className="text-base font-semibold text-slate-950">{t('navigation_menu')}</Drawer.Title>
                      <Drawer.Description className="mt-1 text-xs text-slate-500">{t('navigation_menu_desc')}</Drawer.Description>
                    </div>
                  <Drawer.Close asChild>
                    <button type="button" className="flex size-11 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950" aria-label={t('close_menu')}>
                      <FontAwesomeIcon icon={faXmark} className="size-5" />
                    </button>
                  </Drawer.Close>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {topMenu.map((item) => (
                      <TopMenuItem
                        key={item.id}
                        item={item}
                        locale={locale}
                        mobile
                        onNavigate={() => setMobileActionsOpen(false)}
                      />
                    ))}
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <Suspense fallback={<LanguageSwitcherFallback fullWidth />}>
                        <LanguageSwitcher fullWidth />
                      </Suspense>
                    </div>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          </div>
        </div>
        <div className="hidden w-full items-center gap-1 lg:flex">
          {topMenu.map((item) => (
            <TopMenuItem key={item.id} item={item} locale={locale} />
          ))}
          <div className="ml-auto flex items-center">
            <Suspense fallback={<LanguageSwitcherFallback />}>
              <LanguageSwitcher />
            </Suspense>
          </div>
        </div>
      </nav>
    </header>
  );
}


function TopMenuItem({item, locale, mobile = false, onNavigate}: {item: MenuData, locale: string, mobile?: boolean, onNavigate?: () => void}) {
  const t = useTranslations();
  const pathname = usePathname();
  const isHome = pathname === `/${locale}`;
  const isFavorites = pathname === `/${locale}/favorites`;
  const isPrimary = item.name === 'submit_collection';
  const itemClass = `inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
    mobile ? 'w-full justify-start min-h-12' : ''
  } ${
    isPrimary
      ? 'bg-slate-900 text-white hover:bg-slate-800'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
  }`;

  return (
    <div key={item.id} className={mobile ? 'flex w-full' : 'flex items-center'}>
    {item.name === 'home' &&
      <Link href={`/${locale}`} onClick={onNavigate} aria-current={isHome ? 'page' : undefined} className={`${itemClass} ${isHome ? 'bg-blue-50 text-blue-700' : ''}`}>
        <FontAwesomeIcon icon={item.icon} className="size-3.5" />
        <span>{t(`top_menu.${topMenuMapping[item.name]}`)}</span>
      </Link>}
    {item.name === 'favorite' &&
      <FavoriteMenuLink
        item={item}
        locale={locale}
        onNavigate={onNavigate}
        active={isFavorites}
        className={itemClass}
      />
    }
    {item.name === 'submit_collection' &&
      <a
        href={submissionFormUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className={itemClass}
      >
        <FontAwesomeIcon icon={item.icon} className="size-3.5" />
        <span>{t(`top_menu.${topMenuMapping[item.name]}`)}</span>
      </a>
    }
    {item.name === 'follow_me' &&
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className={itemClass}>
            <FontAwesomeIcon icon={item.icon} className="size-3.5" />
            <span>{t(`top_menu.${topMenuMapping[item.name]}`)}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="z-[70] flex w-56 flex-col items-center rounded-2xl border-slate-200 p-3 text-sm text-slate-600 shadow-xl shadow-slate-950/10">
          <p className="mb-2 font-medium text-slate-800">{t('top_menu.more_value_content')}</p>
          <Image
            src="/qrcode.png"
            alt="qrcode"
            width={176}
            height={176}
            className="rounded-xl"
          />
        </PopoverContent>
      </Popover>
    }
  </div>
  )
}

function FavoriteMenuLink({
  item,
  locale,
  onNavigate,
  active,
  className,
}: {
  item: MenuData;
  locale: string;
  onNavigate?: () => void;
  active: boolean;
  className: string;
}) {
  const t = useTranslations();
  const {favorites} = useFavoriteSites();

  return (
    <Link
      href={`/${locale}/favorites`}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`${className} ${active ? 'bg-blue-50 text-blue-700' : ''}`}
    >
      <FontAwesomeIcon icon={item.icon} className="size-3.5" />
      <span>{t(`top_menu.${topMenuMapping[item.name as keyof typeof topMenuMapping]}`)}</span>
      {favorites.length > 0 && (
        <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 text-[11px] font-semibold text-amber-700" aria-label={t('favorites.count', {count: favorites.length})}>
          {favorites.length}
        </span>
      )}
    </Link>
  );
}

function LanguageSwitcherFallback({fullWidth = false}: {fullWidth?: boolean}) {
  return (
    <div
      className={`${fullWidth ? 'h-11 w-full' : 'ml-2 h-10 w-[118px]'} animate-pulse rounded-xl border border-slate-200 bg-white/70`}
      aria-hidden="true"
    />
  );
}

export default Index;
