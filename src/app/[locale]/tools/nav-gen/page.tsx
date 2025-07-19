'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Copy, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryMapping, CategoryType } from '@/data/navigation'
import { useTranslations } from 'next-intl'
  


interface MetaData {
  title?: string
  description?: string
  favicon?: string 
}

interface GeneratedNavItem {
  name: string
  url: string
  imgUrl?: string
  category: string
  favorite?: boolean
  description?: string
  needVPN?: boolean
}

export default function NavGenPage() {
  const t = useTranslations()
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('common')
  const [favorite, setFavorite] = useState(false)
  const [needVPN, setNeedVPN] = useState(false)
  const [loading, setLoading] = useState(false)
  const [metaData, setMetaData] = useState<MetaData>({})
  const [generatedData, setGeneratedData] = useState<string>('')


  // 获取网站元数据
  const fetchMetaData = async (url: string) => {
    try {
      const response = await fetch(`/api/meta?url=${encodeURIComponent(url)}&meta=title,description,favicon`)
      if (!response.ok) {
        throw new Error('Failed to fetch meta data')
      }
      const data = await response.json()
      return {
        title: data.title || '',
        description: data.description || '',
        favicon: data.favicon || ''
      }
    } catch (error) {
      console.error('Error fetching meta data:', error)
      return {}
    }
  }

  // 生成导航数据
  const generateNavData = async () => {
    if (!url) {
      toast.error(t('tools.nav-gen.error.url'))
      return
    }

    if (!url.startsWith('http')) {
      toast.error(t('tools.nav-gen.error.url-format'))
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
        name: siteName,
        url: url,
        imgUrl: meta.favicon || '',
        category: CategoryType[category as keyof typeof CategoryType],
        favorite: favorite,
        description: meta.description || '',
        needVPN: needVPN,
      }

      // 格式化为代码字符串，符合 navigation.ts 格式
      const formattedData = `{
    name: '${navItem.name}',
    url: '${navItem.url}',
    ${navItem.imgUrl ? `imgUrl: '${navItem.imgUrl}',` : ''}
    category: CategoryType.${category},
    ${navItem.favorite ? 'favorite: true,' : ''}
    ${navItem.description ? `description: '${navItem.description}',` : ''}
    ${navItem.needVPN ? 'needVPN: true,' : ''}
  },`

      setGeneratedData(formattedData)
      toast.success(t('tools.nav-gen.success'))
    } catch (error) {
      console.error('Error generating nav data:', error)
      toast.error(t('tools.nav-gen.error.generate-failed'))
    } finally {
      setLoading(false)
    }
  }

  // 复制到剪贴板
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedData)
      toast.success(t('tools.nav-gen.success.copy'))
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error(t('tools.nav-gen.error.copy-failed'))
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
            <CardDescription>{t('tools.nav-gen.form.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                <Label htmlFor="category" className="mb-0 whitespace-nowrap">{t('tools.nav-gen.form.category')}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CategoryType).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {t(`category.${CategoryMapping[value as keyof typeof CategoryMapping]}`) }
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
                <Label htmlFor="favorite" className="mb-0 whitespace-nowrap">{t('tools.nav-gen.form.favorite')}</Label>
              </div>
              <div className="flex flex-1 items-center gap-2">
                <Switch
                  id="needVPN"
                  checked={needVPN}
                  onCheckedChange={setNeedVPN}
                />
                <Label htmlFor="needVPN" className="mb-0 whitespace-nowrap">{t('tools.nav-gen.form.needVPN')}</Label>
              </div>
            </div>

            <Button 
              onClick={generateNavData} 
              disabled={loading || !url}
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
              <CardDescription>{t('tools.nav-gen.form.meta-data.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {metaData.title && (
                <div>
                  <Label className="text-sm font-medium">{t('tools.nav-gen.form.meta-data.title')}</Label>
                  <p className="text-sm text-muted-foreground">{metaData.title}</p>
                </div>
              )}
              {metaData.description && (
                <div>
                  <Label className="text-sm font-medium">{t('tools.nav-gen.form.meta-data.description')}</Label>
                  <p className="text-sm text-muted-foreground">{metaData.description}</p>
                </div>
              )}
              {metaData.favicon && (
                <div>
                  <Label className="text-sm font-medium">{t('tools.nav-gen.form.meta-data.favicon')}</Label>
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
                    <span className="text-sm text-muted-foreground">{metaData.favicon}</span>
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
                  <CardTitle>{t('tools.nav-gen.form.generated-data.title')}</CardTitle>
                  <CardDescription>{t('tools.nav-gen.form.generated-data.description')}</CardDescription>
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