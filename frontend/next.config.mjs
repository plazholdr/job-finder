/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ap-southeast-mys1.oss.ips1cloud.com',
        port: '',
        pathname: '/job-finder-bucket/**',
      },
    ],
  },
};

export default nextConfig;
