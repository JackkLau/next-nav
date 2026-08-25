import type { Repo } from '@giscus/react'

export type GiscusConfig = {
  repo: Repo
  repoId: string
  category: string
  categoryId: string
}

type GiscusEnvironment = Record<string, string | undefined>

function isRepo(value: string): value is Repo {
  const [owner, name, ...rest] = value.split('/')

  return Boolean(
    owner &&
      name &&
      rest.length === 0 &&
      !/\s/.test(owner) &&
      !/\s/.test(name),
  )
}

export function getGiscusConfig(
  environment: GiscusEnvironment = process.env,
): GiscusConfig | null {
  const repo = environment.NEXT_PUBLIC_GISCUS_REPO?.trim() ?? ''
  const repoId = environment.NEXT_PUBLIC_GISCUS_REPO_ID?.trim() ?? ''
  const category = environment.NEXT_PUBLIC_GISCUS_CATEGORY?.trim() ?? ''
  const categoryId = environment.NEXT_PUBLIC_GISCUS_CATEGORY_ID?.trim() ?? ''

  if (!isRepo(repo) || !repoId || !category || !categoryId) {
    return null
  }

  return { repo, repoId, category, categoryId }
}
