'use client'

import React, {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import Image from 'next/image';
import {leftMenu} from '@/data/left-menu';
import {topMenu} from '@/data/top-menu';
import TopMenu from '@/components/top-menu';

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
                <Link href={'#' + item.name} className={`flex items-center hover:text-primary  ${menuId === item.id ? 'text-primary': 'text-gray-500'}`}>
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
        <TopMenu topMenu={topMenu} />
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