'use client'

import React from 'react';
import {faCompass, faStar} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import Image from 'next/image';
import {leftMenu} from '@/data/left-menu';
import {topMenu} from '@/data/top-menu';

function Index({children}: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full">
      {/*左侧导航*/}
      <div className="md:flex hidden flex-col items-center justify-start w-40 bg-gray-100 sticky ">
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
          <ul className="w-24 mx-6">
            {leftMenu.map((item) => (
              <li key={item.id} className="mb-2 text-l text-dark">
                <Link href={'#' + item.name} className="text-gray-500 hover:text-gray-700">
                    <FontAwesomeIcon icon={faCompass} className="mr-2 text-primary "/>
                    {item.name}
                </Link>
              </li>))}
          </ul>
        </nav>
      </div>
      {/*右侧内容*/}
      <div className="flex-grow flex flex-col ">
        {/*顶部导航*/}
        <div className="px-4 py-4 sticky ">
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
              <li class="sm:hidden text- hover:text-gray-300">
                {/*移动端菜单按钮（仅小屏幕显示）*/}
                <button class="sm:hidden text- hover:text-gray-300">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                </button>
              </li>
              {topMenu.map((item) => (
                <li key={item.id} className="mb-2 text-l text-dark">
                  {item.name !== '收藏' && <Link href={'#' + item.name} className="text-gray-500 hover:text-gray-700">
                      <FontAwesomeIcon icon={faCompass} className="mr-2 text-primary"/>
                    {item.name}
                  </Link>}
                  {item.name === '收藏' &&
                      <Link href={'#' + item.name} onClick={() => alert("欢迎添加收藏夹，请按 ctrl + D 或 command + D")} className="text-gray-500 hover:text-gray-700">
                          <FontAwesomeIcon icon={faStar} className="mr-2 text-primary text-yellow-300"/>
                        {item.name}
                      </Link>
                  }

                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/*主内容区*/}
        <main>
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