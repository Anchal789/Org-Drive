import path from 'node:path';
import type { NextConfig } from 'next';

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
  connect-src 'self' https://org-drive.onrender.com http://localhost:3001/;
`;

const nextConfig: NextConfig = {
  compress: true,
  reactStrictMode: true,
  reactCompiler: true,
  experimental: {
    optimizeCss: true,
    cssChunking: true,
    inlineCss: true,
    typedEnv: true,
  },
  typedRoutes: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      new URL(
        'https://raw.githubusercontent.com/SujalXplores/All-Country-Flags/refs/heads/master/*',
      ),
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  sassOptions: {
    includePaths: [path.join(process.cwd(), 'styles')],
  },
  typescript: {
    ignoreBuildErrors: process.env.VERCEL === '1',
  },
};

export default nextConfig;
