'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {MenuData} from '@/data/left-menu';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';

function Index({topMenu, onMenuShow}: { topMenu: MenuData[]; onMenuShow: () => void }) {

  return (
    <div className="px-4 py-4">
      <nav>
        <ul className="flex items-center space-x-4">
          <li className="flex item-center sm:hidden text- hover:text-gray-300">
            {/*移动端菜单按钮（仅小屏幕显示）*/}
            <button onClick={onMenuShow} className="sm:hidden text- hover:text-gray-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                   xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </li>
          {topMenu.map((item) => (
            <li key={item.id} className="flex items-center  text-l text-dark">
              {item.name === '首页' &&
                  <Link href={'/'} className="flex items-center text-gray-500 hover:text-gray-700">
                      <FontAwesomeIcon icon={item.icon} className="mr-1 w-4 text-primary"/>
                      <div>{item.name}</div>
                  </Link>}
              {item.name === '收藏' &&
                  <div onClick={() => alert('欢迎添加收藏夹，请按 ctrl + D 或 command + D')}
                       className="flex items-center text-gray-500 hover:text-gray-700 cursor-pointer">
                      <FontAwesomeIcon icon={item.icon} className="mr-1 w-4 text-primary text-yellow-300"/>
                      <div>{item.name}</div>
                  </div>
              }
              {item.name === '关注我' &&
                  <Popover >
                      <PopoverTrigger>
                          <div className="flex items-center text-gray-500 hover:text-gray-700 cursor-pointer">
                              <FontAwesomeIcon icon={item.icon} className="mr-1 w-4 text-primary text-red-600"/>
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
    </div>
  );
}

export default Index;