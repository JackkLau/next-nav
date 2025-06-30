import React from 'react';
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip';
import Link from 'next/link';
import {NavigationItem} from '@/data/navigation';
import Image from 'next/image';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowAltCircleRight} from '@fortawesome/free-regular-svg-icons';

function Index({navItems, title}: { navItems: NavigationItem[], title: string }) {
  return (
    <div>
      <h2 id={title} className="text-xl font-bold text-dark">{title}</h2>
      <ul className="md:flex  flex-wrap justify-start items-center mt-2 gap-x-8 gap-y-1">
        {navItems.map((item, index) => (
          <Tooltip key={index}>
            <li
              className="relative mb-4 md:w-70 w-full h-24 bg-gray-50 shadow hover:shadow-xl hover:bg-gray-100 cursor-pointer">
              <TooltipTrigger asChild>
                <Link href={`/${item.id}`} target={'_blank'}>
                  <div className={'flex justify-start items-center w-full h-full'}>
                    <Image className="w-12 shrink-0 ml-2 bg-gray-100 rounded-full"
                           width={50}
                           height={50}
                      src={item.imgUrl || '/favicon.png'}
                      alt={item.name}
                    />
                    <div className="flex flex-col ml-2">
                      <h2 className="max-w-[160] mb-1 text-md font-medium truncate">{item.name}</h2>
                      <p className="max-w-[250] text-sm line-clamp-2 ">{item.description}</p>
                    </div>

                  </div>
                </Link>
              </TooltipTrigger>
              <Link href={item.url || '/'} target={'_blank'} title="直接访问"
                    className={'absolute right-0 top-1/2 -translate-y-1/2  w-[45] ml-auto text-3xl font-light text-right text-gray-400'}>
                <FontAwesomeIcon icon={faArrowAltCircleRight} className="mr-2"/>
              </Link>
              {item.needVPN && (
                <Link href={'https://y-too.com/aff.php?aff=6690'} target="_blank"
                      className="absolute right-0 top-0 border px-2 py-1 text-red-500 text-xs hover:bg-blue-300 hover:bg-opacity-75 hover:text-white">
                  需梯子
                </Link>
              )}


            </li>

            <TooltipContent side="bottom">
              <p className={'max-w-40'}>{item.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </ul>
    </div>
  );
}

export default Index;