import React from 'react';
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip';
import Link from 'next/link';
import {NavigationItem} from '@/data/navigation';
import Image from 'next/image';

function Index({navItems, title}: {navItems: NavigationItem[], title: string}) {
  return (
    <div >
      <h2 id={title} className="text-xl font-bold text-dark">{title}</h2>
      <ul  className="flex flex-wrap justify-start items-center mt-2 gap-x-8 gap-y-1">
        {navItems.map((item, index) => (
          <Tooltip key={index}>
              <li  className="relative mb-4 w-60 h-20 bg-gray-50 shadow hover:shadow-xl hover:bg-gray-100 cursor-pointer">
                <TooltipTrigger asChild>
                <Link  href={item.url} target={'_blank'} >
                  <div className={" flex justify-start items-center w-full h-full"}>
                    <div className="h-[50] flex items-center ml-2 bg-gray-100 rounded-full object-cover">
                      <Image
                        width={50}
                        height={50}
                        src={item.imgUrl ? item.imgUrl : '/favicon.png'}
                        alt={item.name}
                      />
                    </div>
                    <div className="flex flex-col justify-start items-start ml-2">
                      <p className="w-42 mb-1 text-md font-medium truncate">{item.name}</p>
                      <p className="w-42 text-xs line-clamp-2 ">{item.description}</p>
                    </div>

                  </div>
                </Link>
                </TooltipTrigger>
                {item.needVPN && (
                  <Link href={"https://y-too.com/aff.php?aff=6690"} target="_blank"
                        className="absolute right-0 top-0 border px-2 py-1 text-red-500 text-xs hover:bg-blue-300 hover:bg-opacity-75 hover:text-white" >
                    需梯子
                  </Link>
                )}
              </li>

            <TooltipContent side="bottom">
              <p className={"max-w-40"}>{item.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </ul>
    </div>
  );
}

export default Index;