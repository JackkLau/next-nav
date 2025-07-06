import type { NextConfig } from "next";


const nextConfig: NextConfig = {
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
