import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['localhost', 'placehold.co'],
    unoptimized: true
  },
  eslint: {
    // Desativa completamente o ESLint durante a compilação
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora erros de TypeScript durante a compilação
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
