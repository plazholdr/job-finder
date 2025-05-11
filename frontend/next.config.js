/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',

  // Environment-specific configuration
  env: {
    // These values will be available at build time
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },

  // Enable environment-specific configuration files
  // This allows us to use .env.development, .env.staging, etc.
  experimental: {
    // Enable environment variables based on NODE_ENV
    // This is actually the default behavior, but we're being explicit
    environmentVariables: true,
  },
};

module.exports = nextConfig;
