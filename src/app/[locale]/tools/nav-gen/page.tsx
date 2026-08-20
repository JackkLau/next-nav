'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
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
  Clock3,
  Copy,
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
  status: 'draft'
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
  const [metaData, setMetaData] = useState<MetaData>({})
  const [generatedData, setGeneratedData] = useState<string>('')
  const [remaining, setRemaining] = useState(10)
  const [retryUntil, setRetryUntil] = useState<number | null>(null)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

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

  // 获取网站元数据；密码与限流均由服务端强制执行。
  const fetchMetaData = async (siteUrl: string) => {
    const response = await fetch('/api/meta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, url: siteUrl }),
    })
    const data = (await response.json().catch(() => ({}))) as MetaApiResponse
    applyRateLimit(data.rateLimit)

    if (!response.ok) {
      throw new ToolSubmissionError(
        data.error || 'UNKNOWN_ERROR',
        data.rateLimit?.retryAfterSeconds,
      )
    }

    return data.metadata || {}
  }

  // 生成导航数据
  const generateNavData = async () => {
    if (!password) {
      toast.error(t('tools.nav-gen.form.error.password-required'))
      return
    }

    if (cooldownSeconds > 0) {
      toast.error(
        t('tools.nav-gen.form.error.rate-limited', {
          seconds: cooldownSeconds,
        }),
      )
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
        status: 'draft',
        updatedAt: new Date().toISOString().slice(0, 10),
      }

      setGeneratedData(JSON.stringify(navItem, null, 2))
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
        } else if (error.code === 'INVALID_URL') {
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
                    {cooldownSeconds > 0
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
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">{t('tools.nav-gen.form.url')}</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
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
              disabled={loading || cooldownSeconds > 0 || !password || !url}
              className="w-full"
            >
              {cooldownSeconds > 0 ? (
                <>
                  <Clock3 className="mr-2 h-4 w-4" />
                  {t('tools.nav-gen.form.cooldown', {
                    seconds: cooldownSeconds,
                  })}
                </>
              ) : loading ? (
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
                    <Image
                      width={16}
                      height={16}
                      src={metaData.favicon}
                      alt="favicon"
                      className="w-4 h-4"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {t('tools.nav-gen.form.generated-data.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('tools.nav-gen.form.generated-data.description')}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="mr-2 h-4 w-4" />
                  {t('tools.nav-gen.form.generated-data.copy')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Textarea
                  value={generatedData}
                  readOnly
                  className="font-mono text-sm h-64 resize-none"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    {t('tools.nav-gen.form.generated-data.json-format')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
