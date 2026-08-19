"use client"

import Image from 'next/image'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage } from '@fortawesome/free-solid-svg-icons'
import { useTranslations } from 'next-intl'
interface SiteIconProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function SiteIcon({ src, alt, size = 'md', className = '' }: SiteIconProps) {
  const t = useTranslations()
  const [imageError, setImageError] = useState(false)
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-20 h-20 md:w-24 md:h-24'
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className={`flex-shrink-0 relative ${className}`}>
      {!imageError && src ? (
        <Image
          src={src}
          alt={`${alt} ${t('site_icon')}`}  
          width={size === 'lg' ? 96 : size === 'md' ? 48 : 32}
          height={size === 'lg' ? 96 : size === 'md' ? 48 : 32}
          className={`${sizeClasses[size]} rounded-xl border border-slate-200/80 bg-white object-contain p-1`}
          onError={handleImageError}
        />
      ) : (
        <div className={`${sizeClasses[size]} flex items-center justify-center rounded-xl border border-slate-200/80 bg-slate-100`}>
          <FontAwesomeIcon icon={faImage} className="h-1/2 w-1/2 text-slate-400" />
        </div>
      )}
    </div>
  )
}
