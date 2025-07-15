import GlobalLayout from '@/components/global-layout';
import { DefaultMetaData } from '@/constant/metaData';
import { Metadata } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { Geist, Geist_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import '../globals.css';
import { routing } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';

export function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'zh-CN' }, { locale: 'zh-TW' }];
}

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const locales = ['en', 'zh-CN', 'zh-TW'];

export const metadata: Metadata = {
    title: DefaultMetaData.title,
    description: DefaultMetaData.description,
    keywords: DefaultMetaData.keywords,
    authors: [{ name: '价值导航' }],
    creator: '价值导航',
    publisher: '价值导航',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://loverezhao.top'),
    alternates: {
        canonical: 'https://loverezhao.top',
    },
    openGraph: {
        type: 'website',
        locale: 'zh_CN',
        url: 'https://loverezhao.top',
        title: DefaultMetaData.title,
        description: DefaultMetaData.description,
        siteName: '价值导航',
        images: [
            {
                url: '/favicon.png',
                width: 1200,
                height: 630,
                alt: '价值导航',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: DefaultMetaData.title,
        description: DefaultMetaData.description,
        images: ['/favicon.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'your-google-verification-code', // 替换为你的 Google Search Console 验证码
        other: {
            'msvalidate.01': DefaultMetaData.other['msvalidate.01'],
        },
    },
    other: DefaultMetaData.other,
};


export default async function LocaleLayout({ children, params }: { children: ReactNode, params: { locale: string } }) {
    let messages;
    const { locale } = await params;
    
    if (!hasLocale(routing.locales, locale)) {
        notFound();
      }
     
      // Enable static rendering
      setRequestLocale(locale);

    try {
        messages = (await import(`../../messages/${locale}.json`)).default;
    } catch (error) {
        console.error('LocaleLayout error', error);
        notFound();
    }

    return (
        <html lang={locale}>

            <head>
                {/* 结构化数据 - 网站信息 */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebSite",
                            "name": "价值导航",
                            "url": "https://loverezhao.top",
                            "description": DefaultMetaData.description,
                            "inLanguage": "zh-CN",
                            "isAccessibleForFree": true,
                            "potentialAction": {
                                "@type": "SearchAction",
                                "target": "https://loverezhao.top?search={search_term_string}",
                                "query-input": "required name=search_term_string"
                            }
                        })
                    }}
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <GlobalLayout>
                        {children}
                    </GlobalLayout>
                    <Toaster />
                </NextIntlClientProvider>
            </body>
        </html>
    );
} 