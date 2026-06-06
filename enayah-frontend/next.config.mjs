import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */

const nextConfig = {
  reactCompiler: true,
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '*.local',
    process.env.DEV_HOST,
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
