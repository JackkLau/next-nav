import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

export default function ToolsPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">内部工具</h1>
        <p className="text-muted-foreground">
          用于网站维护和内容管理的内部工具集合
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>导航数据生成器</CardTitle>
            <CardDescription>
              输入网站地址，自动生成符合格式的导航数据，方便添加到 navigation.ts 文件中
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/tools/nav-gen">
              <Button>
                <ExternalLink className="mr-2 h-4 w-4" />
                打开工具
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 