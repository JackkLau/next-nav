'use client'

import React, {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import Image from 'next/image';
import {leftMenu} from '@/data/left-menu';
import {topMenu} from '@/data/top-menu';

function Index({children}: { children: React.ReactNode }) {
  const [menuId, setMenuId] = useState<string>()
  return (
    <div className="flex h-screen overflow-hidden">
      {/*左侧导航*/}
      <div className="md:flex hidden flex-col items-center justify-start min-h-full w-40 bg-gray-100 ">
        <header className="px-4 py-4 flex justify-between items-start ">
          <Link href="/">
            <h1 className="flex items-center text-xl font-bold text-dark w-full">
              <Image
                src="/favicon.png"
                alt="logo"
                width={28}
                height={28}
                className={'w-8 h-8 mr-2'}
              ></Image>
              <div>价值导航</div>
            </h1>
          </Link>
        </header>
        <nav className="w-full mt-2">
          <ul className="w-26 mx-6">
            {leftMenu.map((item) => (
              <li key={item.id} onClick={() => setMenuId(item.id)} className={`mb-2 text-lg`}>
                <Link href={'#' + item.name} className={`flex items-center hover:text-gray-800  ${menuId === item.id ? 'text-blue-500': 'text-gray-500'}`}>
                  <FontAwesomeIcon icon={item.icon} className="mr-2 w-4"/>
                  <div>{item.name}</div>
                </Link>
              </li>))}
          </ul>
        </nav>
      </div>
      {/*右侧内容*/}
      <div className="flex-grow flex flex-col min-h-full overflow-hidden">
        {/*顶部导航*/}
        <div className="px-4 py-4">
          <nav>
            <h1 className="sm:hidden flex items-center text-xl font-bold text-dark w-full mb-4">
              <Image
                src="/favicon.png"
                alt="logo"
                width={28}
                height={28}
                className={'w-8 h-8 mr-2'}
              ></Image>
              <div>价值导航</div>
            </h1>
            <ul className="flex space-x-4">
              <li className="sm:hidden text- hover:text-gray-300">
                {/*移动端菜单按钮（仅小屏幕显示）*/}
                <button className="sm:hidden text- hover:text-gray-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                       xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                </button>
              </li>
              {topMenu.map((item) => (
                <li key={item.id} className="w-16 mb-2 text-l text-dark">
                  {item.name !== '收藏' &&
                      <Link href={'/'} className="flex items-center text-gray-500 hover:text-gray-700">
                          <FontAwesomeIcon icon={item.icon} className="mr-2 w-4 text-primary"/>
                          <div>{item.name}</div>
                      </Link>}
                  {item.name === '收藏' &&
                      <div onClick={() => alert('欢迎添加收藏夹，请按 ctrl + D 或 command + D')}
                            className="flex items-center text-gray-500 hover:text-gray-700 cursor-pointer">
                          <FontAwesomeIcon icon={item.icon} className="mr-2 w-4 text-primary text-yellow-300"/>
                          <div>{item.name}</div>
                      </div>
                  }

                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/*主内容区*/}
        <main className={'flex-1 overflow-y-scroll scroll-smooth'}>
          {children}
        </main>
        {/*底部版权信息*/}
        <footer className="px-4 py-4 bg-gray-100 text-center text-gray-500">
          <p>© 2025 价值导航. All rights reserved. | 价值导航，发掘价值的导航站。</p>
        </footer>
      </div>
    </div>
  );
}

export default Index;