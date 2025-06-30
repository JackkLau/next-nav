'use client'

import React from 'react';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import QRCode from 'react-qr-code';

function Index({url, size=256}: {url: string; size?: number}) {
  return (
    <Popover>
      <PopoverTrigger className={'cursor-pointer'}>
          二维码查看
      </PopoverTrigger>
      <PopoverContent className={'w-50 h-50 flex flex-col items-center text-gray-500'}>
        <QRCode size={size} style={{ height: "auto", maxWidth: "100%", width: "100%" }} value={url} />
      </PopoverContent>
    </Popover>
  );
}

export default Index;