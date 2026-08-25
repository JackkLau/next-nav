'use client'

import Giscus from '@giscus/react'
import type { GiscusConfig } from '@/lib/giscus'

type GiscusCommentsProps = {
  config: GiscusConfig
  locale: string
  siteSlug: string
}

export default function GiscusComments({
  config,
  locale,
  siteSlug,
}: GiscusCommentsProps) {
  return (
    <Giscus
      id="site-comments"
      repo={config.repo}
      repoId={config.repoId}
      category={config.category}
      categoryId={config.categoryId}
      mapping="specific"
      term={`site:${siteSlug}`}
      strict="1"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="light"
      lang={locale}
      loading="lazy"
    />
  )
}
