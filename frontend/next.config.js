const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' });
/** @type {import('next').NextConfig} */
const baseConfig = {
  experimental: {
    // Helps shrink bundles by transforming `import { Button } from 'antd'` into per-module imports
    optimizePackageImports: ['antd', '@ant-design/icons']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ap-southeast-mys1.oss.ips1cloud.com',
        pathname: '/job-finder-bucket/**',
      },
    ],
  },
};

module.exports = withBundleAnalyzer(baseConfig);

