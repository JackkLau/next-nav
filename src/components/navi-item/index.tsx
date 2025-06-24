import React from 'react';
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip';
import Link from 'next/link';
import {NavigationItem} from '@/data/navigation';
import Image from 'next/image';

function Index({navItems, title}: {navItems: NavigationItem[], title: string}) {
  return (
    <div >
      <h2 className="text-xl font-bold text-dark">{title}</h2>
      <ul  className="flex flex-wrap justify-start items-center mt-2 gap-8">
        {navItems.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <li  className="mb-4 w-60 h-20 bg-gray-100 shadow hover:shadow cursor-pointer">
                <Link  href={'/detail/' + item.id}>
                  <div className={"flex justify-start items-center w-full h-full"}>
                    <Image
                      width={50}
                      height={50}
                      src={item.imgUrl ? item.imgUrl : '/images/eleduck.png'}
                      alt={item.name}
                      className="ml-2  rounded-full object-cover"
                    />
                    <div className="flex flex-col justify-start items-start ml-2">
                      <p className="w-42 mb-1 text-md font-medium truncate">{item.name}</p>
                      <p className="w-42 text-xs line-clamp-2 ">{item.description}</p>
                    </div>
                  </div>
                </Link>
              </li>
            </TooltipTrigger>
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