"use client"

import Image from 'next/image'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { buildSiteIconSources, siteIconInitials } from '@/lib/site-icon'

interface SiteIconProps {
  src?: string
  siteUrl?: string
  alt: string
  size?: 'sm' | 'card' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'size-8',
  card: 'size-11',
  md: 'size-12',
  lg: 'size-20 md:size-24',
}

const pixelSizes = {
  sm: 32,
  card: 44,
  md: 48,
  lg: 96,
}

const textClasses = {
  sm: 'text-[10px]',
  card: 'text-xs',
  md: 'text-sm',
  lg: 'text-xl',
}

export default function SiteIcon({
  src,
  siteUrl,
  alt,
  size = 'md',
  className = '',
}: SiteIconProps) {
  const t = useTranslations()
  const [sourceIndex, setSourceIndex] = useState(0)
  const sources = buildSiteIconSources(src, siteUrl)
  const currentSource = sources[sourceIndex]
  const accessibleLabel = `${alt} ${t('site_icon')}`

  return (
    <div className={`relative shrink-0 ${className}`}>
      {currentSource ? (
        <Image
          key={currentSource}
          src={currentSource}
          alt={accessibleLabel}
          width={pixelSizes[size]}
          height={pixelSizes[size]}
          unoptimized={currentSource.startsWith('http')}
          referrerPolicy="no-referrer"
          className={`${sizeClasses[size]} rounded-xl border border-slate-200/80 bg-white object-contain p-1`}
          onError={() => setSourceIndex((current) => current + 1)}
        />
      ) : (
        <div
          role="img"
          aria-label={accessibleLabel}
          className={`${sizeClasses[size]} ${textClasses[size]} flex select-none items-center justify-center rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-slate-100 font-bold tracking-tight text-blue-600`}
        >
          {siteIconInitials(alt)}
        </div>
      )}
    </div>
  )
}
