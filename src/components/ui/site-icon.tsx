"use client"

import Image from 'next/image'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage } from '@fortawesome/free-solid-svg-icons'

interface SiteIconProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function SiteIcon({ src, alt, size = 'md', className = '' }: SiteIconProps) {
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
          alt={alt}
          width={size === 'lg' ? 96 : size === 'md' ? 48 : 32}
          height={size === 'lg' ? 96 : size === 'md' ? 48 : 32}
          className={`${sizeClasses[size]} rounded-lg object-contain bg-white border border-gray-200 shadow-sm`}
          onError={handleImageError}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center`}>
          <FontAwesomeIcon icon={faImage} className="w-1/2 h-1/2 text-gray-400" />
        </div>
      )}
    </div>
  )
} 