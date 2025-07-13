import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  // 添加重定向配置
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.loverezhao.top',
          },
        ],
        destination: 'https://loverezhao.top/:path*',
        permanent: true,
      },
    ]
  },
  /* config options here */
  // output: 'export',
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.baozangtuku.com",
      },
    ],
  }
};

export default nextConfig;
