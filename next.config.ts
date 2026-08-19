import './next-intl.config.js';
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const canonicalOrigin = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://loverezhao.top'
).replace(/\/$/, '')
const canonicalHost = new URL(canonicalOrigin).host
const legacyHosts = ['www.loverezhao.top', 'nav.loverezhao.top'].filter(
  (host) => host !== canonicalHost,
)
const retiredLocales = ['zh-CN', 'zh-TW']

const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...legacyHosts.flatMap((host) =>
        retiredLocales.map((locale) => ({
          source: `/${locale}/:path*`,
          has: [{ type: 'host' as const, value: host }],
          destination: `${canonicalOrigin}/en/:path*`,
          permanent: true,
        })),
      ),
      ...legacyHosts.map((host) => ({
        source: '/:path*',
        has: [{ type: 'host' as const, value: host }],
        destination: `${canonicalOrigin}/:path*`,
        permanent: true,
      })),
      ...retiredLocales.map((locale) => ({
        source: `/${locale}/:path*`,
        destination: '/en/:path*',
        permanent: true,
      })),
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  }
};

export default withNextIntl(nextConfig);
