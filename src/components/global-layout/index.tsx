'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {topMenu} from '@/data/top-menu';
import TopMenu from '@/components/top-menu';
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from '@/components/ui/sheet';
import LeftMenu from '@/components/left-menu';
import { useTranslations } from 'next-intl';

function Index({children}: { children: React.ReactNode }) {
  const t = useTranslations();
  console.log(t('site_name'));
  return (
    <div className="flex h-screen overflow-hidden">
      {/* 移动端 Sheet 抽屉菜单 */}
      <Sheet>
        <SheetContent side="left" className="p-0 w-64 max-w-xs md:hidden">
          <SheetTitle className="sr-only">{t('navigation_menu')}</SheetTitle>
          {/* 左侧菜单内容 */}
          <header className="px-6 py-5 flex justify-between items-start w-full">
            <Link href="/" className="w-full">
              <h1 className="flex items-center text-2xl font-bold text-dark w-full">
                <Image
                  src="/favicon.png"
                  alt="logo"
                  width={32}
                  height={32}
                  className={'w-9 h-9 mr-3'}
                ></Image>
                <div>{t('site_name')}</div>
              </h1>
            </Link>
          </header>
          <LeftMenu />
        </SheetContent>
        {/* 右侧内容区 */}
        <div className="flex-grow flex flex-col min-h-full overflow-hidden md:ml-64 w-full max-w-none">
          {/*顶部导航*/}
          <div className="relative z-50">
            <TopMenu 
              topMenu={topMenu} 
              sheetTrigger={
                <SheetTrigger asChild>
                  <button
                    className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white shadow-xs border border-gray-200 focus:outline-none"
                    aria-label="打开菜单"
                    type="button"
                  >
                    <span className="sr-only">打开菜单</span>
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                  </button>
                </SheetTrigger>
              }
            />
          </div>
          {/*主内容区*/}
          <main className={'flex-1 overflow-y-scroll scroll-smooth mx-auto px-2 md:px-4 py-2 md:py-4'}>
            {children}
          </main>
          {/*底部版权信息*/}
          <footer className="px-4 py-4 bg-gray-100 text-center text-gray-500">
            <p>© 2025 {t('site_name')} . All rights reserved. | {t('site_collection_desc')}</p>
          </footer>
        </div>
      </Sheet>
      {/* 桌面端常驻菜单，固定在左侧 */}
      <aside className="hidden md:fixed md:flex flex-col items-center justify-start min-h-full w-64 max-w-xs bg-white/95 backdrop-blur rounded-2xl shadow-2xl m-2 border border-gray-200 left-0 top-0 z-30">
        <header className="px-6 py-5 flex justify-between items-start w-full">
          <Link href="/" className="w-full">
            <h1 className="flex items-center text-2xl font-bold text-dark w-full">
              <Image
                src="/favicon.png"
                alt="logo"
                width={32}
                height={32}
                className={'w-9 h-9 mr-3'}
              ></Image>
              <div>{t('site_name')}</div>
            </h1>
          </Link>
        </header>
        <LeftMenu />
      </aside>
    </div>
  );
}

export default Index;