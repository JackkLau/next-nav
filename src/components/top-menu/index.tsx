'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MenuData } from '@/data/left-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTranslations } from 'next-intl';
import { topMenuMapping } from '@/data/top-menu';
import LanguageSwitcher from '../LanguageSwitcher';
import * as Drawer from '@radix-ui/react-dialog';
import { faHome } from '@fortawesome/free-solid-svg-icons';

function Index({ topMenu, sheetTrigger }: { topMenu: MenuData[]; sheetTrigger?: React.ReactNode }) {
  const t = useTranslations();
  return (
    <header className="sticky top-0 z-30 w-full flex bg-transparent">
      <nav className="md:w-11/12 w-full mx-auto bg-white/90 backdrop-blur rounded-xl shadow-md px-4 py-3 mt-4 mb-2 flex items-center justify-start">
        <ul className="flex justify-start md:justify-between items-center w-full space-x-2">
          <li className="flex items-center md:hidden">{sheetTrigger}</li>
          <li className="flex-1 flex justify-center items-center md:hidden">
            <Link href={'/'} className="flex items-center text-gray-500 hover:text-blue-700 font-semibold px-3 py-2 rounded-lg transition-colors">
            <Image
                src="/favicon.png"
                alt="logo"
                width={32}
                height={32}
                className={'w-9 h-9 mr-3'}
              ></Image>
              <span>{t('site_name')}</span>
            </Link>
          </li>
          {/* 移动端菜单按钮（汉堡按钮） */}
          <li className="flex items-center md:hidden">
            <Drawer.Root>
              <Drawer.Trigger asChild>
                <button className="p-2 rounded hover:bg-gray-100" aria-label="Open menu">
                  <FontAwesomeIcon icon={faHome} className="w-6 h-6" />
                </button>
              </Drawer.Trigger>
              <Drawer.Portal >
                <Drawer.Overlay className="fixed inset-0 bg-black/30 z-40" />
                {/* 抽屉从右侧数显 */}
                
                <Drawer.Content    className="fixed top-0 right-0 h-full w-64 bg-white z-50 shadow-lg flex flex-col p-4 animate-in slide-in-from-right-32">
                  <Drawer.Close asChild>
                    <button className="self-end mb-4 p-2 rounded hover:bg-gray-100" aria-label="Close menu">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </Drawer.Close>
                  <div className="flex flex-col space-y-2">
                    {topMenu.map((item) => (
                      <TopMenuItem key={item.id} item={item} />
                    ))}
                    <div className="flex items-center mt-4"><LanguageSwitcher /></div>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          </li>
          {/* PC端菜单 */}
          <li className="hidden md:flex items-center w-full space-x-2">
            {topMenu.map((item) => (
              <TopMenuItem key={item.id} item={item} />
            ))}
            <div className="flex items-center ml-auto"><LanguageSwitcher /></div>
          </li>
        </ul>
      </nav>
    </header>
  );
}


function TopMenuItem({item}: {item: MenuData}) {
  const t = useTranslations();
  return (
    <div key={item.id} className="flex items-center text-lg">
    {item.name === '首页' &&
      <Link href={'/'} className="flex items-center text-gray-500 hover:text-blue-700 font-semibold px-3 py-2 rounded-lg transition-colors">
        <FontAwesomeIcon icon={item.icon} className="mr-1 w-4 text-primary" />
        <span>{t(`top_menu.${topMenuMapping[item.name]}`)}</span>
      </Link>}
    {item.name === '收藏' &&
      <div onClick={() => alert('欢迎添加收藏夹，请按 ctrl + D 或 command + D')}
        className="flex items-center text-gray-500 hover:text-yellow-500 cursor-pointer font-semibold px-3 py-2 rounded-lg transition-colors">
        <FontAwesomeIcon icon={item.icon} className="mr-1 w-4 text-yellow-400" />
        <span>{t(`top_menu.${topMenuMapping[item.name]}`)}</span>
      </div>
    }
    {item.name === '提交收录' &&
      <div onClick={() => window.open('https://d4fj7h0wc7.feishu.cn/share/base/form/shrcnpuNuNCYDTqjqB47fbzz9yY', '_blank')}
        className="flex items-center text-gray-500 hover:text-yellow-500 cursor-pointer font-semibold px-3 py-2 rounded-lg transition-colors">
        <FontAwesomeIcon icon={item.icon} className="mr-1 w-4 text-yellow-400" />
        <span>{t(`top_menu.${topMenuMapping[item.name]}`)}</span>
      </div>
    }
    {item.name === '关注我' &&
      <Popover>
        <PopoverTrigger>
          <div className="flex items-center text-gray-500 hover:text-red-600 cursor-pointer font-semibold px-3 py-2 rounded-lg transition-colors">
            <FontAwesomeIcon icon={item.icon} className="mr-1 w-4 text-red-600" />
            <span>{t(`top_menu.${topMenuMapping[item.name]}`)}</span>
          </div>
        </PopoverTrigger>
        <PopoverContent className={'w-50 h-55 flex flex-col items-center text-gray-500'}>
          {t('top_menu.more_value_content')}
          <Image
            src="/qrcode.png"
            alt="qrcode"
            width={200}
            height={200}
          />
        </PopoverContent>
      </Popover>
    }
  </div>
  )
}

export default Index;