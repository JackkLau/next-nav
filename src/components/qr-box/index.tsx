'use client'

import React from 'react';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import QRCode from 'react-qr-code';
import { useTranslations } from 'next-intl';

function Index({url, size=256}: {url: string; size?: number}) {
  const t = useTranslations();
  return (
    <Popover>
      <PopoverTrigger 
        className={'cursor-pointer'}
        aria-label={t('qr_code_view')}
      >
        {t('qr_code_view')}
      </PopoverTrigger>
      <PopoverContent 
        className={'w-50 h-50 flex flex-col items-center text-gray-500'}
        aria-label={t('qr_code_view')}
      >
        <QRCode 
          size={size} 
          style={{ height: "auto", maxWidth: "100%", width: "100%" }} 
          value={url}
          aria-label={`${url} ${t('qr_code_view')}`}
        />
      </PopoverContent>
    </Popover>
  );
}

export default Index;