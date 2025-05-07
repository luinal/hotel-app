import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['localhost', 'placehold.co'],
    unoptimized: true
  }
};

export default nextConfig;
