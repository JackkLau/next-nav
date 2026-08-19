import process from 'node:process'
import { spawn } from 'node:child_process'
import { request } from 'node:http'

const port = 3107
const localOrigin = `http://127.0.0.1:${port}`
const canonicalOrigin = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://loverezhao.top'
).replace(/\/$/, '')

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${localOrigin}/robots.txt`)
      if (response.ok) return
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error('Timed out waiting for the production server')
}

async function read(path, options) {
  const response = await fetch(`${localOrigin}${path}`, options)
  const text = await response.text()
  return { response, text }
}

async function readWithHost(path, host) {
  return new Promise((resolve, reject) => {
    const req = request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        headers: { host },
      },
      (response) => {
        const chunks = []
        response.on('data', (chunk) => chunks.push(chunk))
        response.on('end', () => {
          resolve({
            response: {
              status: response.statusCode,
              headers: new Headers(response.headers),
            },
            text: Buffer.concat(chunks).toString('utf8'),
          })
        })
      },
    )
    req.on('error', reject)
    req.end()
  })
}

function redirectUrl(response) {
  const location = response.headers.get('location')
  return location ? new URL(location, localOrigin) : undefined
}

async function verify() {
  const robots = await read('/robots.txt')
  assert(robots.response.status === 200, 'robots.txt must return 200')
  assert(!robots.text.includes('Disallow: /_next/'), 'robots.txt must allow Next.js assets')
  assert(robots.text.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`), 'robots.txt sitemap origin mismatch')

  const sitemap = await read('/sitemap.xml')
  assert(sitemap.response.status === 200, 'sitemap.xml must return 200')
  assert(sitemap.text.includes(`<loc>${canonicalOrigin}/en</loc>`), 'English homepage missing from sitemap')
  assert(sitemap.text.includes(`${canonicalOrigin}/en/category/tools`), 'English category URL missing from sitemap')
  assert(sitemap.text.includes(`${canonicalOrigin}/en/github`), 'detail with reviewed English copy must be in sitemap')
  assert(!sitemap.text.includes(`${canonicalOrigin}/en/eleduck-com`), 'detail without English copy must not be in sitemap')
  assert(!sitemap.text.includes(`${canonicalOrigin}/en/category/remote`), 'thin untranslated category must not be in sitemap')
  assert(!sitemap.text.includes(`${canonicalOrigin}/en/category/mirror`), 'thin category must not be in sitemap')
  assert(!sitemap.text.includes(`${canonicalOrigin}/en/1<`), 'legacy numeric URL must not be in sitemap')
  assert(!sitemap.text.includes('/tools/nav-gen'), 'noindex tool must not be in sitemap')
  assert(!sitemap.text.includes('/zh-CN'), 'retired Simplified Chinese URLs must not be in sitemap')
  assert(!sitemap.text.includes('/zh-TW'), 'retired Traditional Chinese URLs must not be in sitemap')
  assert(!sitemap.text.includes('changefreq'), 'unsupported changefreq must not be emitted')
  assert(!sitemap.text.includes('priority'), 'unsupported priority must not be emitted')

  const root = await read('/', { redirect: 'manual' })
  assert(root.response.status === 308, 'root URL must permanently redirect')
  assert(redirectUrl(root.response)?.pathname === '/en', 'root URL must redirect to the deterministic default locale')

  for (const legacyHost of ['nav.loverezhao.top', 'www.loverezhao.top']) {
    const oldDomain = await readWithHost('/zh-CN/github', legacyHost)
    assert(
      oldDomain.response.status === 308,
      `${legacyHost} must permanently redirect (received ${oldDomain.response.status}, location ${oldDomain.response.headers.get('location') || 'none'})`,
    )
    assert(redirectUrl(oldDomain.response)?.href === `${canonicalOrigin}/en/github`, `${legacyHost} redirect target mismatch`)
  }

  const home = await read('/en')
  assert(home.response.status === 200, 'canonical homepage must return 200')
  assert(home.text.includes(`<link rel="canonical" href="${canonicalOrigin}/en"`), 'homepage canonical mismatch')
  assert(/hreflang="en"/i.test(home.text), 'homepage hreflang missing')
  assert(!home.text.includes('<meta name="robots" content="noindex'), 'canonical homepage must be indexable')
  assert(home.text.includes('Curated Website Directory'), 'keyword-focused homepage H1 is missing')
  assert(!home.text.includes('全球最大的代码托管平台'), 'legacy Chinese descriptions must not leak into English pages')

  const frenchHome = await read('/fr')
  assert(frenchHome.response.status === 200, 'non-indexable locale must remain accessible')
  assert(frenchHome.text.includes('<meta name="robots" content="noindex, follow"'), 'unreviewed locale must be noindex, follow')

  const detail = await read('/en/github')
  assert(detail.response.status === 200, 'stable detail page must return 200')
  assert(detail.text.includes(`<link rel="canonical" href="${canonicalOrigin}/en/github"`), 'detail canonical mismatch')
  assert(!detail.text.includes('<meta name="robots" content="noindex'), 'detail with reviewed English copy must be indexable')

  const untranslatedDetail = await read('/en/eleduck-com')
  assert(untranslatedDetail.response.status === 200, 'untranslated detail page must remain accessible')
  assert(untranslatedDetail.text.includes('<meta name="robots" content="noindex, follow"'), 'detail without English copy must be noindex, follow')

  const category = await read('/en/category/tools')
  assert(category.response.status === 200, 'category page must return 200')
  assert(category.text.includes(`<link rel="canonical" href="${canonicalOrigin}/en/category/tools"`), 'category canonical mismatch')
  assert(!category.text.includes('Metadata.title'), 'category metadata must be localized')
  assert(category.text.includes('Online Tools'), 'English category keyword is missing')

  const legacy = await read('/en/1', { redirect: 'manual' })
  assert(legacy.response.status === 308, 'legacy detail URL must use a permanent redirect')
  assert(legacy.response.headers.get('location') === '/en/github', 'legacy redirect target mismatch')

  for (const retiredLocale of ['zh-CN', 'zh-TW']) {
    const retired = await read(`/${retiredLocale}/github`, { redirect: 'manual' })
    assert(retired.response.status === 308, `${retiredLocale} URL must use a permanent redirect`)
    assert(redirectUrl(retired.response)?.pathname === '/en/github', `${retiredLocale} redirect target mismatch`)
  }

  const invalid = await read('/en/not-a-real-site', { redirect: 'manual' })
  assert(invalid.response.status === 404, 'invalid detail URL must return 404')

  const invalidCategory = await read('/en/category/not-a-real-category', { redirect: 'manual' })
  assert(invalidCategory.response.status === 404, 'invalid category URL must return 404')

  const tool = await read('/en/tools/nav-gen')
  assert(tool.response.status === 200, 'data editor must remain accessible')
  assert(tool.text.includes('<meta name="robots" content="noindex, nofollow"'), 'data editor must be noindex')

  console.log('Verified English indexing, retired locale redirects, sitemap, canonicals, domain redirects, and 404 behavior.')
}

const server = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', String(port)],
  {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  },
)

server.stdout.on('data', (chunk) => process.stdout.write(chunk))
server.stderr.on('data', (chunk) => process.stderr.write(chunk))

try {
  await waitForServer()
  await verify()
} finally {
  server.kill('SIGTERM')
}
