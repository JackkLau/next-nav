'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {topMenu} from '@/data/top-menu';
import TopMenu from '@/components/top-menu';
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from '@/components/ui/sheet';
import LeftMenu from '@/components/left-menu';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

function Index({children}: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const t = useTranslations();
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [contentScrolled, setContentScrolled] = useState(false);

  const handleContentScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const nextScrolled = event.currentTarget.scrollTop > 12;
    setContentScrolled((current) => current === nextScrolled ? current : nextScrolled);
  };

  return (
    <div className="relative flex h-dvh min-h-0 overflow-hidden bg-slate-50 text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_28rem)]" aria-hidden="true" />
      {/* 移动端 Sheet 抽屉菜单 */}
      <Sheet open={mobileNavigationOpen} onOpenChange={setMobileNavigationOpen}>
        <SheetContent
          side="left"
          className="h-dvh w-[min(19rem,88vw)] max-w-none gap-0 overflow-y-auto border-r border-slate-200/80 bg-white p-0 shadow-none lg:hidden"
        >
          <SheetTitle className="sr-only">{t('navigation_menu')}</SheetTitle>
          {/* 左侧菜单内容 */}
          <header className="flex w-full items-start justify-between border-b border-slate-100 px-5 py-5 pr-12">
            <Link href={`/${locale}`} className="w-full" onClick={() => setMobileNavigationOpen(false)}>
              <div className="flex w-full min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100">
                  <Image
                    src="/favicon.png"
                    alt="logo"
                    width={30}
                    height={30}
                    className="size-7"
                  />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold tracking-tight text-slate-950">{t('site_name')}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{t('navigation_menu')}</div>
                </div>
              </div>
            </Link>
          </header>
          <LeftMenu onNavigate={() => setMobileNavigationOpen(false)} />
        </SheetContent>
        {/* 右侧内容区 */}
        <div className="relative z-10 flex min-h-0 w-full max-w-none flex-1 flex-col overflow-hidden lg:ml-60">
          {/*主内容区*/}
          <div
            className="mx-auto min-h-0 w-full flex-1 overflow-y-auto overscroll-contain scroll-smooth px-2 pb-3 pt-1 sm:px-3 md:px-5 md:pb-5 md:pt-2"
            onScroll={handleContentScroll}
          >
            {/* 顶部导航置于滚动容器内，滚动后内容会经过毛玻璃层下方。 */}
            <div className="sticky top-0 z-40 pt-[env(safe-area-inset-top)]">
              <TopMenu
                topMenu={topMenu}
                scrolled={contentScrolled}
                sheetTrigger={
                  <SheetTrigger asChild>
                    <button
                      className="flex size-11 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
                      aria-label={t('open_menu')}
                      type="button"
                    >
                      <span className="sr-only">{t('open_menu')}</span>
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                    </button>
                  </SheetTrigger>
                }
              />
            </div>
            {children}
          </div>
          {/*底部版权信息*/}
          <footer className="relative z-10 shrink-0 border-t border-slate-200/70 bg-white/60 px-3 py-2 text-center text-[10px] leading-4 text-slate-500 backdrop-blur md:px-4 md:text-xs">
            <p>© {new Date().getFullYear()} {t('site_name')} · {t('site_collection_desc')}</p>
          </footer>
        </div>
      </Sheet>
      {/* 桌面端常驻菜单，固定在左侧 */}
      <aside className="fixed left-0 top-0 z-30 hidden h-dvh w-60 max-w-xs flex-col items-center justify-start overflow-hidden border-r border-slate-200/80 bg-white/80 backdrop-blur-xl lg:flex">
        <header className="flex w-full items-start justify-between border-b border-slate-100 px-4 py-4">
          <Link href={`/${locale}`} className="w-full">
            <div className="flex w-full items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100">
                <Image
                  src="/favicon.png"
                  alt="logo"
                  width={30}
                  height={30}
                  className="size-7"
                />
              </span>
              <div className="min-w-0">
                <div className="truncate text-base font-semibold tracking-tight text-slate-950">{t('site_name')}</div>
                <div className="mt-0.5 text-xs text-slate-500">{t('navigation_menu')}</div>
              </div>
            </div>
          </Link>
        </header>
        <LeftMenu />
      </aside>
    </div>
  );
}

export default Index;
