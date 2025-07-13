'use client'

import React from 'react';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import QRCode from 'react-qr-code';

function Index({url, size=256}: {url: string; size?: number}) {
  return (
    <Popover>
      <PopoverTrigger 
        className={'cursor-pointer'}
        aria-label="查看二维码"
      >
        二维码查看
      </PopoverTrigger>
      <PopoverContent 
        className={'w-50 h-50 flex flex-col items-center text-gray-500'}
        aria-label="二维码"
      >
        <QRCode 
          size={size} 
          style={{ height: "auto", maxWidth: "100%", width: "100%" }} 
          value={url}
          aria-label={`${url} 的二维码`}
        />
      </PopoverContent>
    </Popover>
  );
}

export default Index;