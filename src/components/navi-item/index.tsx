import React from 'react';
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip';
import Link from 'next/link';
import {NavigationItem} from '@/data/navigation';
import Image from 'next/image';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowAltCircleRight} from '@fortawesome/free-regular-svg-icons';

function Index({navItems, title}: { navItems: NavigationItem[], title: string }) {
  return (
    <section aria-labelledby={title} className="w-full">
      <div className="flex items-center justify-between mb-2 pl-2 pr-2">
        <h2 id={title} className="text-xl font-bold text-dark">{title}</h2>
        {navItems.length > 5 && (
          <Link
            href={`/category/${encodeURIComponent(title)}`}
            className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100 shadow-sm ml-2"
          >
            更多
          </Link>
        )}
      </div>
      <ul className="flex flex-col gap-2 md:gap-3 md:flex-col md:overflow-visible">
        {navItems.slice(0, 5).map((item, index) => (
          <Tooltip key={index}>
            <li
              className="relative flex items-center min-h-[84px] bg-white rounded-lg shadow hover:shadow-lg border border-gray-100 hover:border-blue-200 transition-all cursor-pointer px-2 py-2 md:px-3 md:py-2 w-full flex-shrink md:w-full md:flex-shrink">
              {item.needVPN && (
                <span
                  className="absolute top-0 right-0 z-20 px-2 py-1 text-red-500 text-xs bg-red-50 border border-red-100 rounded-tr-xl rounded-bl-md rounded-tl-none rounded-br-none translate-x-[1px] -translate-y-[1px] shadow-sm pointer-events-none select-none flex items-center"
                  aria-label="需梯子"
                >
                  <span className="pointer-events-auto">需梯子</span>
                </span>
              )}
              <TooltipTrigger asChild>
                <Link href={`/${item.id}`} className="flex items-center flex-1 min-w-0" prefetch={false}>
                  <Image className="w-12 h-12 shrink-0 bg-gray-100 rounded-lg object-contain"
                         width={48}
                         height={48}
                    src={item.imgUrl || '/favicon.png'}
                    alt={item.name}
                  />
                  <div className="flex flex-col ml-3 min-w-0">
                    <h3 className="text-md font-medium truncate text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                  </div>
                </Link>
              </TooltipTrigger>
              <Link href={item.url || '/'} target={'_blank'} title="直接访问"
                className={'ml-auto text-xl text-blue-400 hover:text-blue-600 transition-colors z-10 relative mr-1'}>
                <FontAwesomeIcon icon={faArrowAltCircleRight} />
              </Link>
            </li>
            <TooltipContent side="bottom">
              <p className={'max-w-40'}>{item.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </ul>
    </section>
  );
}

export default Index;