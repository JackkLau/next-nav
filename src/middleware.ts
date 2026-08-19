import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const PUBLIC_FILE = /\.(.*)$/;
const locales = routing.locales;
const defaultLocale = routing.defaultLocale;
const retiredLocales = new Set(['zh-CN', 'zh-TW']);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 忽略静态资源和 API 路由
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return;
  }

  const firstSegment = pathname.split('/')[1];

  // Keep removed Chinese URLs recoverable while consolidating indexing on English.
  if (retiredLocales.has(firstSegment)) {
    const redirectUrl = request.nextUrl.clone();
    const segments = pathname.split('/');
    segments[1] = defaultLocale;
    redirectUrl.pathname = segments.join('/') || `/${defaultLocale}`;
    return NextResponse.redirect(redirectUrl, 308);
  }

  // 已有完整 locale 前缀则不处理
  if (locales.includes(firstSegment as (typeof locales)[number])) {
    return;
  }

  // 使用确定的默认语言，避免搜索引擎和用户因请求头看到不同 URL。
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname === '/' ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(redirectUrl, 308);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
