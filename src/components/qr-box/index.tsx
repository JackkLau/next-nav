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
        className="cursor-pointer font-medium outline-none"
        aria-label={t('qr_code_view')}
      >
        {t('qr_code_view')}
      </PopoverTrigger>
      <PopoverContent 
        className="flex size-52 flex-col items-center rounded-2xl border-slate-200 p-4 text-slate-500 shadow-xl shadow-slate-950/10"
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
