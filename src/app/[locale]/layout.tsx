import GlobalLayout from '@/components/global-layout';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { Geist, Geist_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import '../globals.css';
import { routing } from '@/i18n/routing';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
    isIndexableLocale,
    languageAlternates,
    localizedUrl,
    openGraphLocale,
    siteOrigin,
} from '@/lib/seo';

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



export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Metadata' });
    const siteName = t('site_name');
    const siteDescription = t('description');
    const siteTitle = t('title');
    const canonical = localizedUrl(locale);
    const indexable = isIndexableLocale(locale);

    return {
        title: siteTitle,
        description: siteDescription,
        authors: [{ name: siteName }],
        creator: siteName,
        publisher: siteName,
        formatDetection: {
            email: false,
            address: false,
            telephone: false,
        },
        metadataBase: new URL(siteOrigin),
        alternates: {
            canonical,
            languages: languageAlternates(),
        },
        openGraph: {
            type: 'website',
            locale: openGraphLocale(locale),
            url: canonical,
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
            index: indexable,
            follow: true,
            googleBot: {
                index: indexable,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        other: {
            "google-adsense-account": "ca-pub-5653851953778502",
            "msvalidate.01": "1CCA2B8229A0C45CAB754FE9BBB190BE",
        },
    };
}


export default async function LocaleLayout({ children, params }: { children: ReactNode, params: Promise<{ locale: string }> }) {
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

    const t = await getTranslations({ locale, namespace: 'Metadata' });
    const canonical = localizedUrl(locale);
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: t('site_name'),
        url: canonical,
        description: t('description'),
        inLanguage: locale,
        isAccessibleForFree: true,
    };

    return (
        <html lang={locale}>

            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')
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
