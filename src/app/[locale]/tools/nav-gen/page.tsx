'use client'

import { useEffect, useState } from 'react'
import SiteIcon from '@/components/ui/site-icon'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Copy,
  Database,
  ExternalLink,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { CategoryMapping, CategoryType } from '@/data/navigation'
import { useTranslations } from 'next-intl'

interface MetaData {
  title?: string
  description?: string
  favicon?: string
}

interface RateLimitInfo {
  limit: number
  remaining: number
  resetAt: string
  retryAfterSeconds: number
}

interface MetaApiResponse {
  error?: string
  message?: string
  metadata?: MetaData
  rateLimit?: RateLimitInfo
  unlimited?: boolean
}

interface SiteSubmitApiResponse {
  error?: string
  message?: string
  duplicate?: boolean
  operation?: 'created' | 'updated'
  source?: 'database' | 'snapshot'
  site?: GeneratedNavItem
  rateLimit?: RateLimitInfo
  unlimited?: boolean
}

class ToolSubmissionError extends Error {
  constructor(
    readonly code: string,
    readonly retryAfterSeconds = 0,
  ) {
    super(code)
  }
}

interface GeneratedNavItem {
  slug: string
  name: string
  url: string
  imgUrl?: string
  category: string
  favorite?: boolean
  description?: string
  needVPN?: boolean
  sourceLocale: string
  status: 'published' | 'archived'
  updatedAt: string
}

function createSlug(name: string, url: string) {
  const fromName = name
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

export default function NavGenPage() {
  const t = useTranslations()
  const [password, setPassword] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('common')
  const [favorite, setFavorite] = useState(false)
  const [needVPN, setNeedVPN] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [metaData, setMetaData] = useState<MetaData>({})
  const [generatedItem, setGeneratedItem] = useState<GeneratedNavItem | null>(
    null,
  )
  const [existingSlug, setExistingSlug] = useState('')
  const [existingSource, setExistingSource] = useState<
    'database' | 'snapshot' | ''
  >('')
  const [duplicateDetected, setDuplicateDetected] = useState(false)
  const [submittedSlug, setSubmittedSlug] = useState('')
  const [submittedOperation, setSubmittedOperation] = useState<
    'created' | 'updated' | ''
  >('')
  const [remaining, setRemaining] = useState(10)
  const [retryUntil, setRetryUntil] = useState<number | null>(null)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [accessVerified, setAccessVerified] = useState(false)
  const generatedData = generatedItem
    ? JSON.stringify(generatedItem, null, 2)
    : ''

  useEffect(() => {
    if (!retryUntil) return

    const updateCountdown = () => {
      const seconds = Math.max(0, Math.ceil((retryUntil - Date.now()) / 1000))
      setCooldownSeconds(seconds)

      if (seconds === 0) {
        setRetryUntil(null)
        setRemaining(10)
      }
    }

    updateCountdown()
    const timer = window.setInterval(updateCountdown, 250)
    return () => window.clearInterval(timer)
  }, [retryUntil])

  const applyRateLimit = (rateLimit?: RateLimitInfo) => {
    if (!rateLimit) return

    setRemaining(rateLimit.remaining)
    if (rateLimit.remaining === 0) {
      const resetAt = Date.parse(rateLimit.resetAt)
      if (Number.isFinite(resetAt)) setRetryUntil(resetAt)
    }
  }

  // 获取网站元数据；正确密码无限调用，错误密码限流由服务端强制执行。
  const fetchMetaData = async (siteUrl: string) => {
    const response = await fetch('/api/meta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, url: siteUrl }),
    })
    const data = (await response.json().catch(() => ({}))) as MetaApiResponse
    if (data.unlimited) {
      setAccessVerified(true)
    } else {
      setAccessVerified(false)
      applyRateLimit(data.rateLimit)
    }

    if (!response.ok) {
      throw new ToolSubmissionError(
        data.error || 'UNKNOWN_ERROR',
        data.rateLimit?.retryAfterSeconds,
      )
    }

    return data.metadata || {}
  }

  const checkExistingSite = async (siteUrl: string) => {
    const response = await fetch('/api/sites/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, action: 'check', url: siteUrl }),
    })
    const data = (await response
      .json()
      .catch(() => ({}))) as SiteSubmitApiResponse

    if (data.unlimited) {
      setAccessVerified(true)
    } else {
      setAccessVerified(false)
      applyRateLimit(data.rateLimit)
    }

    if (!response.ok) {
      throw new ToolSubmissionError(
        data.error || 'UNKNOWN_ERROR',
        data.rateLimit?.retryAfterSeconds,
      )
    }

    return data
  }

  const loadExistingSite = (
    site: GeneratedNavItem,
    source: 'database' | 'snapshot' = 'database',
  ) => {
    setGeneratedItem(site)
    setExistingSlug(site.slug)
    setExistingSource(source)
    setDuplicateDetected(true)
    setSubmittedSlug('')
    setSubmittedOperation('')
    setUrl(site.url)
    setCategory(site.category)
    setFavorite(site.favorite === true)
    setNeedVPN(site.needVPN === true)
    setMetaData({
      title: site.name,
      description: site.description,
      favicon: site.imgUrl,
    })
  }

  function updateGeneratedItem<Key extends keyof GeneratedNavItem>(
    field: Key,
    value: GeneratedNavItem[Key],
  ) {
    setGeneratedItem((current) =>
      current ? { ...current, [field]: value } : current,
    )
    setSubmittedSlug('')
    setSubmittedOperation('')
  }

  // 生成导航数据
  const generateNavData = async () => {
    if (!password) {
      toast.error(t('tools.nav-gen.form.error.password-required'))
      return
    }

    if (!url) {
      toast.error(t('tools.nav-gen.form.error.url'))
      return
    }

    if (!url.startsWith('http')) {
      toast.error(t('tools.nav-gen.form.error.url-format'))
      return
    }

    setLoading(true)
    try {
      const duplicateCheck = await checkExistingSite(url)
      if (duplicateCheck.duplicate && duplicateCheck.site) {
        loadExistingSite(
          duplicateCheck.site,
          duplicateCheck.source || 'database',
        )
        toast.info(t('tools.nav-gen.form.existing-loaded'))
        return
      }

      // 获取元数据
      const meta = await fetchMetaData(url)
      setMetaData(meta)

      // 解析域名
      const urlObj = new URL(url)
      const domain = urlObj.hostname
      const siteName = meta.title || domain

      // 生成导航项
      const navItem: GeneratedNavItem = {
        slug: createSlug(siteName, url),
        name: siteName,
        url: url,
        imgUrl: meta.favicon || '',
        category,
        favorite: favorite,
        description: meta.description || '',
        needVPN: needVPN,
        sourceLocale: 'en',
        status: 'published',
        updatedAt: new Date().toISOString().slice(0, 10),
      }

      setGeneratedItem(navItem)
      setExistingSlug('')
      setExistingSource('')
      setDuplicateDetected(false)
      setSubmittedSlug('')
      setSubmittedOperation('')
      toast.success(t('tools.nav-gen.success'))
    } catch (error) {
      if (error instanceof ToolSubmissionError) {
        if (error.code === 'INVALID_PASSWORD') {
          toast.error(t('tools.nav-gen.form.error.password'))
        } else if (error.code === 'RATE_LIMITED') {
          toast.error(
            t('tools.nav-gen.form.error.rate-limited', {
              seconds: error.retryAfterSeconds || cooldownSeconds || 60,
            }),
          )
        } else if (
          error.code === 'SERVICE_NOT_CONFIGURED' ||
          error.code === 'SERVICE_UNAVAILABLE'
        ) {
          toast.error(t('tools.nav-gen.form.error.service-unavailable'))
        } else if (
          error.code === 'INVALID_URL' ||
          error.code === 'INVALID_SITE'
        ) {
          toast.error(t('tools.nav-gen.form.error.url-format'))
        } else {
          toast.error(t('tools.nav-gen.form.error.generate-failed'))
        }
      } else {
        console.error('Error generating nav data:', error)
        toast.error(t('tools.nav-gen.form.error.generate-failed'))
      }
    } finally {
      setLoading(false)
    }
  }

  // 复制到剪贴板
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedData)
      toast.success(t('tools.nav-gen.success'))
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error(t('tools.nav-gen.form.error.copy-failed'))
    }
  }

  const submitToDatabase = async () => {
    if (!password) {
      toast.error(t('tools.nav-gen.form.error.password-required'))
      return
    }

    if (!generatedItem) {
      toast.error(t('tools.nav-gen.form.error.invalid-data'))
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/sites/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          action: 'save',
          existingSlug: existingSlug || undefined,
          site: generatedItem,
        }),
      })
      const data = (await response
        .json()
        .catch(() => ({}))) as SiteSubmitApiResponse

      if (data.unlimited) {
        setAccessVerified(true)
      } else {
        setAccessVerified(false)
        applyRateLimit(data.rateLimit)
      }

      if (!response.ok) {
        if (data.error === 'DUPLICATE_SITE' && data.site) {
          loadExistingSite(data.site, data.source || 'database')
          toast.info(t('tools.nav-gen.form.existing-loaded'))
          return
        }
        throw new ToolSubmissionError(
          data.error || 'UNKNOWN_ERROR',
          data.rateLimit?.retryAfterSeconds,
        )
      }

      const slug = data.site?.slug || generatedItem.slug
      const operation = data.operation || (existingSlug ? 'updated' : 'created')
      if (data.site) {
        setGeneratedItem((current) =>
          current
            ? {
                ...current,
                url: data.site?.url || current.url,
                status: data.site?.status || current.status,
                updatedAt: data.site?.updatedAt || current.updatedAt,
              }
            : current,
        )
      }
      setSubmittedSlug(slug)
      setSubmittedOperation(operation)
      setExistingSlug(slug)
      setExistingSource('database')
      if (operation === 'created') setDuplicateDetected(false)
      toast.success(
        t(
          operation === 'updated'
            ? 'tools.nav-gen.form.generated-data.update-success'
            : 'tools.nav-gen.form.generated-data.submit-success',
          { slug },
        ),
      )
    } catch (error) {
      if (error instanceof ToolSubmissionError) {
        if (error.code === 'INVALID_PASSWORD') {
          toast.error(t('tools.nav-gen.form.error.password'))
        } else if (error.code === 'RATE_LIMITED') {
          toast.error(
            t('tools.nav-gen.form.error.rate-limited', {
              seconds: error.retryAfterSeconds || cooldownSeconds || 60,
            }),
          )
        } else if (error.code === 'DUPLICATE_SITE') {
          toast.error(t('tools.nav-gen.form.error.duplicate'))
        } else if (
          error.code === 'INVALID_SITE' ||
          error.code === 'SITE_NOT_FOUND'
        ) {
          toast.error(t('tools.nav-gen.form.error.invalid-data'))
        } else if (
          error.code === 'SERVICE_NOT_CONFIGURED' ||
          error.code === 'SERVICE_UNAVAILABLE'
        ) {
          toast.error(t('tools.nav-gen.form.error.service-unavailable'))
        } else {
          toast.error(t('tools.nav-gen.form.error.generate-failed'))
        }
      } else {
        console.error('Failed to submit navigation data:', error)
        toast.error(t('tools.nav-gen.form.error.generate-failed'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('tools.nav-gen.title')}</h1>
        <p className="text-muted-foreground">
          {t('tools.nav-gen.description')}
        </p>
        {/* 使用指南 */}
        <div className="rounded-md bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800 mt-4">
          <strong>{t('tools.nav-gen.guide.title')}</strong>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>{t('tools.nav-gen.guide.step1')}</li>
            <li>{t('tools.nav-gen.guide.step2')}</li>
            <li>{t('tools.nav-gen.guide.step3')}</li>
            <li>{t('tools.nav-gen.guide.step4')}</li>
          </ol>
        </div>
      </div>

      <div className="grid gap-6">
        {/* 输入区域 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('tools.nav-gen.form.title')}</CardTitle>
            <CardDescription>
              {t('tools.nav-gen.form.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <div>
                  <p className="font-medium text-slate-800">
                    {t('tools.nav-gen.form.security-note')}
                  </p>
                  <p className="mt-0.5" aria-live="polite">
                    {accessVerified
                      ? t('tools.nav-gen.form.unlimited-status')
                      : cooldownSeconds > 0
                        ? t('tools.nav-gen.form.cooldown', {
                            seconds: cooldownSeconds,
                          })
                        : t('tools.nav-gen.form.rate-limit-status', {
                            limit: 10,
                            remaining,
                          })}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="tool-password"
                className="flex items-center gap-2"
              >
                <LockKeyhole className="h-4 w-4" />
                {t('tools.nav-gen.form.password')}
              </Label>
              <Input
                id="tool-password"
                type="password"
                autoComplete="current-password"
                maxLength={256}
                placeholder={t('tools.nav-gen.form.password-placeholder')}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setAccessVerified(false)
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">{t('tools.nav-gen.form.url')}</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value)
                  setSubmittedSlug('')
                  setSubmittedOperation('')
                }}
              />
            </div>

            {/* 分类、收藏、需梯子表单样式优化（PC端对齐） */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
              <div className="flex flex-1 items-center gap-2">
                <Label htmlFor="category" className="mb-0 whitespace-nowrap">
                  {t('tools.nav-gen.form.category')}
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CategoryType).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {t(
                          `category.${CategoryMapping[value as keyof typeof CategoryMapping]}`,
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-1 items-center gap-2">
                <Switch
                  id="favorite"
                  checked={favorite}
                  onCheckedChange={setFavorite}
                />
                <Label htmlFor="favorite" className="mb-0 whitespace-nowrap">
                  {t('tools.nav-gen.form.favorite')}
                </Label>
              </div>
              <div className="flex flex-1 items-center gap-2">
                <Switch
                  id="needVPN"
                  checked={needVPN}
                  onCheckedChange={setNeedVPN}
                />
                <Label htmlFor="needVPN" className="mb-0 whitespace-nowrap">
                  {t('tools.nav-gen.form.needVPN')}
                </Label>
              </div>
            </div>

            <Button
              onClick={generateNavData}
              disabled={loading || !password || !url}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('tools.nav-gen.form.loading')}
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t('tools.nav-gen.form.generate')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 元数据显示 */}
        {Object.keys(metaData).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('tools.nav-gen.form.meta-data.title')}</CardTitle>
              <CardDescription>
                {t('tools.nav-gen.form.meta-data.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {metaData.title && (
                <div>
                  <Label className="text-sm font-medium">
                    {t('tools.nav-gen.form.meta-data.title')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {metaData.title}
                  </p>
                </div>
              )}
              {metaData.description && (
                <div>
                  <Label className="text-sm font-medium">
                    {t('tools.nav-gen.form.meta-data.description')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {metaData.description}
                  </p>
                </div>
              )}
              {metaData.favicon && (
                <div>
                  <Label className="text-sm font-medium">
                    {t('tools.nav-gen.form.meta-data.favicon')}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <SiteIcon
                      key={metaData.favicon}
                      src={metaData.favicon}
                      siteUrl={url}
                      alt={metaData.title || url}
                      size="sm"
                    />
                    <span className="text-sm text-muted-foreground">
                      {metaData.favicon}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 生成结果 */}
        {generatedData && (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>
                      {t(
                        existingSlug
                          ? 'tools.nav-gen.form.generated-data.edit-title'
                          : 'tools.nav-gen.form.generated-data.title',
                      )}
                    </CardTitle>
                    <Badge variant={existingSlug ? 'default' : 'secondary'}>
                      {t(
                        existingSlug
                          ? 'tools.nav-gen.form.generated-data.existing-badge'
                          : 'tools.nav-gen.form.generated-data.new-badge',
                      )}
                    </Badge>
                  </div>
                  <CardDescription>
                    {t(
                      existingSlug
                        ? 'tools.nav-gen.form.generated-data.edit-description'
                        : 'tools.nav-gen.form.generated-data.description',
                    )}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="mr-2 h-4 w-4" />
                    {t('tools.nav-gen.form.generated-data.copy')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={submitToDatabase}
                    disabled={submitting || !password || !generatedItem}
                  >
                    {submitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Database className="mr-2 h-4 w-4" />
                    )}
                    {submitting
                      ? t('tools.nav-gen.form.generated-data.submitting')
                      : t(
                          existingSlug
                            ? 'tools.nav-gen.form.generated-data.update'
                            : 'tools.nav-gen.form.generated-data.submit',
                        )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {duplicateDetected && existingSlug && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <p className="font-medium">
                    {t('tools.nav-gen.form.generated-data.duplicate-found', {
                      slug: existingSlug,
                    })}
                  </p>
                  <p className="mt-1 text-amber-800">
                    {t('tools.nav-gen.form.generated-data.duplicate-source', {
                      source: t(
                        existingSource === 'snapshot'
                          ? 'tools.nav-gen.form.generated-data.source-snapshot'
                          : 'tools.nav-gen.form.generated-data.source-database',
                      ),
                    })}
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="generated-slug">
                    {t('tools.nav-gen.form.generated-data.slug')}
                  </Label>
                  <Input
                    id="generated-slug"
                    value={generatedItem?.slug || ''}
                    readOnly
                    className="bg-slate-50 font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="generated-name">
                    {t('tools.nav-gen.form.generated-data.name')}
                  </Label>
                  <Input
                    id="generated-name"
                    value={generatedItem?.name || ''}
                    maxLength={200}
                    onChange={(event) =>
                      updateGeneratedItem('name', event.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="generated-url">
                  {t('tools.nav-gen.form.generated-data.url')}
                </Label>
                <Input
                  id="generated-url"
                  type="url"
                  value={generatedItem?.url || ''}
                  maxLength={2048}
                  onChange={(event) =>
                    updateGeneratedItem('url', event.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="generated-image-url">
                  {t('tools.nav-gen.form.generated-data.image-url')}
                </Label>
                <Input
                  id="generated-image-url"
                  type="url"
                  value={generatedItem?.imgUrl || ''}
                  maxLength={2048}
                  onChange={(event) =>
                    updateGeneratedItem('imgUrl', event.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="generated-description">
                  {t('tools.nav-gen.form.generated-data.site-description')}
                </Label>
                <Textarea
                  id="generated-description"
                  value={generatedItem?.description || ''}
                  maxLength={2000}
                  className="min-h-28 resize-y"
                  onChange={(event) =>
                    updateGeneratedItem('description', event.target.value)
                  }
                />
              </div>

              <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="generated-category">
                    {t('tools.nav-gen.form.category')}
                  </Label>
                  <Select
                    value={generatedItem?.category}
                    onValueChange={(value) =>
                      updateGeneratedItem('category', value)
                    }
                  >
                    <SelectTrigger id="generated-category" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CategoryType).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {t(
                            `category.${CategoryMapping[value as keyof typeof CategoryMapping]}`,
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="generated-available">
                      {t('tools.nav-gen.form.generated-data.available')}
                    </Label>
                    <Switch
                      id="generated-available"
                      checked={generatedItem?.status === 'published'}
                      onCheckedChange={(checked) =>
                        updateGeneratedItem(
                          'status',
                          checked ? 'published' : 'archived',
                        )
                      }
                    />
                  </div>
                  <p className="text-xs leading-5 text-slate-500">
                    {t('tools.nav-gen.form.generated-data.available-help')}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="generated-favorite">
                    {t('tools.nav-gen.form.favorite')}
                  </Label>
                  <Switch
                    id="generated-favorite"
                    checked={generatedItem?.favorite === true}
                    onCheckedChange={(checked) =>
                      updateGeneratedItem('favorite', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="generated-vpn">
                    {t('tools.nav-gen.form.needVPN')}
                  </Label>
                  <Switch
                    id="generated-vpn"
                    checked={generatedItem?.needVPN === true}
                    onCheckedChange={(checked) =>
                      updateGeneratedItem('needVPN', checked)
                    }
                  />
                </div>
              </div>

              <details className="rounded-xl border border-slate-200">
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700">
                  {t('tools.nav-gen.form.generated-data.json-preview')}
                </summary>
                <div className="relative border-t border-slate-200">
                  <Textarea
                    value={generatedData}
                    readOnly
                    className="h-64 resize-none rounded-none border-0 font-mono text-sm focus-visible:ring-0"
                  />
                  <div className="absolute right-2 top-2">
                    <Badge variant="secondary" className="text-xs">
                      {t('tools.nav-gen.form.generated-data.json-format')}
                    </Badge>
                  </div>
                </div>
              </details>

              {submittedSlug && (
                <p className="mt-3 text-sm text-emerald-700" aria-live="polite">
                  {t(
                    submittedOperation === 'updated'
                      ? 'tools.nav-gen.form.generated-data.updated'
                      : 'tools.nav-gen.form.generated-data.submitted',
                    { slug: submittedSlug },
                  )}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
