'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {MenuData} from '@/data/left-menu';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';

function Index({topMenu, sheetTrigger}: { topMenu: MenuData[]; sheetTrigger?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 w-full flex bg-transparent">
      <nav className=" md:w-11/12 w-full mx-auto bg-white/90 backdrop-blur rounded-xl shadow-md px-4 py-3 mt-4 mb-2 flex items-center justify-start">
        <ul className="flex items-center w-full space-x-2">
          {/* 移动端菜单按钮（汉堡按钮） */}
          <li className="flex items-center md:hidden">{sheetTrigger}</li>
          {topMenu.map((item) => (
            <li key={item.id} className="flex items-center text-l text-dark">
              {item.name === '首页' &&
                  <Link href={'/'} className="flex items-center text-gray-500 hover:text-blue-700 font-semibold px-3 py-2 rounded-lg transition-colors">
                      <FontAwesomeIcon icon={item.icon} className="mr-1 w-4 text-primary"/>
                      <div>{item.name}</div>
                  </Link>}
              {item.name === '收藏' &&
                  <div onClick={() => alert('欢迎添加收藏夹，请按 ctrl + D 或 command + D')}
                       className="flex items-center text-gray-500 hover:text-yellow-500 cursor-pointer font-semibold px-3 py-2 rounded-lg transition-colors">
                      <FontAwesomeIcon icon={item.icon} className="mr-1 w-4 text-yellow-400"/>
                      <div>{item.name}</div>
                  </div>
              }
              {item.name === '关注我' &&
                  <Popover >
                      <PopoverTrigger>
                          <div className="flex items-center text-gray-500 hover:text-red-600 cursor-pointer font-semibold px-3 py-2 rounded-lg transition-colors">
                              <FontAwesomeIcon icon={item.icon} className="mr-1 w-4 text-red-600"/>
                              <div>{item.name}</div>
                          </div>
                      </PopoverTrigger>
                      <PopoverContent className={'w-50 h-55 flex flex-col items-center text-gray-500'}>
                          发现更多有价值内容
                          <Image
                              src="/qrcode.png"
                              alt="qrcode"
                              width={200}
                              height={200}
                              ></Image>
                      </PopoverContent>
                  </Popover>
              }
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export default Index;