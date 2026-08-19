import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { localizedUrl } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  return {
    title: 'Navigation data editor',
    alternates: {
      canonical: localizedUrl(locale, '/tools/nav-gen'),
    },
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default function NavGeneratorLayout({ children }: { children: ReactNode }) {
  return children
}
