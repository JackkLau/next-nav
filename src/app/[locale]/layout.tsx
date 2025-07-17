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
import { getTranslations, setRequestLocale } from 'next-intl/server';

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const locales = routing.locales;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://loverezhao.top';


export async function generateMetadata({ params }: { params: { locale: string } }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Metadata' });
    const siteName = t('site_name');
    const siteDescription = t('description');
    const siteTitle = t('title');
    const siteKeywords = t('keywords').split(',');
    return {
        title: siteTitle,
        description: siteDescription,
        keywords: siteKeywords,
        authors: [{ name: siteName }],
        creator: siteName,
        publisher: siteName,
        formatDetection: {
            email: false,
            address: false,
            telephone: false,
        },
        metadataBase: new URL(siteUrl),
        alternates: {
            canonical: siteUrl,
        },
        openGraph: {
            type: 'website',
            locale: 'zh_CN',
            url: siteUrl,
            title: siteTitle,
            description: siteDescription,
            siteName: siteName,
            images: [
                {
                    url: '/favicon.png',
                    width: 1200,
                    height: 630,
                    alt: siteName,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: siteTitle,
            description: siteDescription,
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
        other: DefaultMetaData.other,
    };
}


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
                            "url": siteUrl,
                            "description": DefaultMetaData.description,
                            "inLanguage": "zh-CN",
                            "isAccessibleForFree": true,
                            "potentialAction": {
                                "@type": "SearchAction",
                                "target": `${siteUrl}?search={search_term_string}`,
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