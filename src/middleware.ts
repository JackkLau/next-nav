import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;
const locales = ['en', 'zh-CN', 'zh-TW'];
const defaultLocale = 'en';

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

  // 已有 locale 前缀则不处理
  if (locales.some((locale) => pathname.startsWith(`/${locale}`))) {
    return;
  }

  // 检测浏览器语言
  const acceptLang = request.headers.get('accept-language');
  const detected = acceptLang
    ? locales.find((locale) => acceptLang.includes(locale))
    : null;

  const locale = detected || defaultLocale;

  // 跳转到对应语言路径
  return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 