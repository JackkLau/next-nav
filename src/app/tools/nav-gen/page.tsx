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
import { CategoryType } from '@/data/navigation'


interface MetaData {
  title?: string
  description?: string
  favicon?: string 
}

interface GeneratedNavItem {
  name: string
  url: string
  imgUrl?: string
  category: keyof typeof CategoryType
  favorite?: boolean
  description?: string
  needVPN?: boolean
}

export default function NavGenPage() {
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('a')
  const [favorite, setFavorite] = useState(false)
  const [needVPN, setNeedVPN] = useState(false)
  const [loading, setLoading] = useState(false)
  const [metaData, setMetaData] = useState<MetaData>({})
  const [generatedData, setGeneratedData] = useState<string>('')

  // 生成图标路径
  const generateIconPath = (domain: string) => {
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`
  }

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
      toast.error('请输入网站地址')
      return
    }

    if (!url.startsWith('http')) {
      toast.error('请输入有效的网站地址（以 http:// 或 https:// 开头）')
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
        imgUrl: generateIconPath(domain),
        category: category,
        favorite: favorite,
        description: meta.description || '',
        needVPN: needVPN,
      }

      // 格式化为代码字符串，符合 navigation.ts 格式
      const formattedData = `  {
    name: '${navItem.name}',
    url: '${navItem.url}',
    ${navItem.imgUrl ? `imgUrl: '${navItem.imgUrl}',` : ''}
    category: CategoryType.${category},
    ${navItem.favorite ? 'favorite: true,' : ''}
    ${navItem.description ? `description: '${navItem.description}',` : ''}
    ${navItem.needVPN ? 'needVPN: true,' : ''}
  },`

      setGeneratedData(formattedData)
      toast.success('导航数据生成成功！')
    } catch (error) {
      console.error('Error generating nav data:', error)
      toast.error('生成失败，请检查网站地址是否正确')
    } finally {
      setLoading(false)
    }
  }

  // 复制到剪贴板
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedData)
      toast.success('已复制到剪贴板')
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('复制失败')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">导航数据生成器</h1>
        <p className="text-muted-foreground">
          输入网站地址，自动生成符合格式的导航数据，方便添加到 navigation.ts 文件中
        </p>
      </div>

      <div className="grid gap-6">
        {/* 输入区域 */}
        <Card>
          <CardHeader>
            <CardTitle>网站信息</CardTitle>
            <CardDescription>输入网站地址和基本信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">网站地址 *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">分类</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CategoryType).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="favorite"
                  checked={favorite}
                  onCheckedChange={setFavorite}
                />
                <Label htmlFor="favorite">收藏</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="needVPN"
                  checked={needVPN}
                  onCheckedChange={setNeedVPN}
                />
                <Label htmlFor="needVPN">需梯子</Label>
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
                  生成中...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  生成导航数据
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 元数据显示 */}
        {Object.keys(metaData).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>网站元数据</CardTitle>
              <CardDescription>自动获取的网站信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {metaData.title && (
                <div>
                  <Label className="text-sm font-medium">标题</Label>
                  <p className="text-sm text-muted-foreground">{metaData.title}</p>
                </div>
              )}
              {metaData.description && (
                <div>
                  <Label className="text-sm font-medium">描述</Label>
                  <p className="text-sm text-muted-foreground">{metaData.description}</p>
                </div>
              )}
              {metaData.favicon && (
                <div>
                  <Label className="text-sm font-medium">图标</Label>
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
                  <CardTitle>生成的导航数据</CardTitle>
                  <CardDescription>可直接复制到 navigation.ts 文件中</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="mr-2 h-4 w-4" />
                  复制
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
                    JSON 格式
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