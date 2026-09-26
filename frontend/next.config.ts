import type { NextConfig } from "next";

const isStandalone = process.env.BUILD_STANDALONE === 'true' && !process.env.VERCEL;

const nextConfig: NextConfig = {
  ...(isStandalone ? { output: 'standalone' } : {}),
};

export default nextConfig;
