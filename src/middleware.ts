import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 中文分类名称到英文标识符的映射
const categoryRedirects: { [key: string]: string } = {
  '常用网站': 'common',
  '优质社区': 'community',
  '实用工具': 'tools',
  '个人网站': 'personal',
  '资源收藏': 'resources',
  '镜像站': 'mirror',
  '导航发现': 'navigation',
  '影视娱乐': 'entertainment',
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 检查是否是分类页面路径
  if (pathname.startsWith('/category/')) {
    const category = decodeURIComponent(pathname.replace('/category/', ''))
    
    // 如果是中文分类名称，重定向到英文标识符
    if (categoryRedirects[category]) {
      const newUrl = new URL(`/category/${categoryRedirects[category]}`, request.url)
      return NextResponse.redirect(newUrl, 301) // 301永久重定向
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/category/:path*',
} 