import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { spawn } from 'node:child_process'
import { request } from 'node:http'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const nextCli = path.join(projectRoot, 'node_modules/next/dist/bin/next')
const port = Number.parseInt(process.env.SEO_VERIFY_PORT || '3107', 10)
const localOrigin = `http://127.0.0.1:${port}`
const canonicalOrigin = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://loverezhao.top'
).replace(/\/$/, '')
const minimumIndexableLocalizedItems = 3
const eastAsianScriptPattern = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function hasEnglishContent(site) {
  const copy = `${site.name} ${site.description || ''}`
  const hasEnglishSourceCopy =
    (site.description?.trim().length || 0) >= 30 &&
    /[A-Za-z]/.test(copy) &&
    !eastAsianScriptPattern.test(copy)

  return site.sourceLocale === 'en' ||
    hasEnglishSourceCopy ||
    Boolean(site.translations?.en?.description)
}

function loadVerificationData() {
  const sites = JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'src/data/sites.json'), 'utf8'),
  )
  const englishMessages = JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'src/messages/en.json'), 'utf8'),
  )
  const publishedSites = sites.filter((site) => site.status === 'published')
  const indexableSites = publishedSites.filter(hasEnglishContent)
  const unindexableSite = publishedSites.find((site) => !hasEnglishContent(site))
  const legacySite = publishedSites.find((site) => site.legacyId)
  const categoryLabels = englishMessages.category
  const categoryCounts = Object.fromEntries(
    Object.keys(categoryLabels).map((category) => [
      category,
      indexableSites.filter((site) => site.category === category).length,
    ]),
  )

  return {
    publishedSites,
    indexableSite: indexableSites[0],
    unindexableSite,
    legacySite,
    categoryLabels,
    indexableCategory: Object.keys(categoryLabels).find(
      (category) => categoryCounts[category] >= minimumIndexableLocalizedItems,
    ),
    thinCategories: Object.keys(categoryLabels).filter(
      (category) => categoryCounts[category] < minimumIndexableLocalizedItems,
    ),
  }
}

function unusedValue(base, usedValues) {
  let value = base
  while (usedValues.has(value)) value += '-missing'
  return value
}

function runProductionBuild() {
  console.log('Creating a fresh production build for SEO verification...')

  return new Promise((resolve, reject) => {
    const build = spawn(process.execPath, [nextCli, 'build'], {
      cwd: projectRoot,
      env: process.env,
      stdio: 'inherit',
    })

    build.once('error', (error) => {
      reject(new Error(`Failed to start the production build: ${error.message}`))
    })
    build.once('exit', (code, signal) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(
        `Production build failed (${signal ? `signal ${signal}` : `exit code ${code}`})`,
      ))
    })
  })
}

function startProductionServer() {
  const state = { failure: undefined }
  const server = spawn(
    process.execPath,
    [nextCli, 'start', '-H', '127.0.0.1', '-p', String(port)],
    {
      cwd: projectRoot,
      env: { ...process.env, PORT: String(port) },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )

  server.stdout.on('data', (chunk) => process.stdout.write(chunk))
  server.stderr.on('data', (chunk) => process.stderr.write(chunk))
  server.once('error', (error) => {
    state.failure = new Error(`Failed to start the production server: ${error.message}`)
  })
  server.once('exit', (code, signal) => {
    state.failure ||= new Error(
      `Production server exited before becoming ready (${signal ? `signal ${signal}` : `exit code ${code}`})`,
    )
  })

  return { server, state }
}

async function waitForServer(state) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (state.failure) throw state.failure
    try {
      const response = await fetch(`${localOrigin}/robots.txt`)
      if (response.ok) return
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  if (state.failure) throw state.failure
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
  if (!location) return undefined

  const locations = location
    .split(/,\s*(?=https?:\/\/|\/)/)
    .map((value) => new URL(value, localOrigin))
  const distinctTargets = new Set(locations.map((value) => value.href))
  assert(
    distinctTargets.size === 1,
    `redirect returned conflicting locations: ${location}`,
  )
  return locations[0]
}

async function verify() {
  const {
    publishedSites,
    indexableSite,
    unindexableSite,
    legacySite,
    categoryLabels,
    indexableCategory,
    thinCategories,
  } = loadVerificationData()
  const publishedSlugs = new Set(publishedSites.map((site) => site.slug))
  const invalidSlug = unusedValue('seo-verification-missing-site', publishedSlugs)
  const invalidCategory = unusedValue(
    'seo-verification-missing-category',
    new Set(Object.keys(categoryLabels)),
  )
  const routeProbeSlug = indexableSite?.slug || publishedSites[0]?.slug || invalidSlug

  const robots = await read('/robots.txt')
  assert(robots.response.status === 200, 'robots.txt must return 200')
  assert(!robots.text.includes('Disallow: /_next/'), 'robots.txt must allow Next.js assets')
  assert(robots.text.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`), 'robots.txt sitemap origin mismatch')

  const sitemap = await read('/sitemap.xml')
  assert(sitemap.response.status === 200, 'sitemap.xml must return 200')
  assert(sitemap.text.includes(`<loc>${canonicalOrigin}/en</loc>`), 'English homepage missing from sitemap')
  if (indexableSite) {
    assert(
      sitemap.text.includes(`<loc>${canonicalOrigin}/en/${indexableSite.slug}</loc>`),
      `indexable detail /en/${indexableSite.slug} missing from sitemap`,
    )
  }
  if (unindexableSite) {
    assert(
      !sitemap.text.includes(`<loc>${canonicalOrigin}/en/${unindexableSite.slug}</loc>`),
      `untranslated detail /en/${unindexableSite.slug} must not be in sitemap`,
    )
  }
  if (indexableCategory) {
    assert(
      sitemap.text.includes(`<loc>${canonicalOrigin}/en/category/${indexableCategory}</loc>`),
      `indexable category /en/category/${indexableCategory} missing from sitemap`,
    )
  }
  for (const category of thinCategories) {
    assert(
      !sitemap.text.includes(`<loc>${canonicalOrigin}/en/category/${category}</loc>`),
      `thin category /en/category/${category} must not be in sitemap`,
    )
  }
  for (const site of publishedSites.filter((site) => site.legacyId)) {
    assert(
      !sitemap.text.includes(`<loc>${canonicalOrigin}/en/${site.legacyId}</loc>`),
      `legacy detail /en/${site.legacyId} must not be in sitemap`,
    )
  }
  assert(!sitemap.text.includes('/tools/nav-gen'), 'noindex tool must not be in sitemap')
  assert(!sitemap.text.includes('/zh-CN'), 'retired Simplified Chinese URLs must not be in sitemap')
  assert(!sitemap.text.includes('/zh-TW'), 'retired Traditional Chinese URLs must not be in sitemap')
  assert(!sitemap.text.includes('changefreq'), 'unsupported changefreq must not be emitted')
  assert(!sitemap.text.includes('priority'), 'unsupported priority must not be emitted')

  const root = await read('/', { redirect: 'manual' })
  assert(root.response.status === 308, 'root URL must permanently redirect')
  assert(redirectUrl(root.response)?.pathname === '/en', 'root URL must redirect to the deterministic default locale')

  for (const legacyHost of ['nav.loverezhao.top', 'www.loverezhao.top']) {
    const oldDomain = await readWithHost(`/zh-CN/${routeProbeSlug}`, legacyHost)
    assert(
      oldDomain.response.status === 308,
      `${legacyHost} must permanently redirect (received ${oldDomain.response.status}, location ${oldDomain.response.headers.get('location') || 'none'})`,
    )
    assert(
      redirectUrl(oldDomain.response)?.href === `${canonicalOrigin}/en/${routeProbeSlug}`,
      `${legacyHost} redirect target mismatch`,
    )
  }

  const home = await read('/en')
  assert(home.response.status === 200, 'canonical homepage must return 200')
  assert(home.text.includes(`<link rel="canonical" href="${canonicalOrigin}/en"`), 'homepage canonical mismatch')
  assert(/hreflang="en"/i.test(home.text), 'homepage hreflang missing')
  assert(!home.text.includes('<meta name="robots" content="noindex'), 'canonical homepage must be indexable')
  assert(home.text.includes('Curated Website Directory'), 'keyword-focused homepage H1 is missing')

  const frenchHome = await read('/fr')
  assert(frenchHome.response.status === 200, 'non-indexable locale must remain accessible')
  assert(frenchHome.text.includes('<meta name="robots" content="noindex, follow"'), 'unreviewed locale must be noindex, follow')

  if (indexableSite) {
    const detailPath = `/en/${indexableSite.slug}`
    const detail = await read(detailPath)
    assert(detail.response.status === 200, `indexable detail ${detailPath} must return 200`)
    assert(
      detail.text.includes(`<link rel="canonical" href="${canonicalOrigin}${detailPath}"`),
      `canonical mismatch for ${detailPath}`,
    )
    assert(
      !detail.text.includes('<meta name="robots" content="noindex'),
      `detail ${detailPath} with English copy must be indexable`,
    )
  }

  if (unindexableSite) {
    const untranslatedPath = `/en/${unindexableSite.slug}`
    const untranslatedDetail = await read(untranslatedPath)
    assert(
      untranslatedDetail.response.status === 200,
      `untranslated detail ${untranslatedPath} must remain accessible`,
    )
    assert(
      untranslatedDetail.text.includes('<meta name="robots" content="noindex, follow"'),
      `detail ${untranslatedPath} without English copy must be noindex, follow`,
    )
  }

  if (indexableCategory) {
    const categoryPath = `/en/category/${indexableCategory}`
    const category = await read(categoryPath)
    assert(category.response.status === 200, `category ${categoryPath} must return 200`)
    assert(
      category.text.includes(`<link rel="canonical" href="${canonicalOrigin}${categoryPath}"`),
      `canonical mismatch for ${categoryPath}`,
    )
    assert(!category.text.includes('Metadata.title'), 'category metadata must be localized')
    assert(
      category.text.includes(categoryLabels[indexableCategory]),
      `English category label missing from ${categoryPath}`,
    )
  }

  if (thinCategories.length) {
    const thinCategoryPath = `/en/category/${thinCategories[0]}`
    const thinCategory = await read(thinCategoryPath)
    assert(thinCategory.response.status === 200, `thin category ${thinCategoryPath} must return 200`)
    assert(
      thinCategory.text.includes('<meta name="robots" content="noindex, follow"'),
      `thin category ${thinCategoryPath} must be noindex, follow`,
    )
  }

  if (legacySite) {
    const legacyPath = `/en/${legacySite.legacyId}`
    const legacy = await read(legacyPath, { redirect: 'manual' })
    const legacyLocation = legacy.response.headers.get('location')
    const expectedLegacyTarget = `/en/${legacySite.slug}`

    assert(
      legacy.response.status === 308,
      `legacy detail ${legacyPath} must use a permanent redirect, received ${legacy.response.status}`,
    )
    assert(
      redirectUrl(legacy.response)?.pathname === expectedLegacyTarget,
      `legacy redirect target mismatch: expected ${expectedLegacyTarget}, received ${legacyLocation || 'none'}`,
    )
  }

  for (const retiredLocale of ['zh-CN', 'zh-TW']) {
    const retired = await read(`/${retiredLocale}/${routeProbeSlug}`, { redirect: 'manual' })
    assert(retired.response.status === 308, `${retiredLocale} URL must use a permanent redirect`)
    assert(
      redirectUrl(retired.response)?.pathname === `/en/${routeProbeSlug}`,
      `${retiredLocale} redirect target mismatch`,
    )
  }

  const invalid = await read(`/en/${invalidSlug}`, { redirect: 'manual' })
  assert(invalid.response.status === 404, 'invalid detail URL must return 404')

  const invalidCategoryResponse = await read(`/en/category/${invalidCategory}`, { redirect: 'manual' })
  assert(invalidCategoryResponse.response.status === 404, 'invalid category URL must return 404')

  const tool = await read('/en/tools/nav-gen')
  assert(tool.response.status === 200, 'data editor must remain accessible')
  assert(tool.text.includes('<meta name="robots" content="noindex, nofollow"'), 'data editor must be noindex')

  console.log('Verified English indexing, retired locale redirects, sitemap, canonicals, domain redirects, and 404 behavior.')
}

assert(Number.isInteger(port) && port > 0 && port <= 65535, 'SEO_VERIFY_PORT must be a valid port')

if (!process.argv.includes('--skip-build')) {
  await runProductionBuild()
}

const { server, state } = startProductionServer()

try {
  await waitForServer(state)
  await verify()
} finally {
  if (server.exitCode === null && server.signalCode === null) {
    server.kill('SIGTERM')
  }
}
