import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const dataPath = path.join(projectRoot, 'src/data/sites.json')
const publicRoot = path.join(projectRoot, 'public')
const allowedCategories = new Set([
  'common',
  'community',
  'tools',
  'remote',
  'personal',
  'resources',
  'mirror',
  'navigation',
  'entertainment',
  'game',
])
const allowedPageLocales = new Set([
  'en',
  'ja',
  'ko',
  'fr',
  'de',
  'es',
  'pt',
  'ru',
  'it',
])
// Legacy records can retain their true source language without exposing a route
// for that language. New records default to English.
const allowedSourceLocales = new Set([
  ...allowedPageLocales,
  'zh-CN',
  'zh-TW',
])
const allowedStatuses = new Set(['draft', 'published', 'archived'])
const removedAtPattern = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)?$/

function validate() {
  const sites = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  const errors = []
  const slugs = new Set()
  const legacyIds = new Set()
  const urls = new Set()

  if (!Array.isArray(sites)) {
    throw new Error('src/data/sites.json must contain an array')
  }

  sites.forEach((site, index) => {
    const label = `sites[${index}]${site?.slug ? ` (${site.slug})` : ''}`

    if (!site || typeof site !== 'object') {
      errors.push(`${label}: must be an object`)
      return
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(site.slug || '')) {
      errors.push(`${label}: slug must use lowercase letters, numbers, and hyphens`)
    } else if (slugs.has(site.slug)) {
      errors.push(`${label}: duplicate slug`)
    }
    slugs.add(site.slug)

    if (site.legacyId) {
      if (legacyIds.has(site.legacyId)) errors.push(`${label}: duplicate legacyId`)
      legacyIds.add(site.legacyId)
    }

    if (!site.name?.trim()) errors.push(`${label}: name is required`)
    if (!allowedCategories.has(site.category)) {
      errors.push(`${label}: unknown category "${site.category}"`)
    }
    if (!allowedSourceLocales.has(site.sourceLocale)) {
      errors.push(`${label}: unsupported sourceLocale "${site.sourceLocale}"`)
    }
    if (!allowedStatuses.has(site.status)) {
      errors.push(`${label}: unsupported status "${site.status}"`)
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(site.updatedAt || '')) {
      errors.push(`${label}: updatedAt must use YYYY-MM-DD`)
    }
    if (site.removedAt && !removedAtPattern.test(site.removedAt)) {
      errors.push(`${label}: removedAt must use YYYY-MM-DD or ISO UTC datetime`)
    }
    if (site.removalReason && !site.removedAt) {
      errors.push(`${label}: removalReason requires removedAt`)
    }
    if (site.status === 'published' && !site.description?.trim()) {
      errors.push(`${label}: published records require a description`)
    }

    try {
      const isInternalPath = typeof site.url === 'string' && site.url.startsWith('/')
      const parsedUrl = new URL(site.url, 'https://loverezhao.top')
      if (!isInternalPath && !['http:', 'https:'].includes(parsedUrl.protocol)) {
        errors.push(`${label}: url must use http or https`)
      }
      const normalizedUrl = isInternalPath ? site.url : parsedUrl.href
      if (urls.has(normalizedUrl)) errors.push(`${label}: duplicate url`)
      urls.add(normalizedUrl)
    } catch {
      errors.push(`${label}: invalid url`)
    }

    if (site.imgUrl?.startsWith('/')) {
      const imagePath = path.join(publicRoot, site.imgUrl)
      if (!fs.existsSync(imagePath)) errors.push(`${label}: missing image ${site.imgUrl}`)
    }

    if (site.translations) {
      Object.entries(site.translations).forEach(([locale, translation]) => {
        if (!allowedPageLocales.has(locale)) {
          errors.push(`${label}: unsupported translation locale "${locale}"`)
        }
        if (!translation || typeof translation !== 'object') {
          errors.push(`${label}: translation ${locale} must be an object`)
        }
      })
    }
  })

  if (errors.length) {
    console.error(`Site data validation failed with ${errors.length} error(s):`)
    errors.forEach((error) => console.error(`- ${error}`))
    process.exitCode = 1
    return
  }

  const publishedCount = sites.filter((site) => site.status === 'published').length
  console.log(`Validated ${sites.length} site records (${publishedCount} published).`)
}

validate()
