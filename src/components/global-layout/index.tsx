import React from 'react';
import {faCompass} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import {leftMenu} from '@/data/left-menu';
import {topMenu} from '@/data/top-menu';

function Index({children}: {children: React.ReactNode}) {
  return (
    <div className="flex min-h-full">
      {/*左侧导航*/}
      <div className="flex flex-col items-center justify-start w-40 bg-gray-100 sticky">
        <header className="px-4 py-4 flex justify-between items-start ">
          <Link  href="/">
            <h1 className="text-xl font-bold text-dark w-full">
              <FontAwesomeIcon icon={faCompass} className="mr-2 text-2xl" />
              流苏导航
            </h1>
          </Link>
        </header>
        <nav className="w-full mt-2">
          <ul className="w-24 mx-6">
            {leftMenu.map((item, i) => (
              <li key={item.id} className="mb-2 text-l text-dark">
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  <FontAwesomeIcon icon={faCompass} className="mr-2 text-primary" />
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
            <ul className="flex space-x-4">
              {topMenu.map((item, i) => (
                <li key={item.id} className="mb-2 text-l text-dark">
                  <Link href="/" className="flex items-center text-gray-500 hover:text-gray-700">
                    <FontAwesomeIcon icon={faCompass} className="mr-2 text-primary" />
                    {item.name}
                  </Link>
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
          <p>© 2023 流苏导航. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default Index;