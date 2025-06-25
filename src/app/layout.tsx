import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalLayout from '@/components/global-layout';
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "价值导航 | 发掘价值的导航站",
  description: "【价值导航】专注打造高效便捷的一站式网址导航平台，汇聚全网优质分类站点，涵盖技术、工具、资源、营销、生活服务、学习办公、娱乐购物等20+核心类目。智能推荐热门网站，实时更新安全链接，助您快速定位所需内容，告别繁琐搜索！每日百万用户信赖的上网入口，让浏览更高效，体验更流畅。",
  keywords: [
    '价值导航',
    '网址导航',
    '分类导航网站',
    '实用网站大全',
    '一站式导航平台',
    '高效网址导航',
    '营销内容',
    '学习资源',
    '技术工具',
    '资源分享',
    '热门网站推荐',
    '安全链接',
    '每日更新',
    '用户信赖',
    '浏览效率',
    '体验流畅',
    '导航网站',
    '分类网站',
    '实用网站',
  ],
  other: {
    "google-adsense-account": "ca-pub-5653851953778502"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5653851953778502"
            crossOrigin="anonymous"></Script>
    <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
    <GlobalLayout>
      {children}
    </GlobalLayout>
      </body>
    </html>
  );
}
