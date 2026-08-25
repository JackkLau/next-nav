import assert from 'node:assert/strict'
import test from 'node:test'
import { getGiscusConfig } from './giscus'

test('returns a complete, normalized giscus configuration', () => {
  assert.deepEqual(
    getGiscusConfig({
      NEXT_PUBLIC_GISCUS_REPO: ' JackkLau/next-nav-comments ',
      NEXT_PUBLIC_GISCUS_REPO_ID: ' R_example ',
      NEXT_PUBLIC_GISCUS_CATEGORY: ' Comments ',
      NEXT_PUBLIC_GISCUS_CATEGORY_ID: ' DIC_example ',
    }),
    {
      repo: 'JackkLau/next-nav-comments',
      repoId: 'R_example',
      category: 'Comments',
      categoryId: 'DIC_example',
    },
  )
})

test('does not enable giscus with missing or malformed public configuration', () => {
  assert.equal(getGiscusConfig({}), null)
  assert.equal(
    getGiscusConfig({
      NEXT_PUBLIC_GISCUS_REPO: 'next-nav-comments',
      NEXT_PUBLIC_GISCUS_REPO_ID: 'R_example',
      NEXT_PUBLIC_GISCUS_CATEGORY: 'Comments',
      NEXT_PUBLIC_GISCUS_CATEGORY_ID: 'DIC_example',
    }),
    null,
  )
})
