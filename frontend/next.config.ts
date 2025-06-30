/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
   eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    outputFileTracingRoot: undefined,
  },
}

module.exports = nextConfig