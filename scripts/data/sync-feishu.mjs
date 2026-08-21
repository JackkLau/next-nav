import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const dataPath = path.join(projectRoot, 'src/data/sites.json')
const shouldWrite = process.argv.includes('--write')

const requiredEnvironment = [
  'FEISHU_APP_ID',
  'FEISHU_APP_SECRET',
  'FEISHU_BITABLE_APP_TOKEN',
  'FEISHU_BITABLE_TABLE_ID',
]
const missingEnvironment = requiredEnvironment.filter((key) => !process.env[key])
if (missingEnvironment.length) {
  throw new Error(`Missing environment variables: ${missingEnvironment.join(', ')}`)
}

const fieldNames = {
  slug: process.env.FEISHU_FIELD_SLUG || 'slug',
  name: process.env.FEISHU_FIELD_NAME || '名称',
  url: process.env.FEISHU_FIELD_URL || '网址',
  imgUrl: process.env.FEISHU_FIELD_IMAGE || '图标',
  category: process.env.FEISHU_FIELD_CATEGORY || '分类',
  favorite: process.env.FEISHU_FIELD_FAVORITE || '推荐',
  description: process.env.FEISHU_FIELD_DESCRIPTION || '描述',
  needVPN: process.env.FEISHU_FIELD_VPN || '需梯子',
  sourceLocale: process.env.FEISHU_FIELD_SOURCE_LOCALE || '原始语言',
  translations: process.env.FEISHU_FIELD_TRANSLATIONS || '翻译 JSON',
  status: process.env.FEISHU_FIELD_STATUS || '状态',
  updatedAt: process.env.FEISHU_FIELD_UPDATED_AT || '更新时间',
  removedAt: process.env.FEISHU_FIELD_REMOVED_AT || '移除时间',
  removalReason: process.env.FEISHU_FIELD_REMOVAL_REASON || '移除原因',
}

function fieldValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => fieldValue(item)).filter(Boolean).join('')
  }
  if (value && typeof value === 'object') {
    return value.link || value.text || value.name || value.value || ''
  }
  return value ?? ''
}

function booleanValue(value) {
  const normalized = String(fieldValue(value)).toLowerCase()
  return value === true || ['true', 'yes', '1', '是'].includes(normalized)
}

function createSlug(name, url) {
  const fromName = String(name)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64)
  if (fromName) return fromName

  return new URL(url).hostname
    .replace(/^www\./, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function requestJson(url, options) {
  const response = await fetch(url, options)
  const payload = await response.json()
  if (!response.ok || payload.code) {
    throw new Error(`Feishu API request failed (${response.status}): ${payload.msg || 'unknown error'}`)
  }
  return payload
}

const tokenPayload = await requestJson(
  'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      app_id: process.env.FEISHU_APP_ID,
      app_secret: process.env.FEISHU_APP_SECRET,
    }),
  },
)

const rows = []
let pageToken = ''
do {
  const endpoint = new URL(
    `https://open.feishu.cn/open-apis/bitable/v1/apps/${process.env.FEISHU_BITABLE_APP_TOKEN}/tables/${process.env.FEISHU_BITABLE_TABLE_ID}/records`,
  )
  endpoint.searchParams.set('page_size', '500')
  if (pageToken) endpoint.searchParams.set('page_token', pageToken)

  const payload = await requestJson(endpoint, {
    headers: { Authorization: `Bearer ${tokenPayload.tenant_access_token}` },
  })
  rows.push(...payload.data.items)
  pageToken = payload.data.has_more ? payload.data.page_token : ''
} while (pageToken)

const existingSites = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
const existingBySlug = new Map(existingSites.map((site) => [site.slug, site]))
const existingByUrl = new Map(existingSites.map((site) => [site.url, site]))
const today = new Date().toISOString().slice(0, 10)

const sites = rows.map((row) => {
  const fields = row.fields || {}
  const name = String(fieldValue(fields[fieldNames.name])).trim()
  const url = String(fieldValue(fields[fieldNames.url])).trim()
  const requestedSlug = String(fieldValue(fields[fieldNames.slug])).trim()
  const slug = requestedSlug || createSlug(name, url)
  const previous = existingBySlug.get(slug) || existingByUrl.get(url)
  const translationsValue = fieldValue(fields[fieldNames.translations])
  const updatedAtValue = fieldValue(fields[fieldNames.updatedAt])
  const removedAtValue = fieldValue(fields[fieldNames.removedAt])
  const removalReasonValue = fieldValue(fields[fieldNames.removalReason])

  return {
    slug,
    ...(previous?.legacyId ? { legacyId: previous.legacyId } : {}),
    name,
    url,
    ...(fieldValue(fields[fieldNames.imgUrl])
      ? { imgUrl: String(fieldValue(fields[fieldNames.imgUrl])).trim() }
      : {}),
    category: String(fieldValue(fields[fieldNames.category])).trim(),
    ...(booleanValue(fields[fieldNames.favorite]) ? { favorite: true } : {}),
    ...(fieldValue(fields[fieldNames.description])
      ? { description: String(fieldValue(fields[fieldNames.description])).trim() }
      : {}),
    ...(booleanValue(fields[fieldNames.needVPN]) ? { needVPN: true } : {}),
    sourceLocale: String(fieldValue(fields[fieldNames.sourceLocale]) || 'en').trim(),
    ...(translationsValue
      ? { translations: JSON.parse(String(translationsValue)) }
      : {}),
    status: String(fieldValue(fields[fieldNames.status]) || 'draft').trim().toLowerCase(),
    updatedAt: /^\d{4}-\d{2}-\d{2}$/.test(String(updatedAtValue))
      ? String(updatedAtValue)
      : previous?.updatedAt || today,
    ...(removedAtValue || previous?.removedAt
      ? { removedAt: String(removedAtValue || previous?.removedAt).trim() }
      : {}),
    ...(removalReasonValue || previous?.removalReason
      ? {
          removalReason: String(
            removalReasonValue || previous?.removalReason,
          ).trim(),
        }
      : {}),
  }
})

const serialized = `${JSON.stringify(sites, null, 2)}\n`
if (shouldWrite) {
  fs.writeFileSync(dataPath, serialized)
  execFileSync(process.execPath, ['scripts/data/validate-sites.mjs'], {
    cwd: projectRoot,
    stdio: 'inherit',
  })
  console.log(`Synchronized ${sites.length} Feishu records to src/data/sites.json.`)
} else {
  console.log(`Fetched and normalized ${sites.length} Feishu records.`)
  console.log('Dry run only. Re-run with --write after reviewing the field mapping.')
}
