import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude test files from build
  experimental: {
    serverComponentsExternalPackages: ['@playwright/test'],
  },
};

export default nextConfig;
