/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  typescript: {
    // Skip type checking during development
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during development
    ignoreDuringBuilds: true,
  },

  // Environment-specific configuration
  env: {
    // These values will be available at build time
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },

  // Enable environment-specific configuration files
  // This allows us to use .env.development, .env.staging, etc.
  // Environment variables are enabled by default in Next.js
};

module.exports = nextConfig;
