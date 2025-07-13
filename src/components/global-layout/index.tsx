'use client'

import React, {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import Image from 'next/image';
import {leftMenu, MenuData} from '@/data/left-menu';
import {topMenu} from '@/data/top-menu';
import TopMenu from '@/components/top-menu';
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from '@/components/ui/sheet';

function Index({children}: { children: React.ReactNode }) {
  const [menuId, setMenuId] = useState<string>()

  function handleLeftMenu(item?: MenuData) {
    setMenuId(item?.id || '')
  }

  // 菜单内容抽取为组件，便于复用
  const MenuContent = (
    <>
      <header className="px-6 py-5 flex justify-between items-start w-full">
        <Link href="/" onClick={() => handleLeftMenu()} className="w-full">
          <h1 className="flex items-center text-2xl font-bold text-dark w-full">
            <Image
              src="/favicon.png"
              alt="logo"
              width={32}
              height={32}
              className={'w-9 h-9 mr-3'}
            ></Image>
            <div>价值导航</div>
          </h1>
        </Link>
      </header>
      <nav className="w-full mt-2">
        <ul className="w-full px-2">
          {leftMenu.map((item) => (
            <li key={item.id} onClick={() => handleLeftMenu(item)} className={`mb-1`}>
              <Link href={'/#' + item.name} className={`flex items-center gap-3 hover:text-primary hover:bg-blue-50 ${menuId === item.id ? 'text-primary bg-blue-50 font-bold' : 'text-gray-700'} px-4 py-3 rounded-xl transition-all text-base`}>
                <FontAwesomeIcon icon={item.icon} className="w-5 h-5"/>
                <span className="truncate">{item.name}</span>
              </Link>
            </li>))}
        </ul>
      </nav>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 移动端 Sheet 抽屉菜单 */}
      <Sheet>
        <SheetContent side="left" className="p-0 w-64 max-w-xs md:hidden">
          <SheetTitle className="sr-only">导航菜单</SheetTitle>
          {MenuContent}
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
                    className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 focus:outline-none"
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
          <main className={'flex-1 overflow-y-scroll scroll-smooth max-w-5xl mx-auto px-2 md:px-4 py-2 md:py-4'}>
            {children}
          </main>
          {/*底部版权信息*/}
          <footer className="px-4 py-4 bg-gray-100 text-center text-gray-500">
            <p>© 2025 价值导航. All rights reserved. | 价值导航，发掘价值的导航站。</p>
          </footer>
        </div>
      </Sheet>
      {/* 桌面端常驻菜单，固定在左侧 */}
      <aside className="hidden md:fixed md:flex flex-col items-center justify-start min-h-full w-64 max-w-xs bg-white/95 backdrop-blur rounded-2xl shadow-2xl m-2 border border-gray-200 left-0 top-0 z-30">
        {MenuContent}
      </aside>
    </div>
  );
}

export default Index;