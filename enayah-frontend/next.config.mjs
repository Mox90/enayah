import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */

const nextConfig = {
  reactCompiler: true,
  allowedDevOrigins: [
    '192.168.7.6',
    'localhost',
    '127.0.0.1',
    '192.168.*.*',
    '*.local',
  ],
  devIndicators: false,
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://backend:4000/api/:path*',
  //     },
  //   ]
  // },
}

export default withNextIntl(nextConfig)
