import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */

const nextConfig = {
  reactCompiler: true,
  // allowedDevOrigins: [
  //   'localhost',
  //   '127.0.0.1',
  //   '*.local',
  //   process.env.DEV_HOST,
  // ],
  ...(process.env.DEV_HOST
    ? {
        // Keep hostname only; allowedDevOrigins is hostname-oriented.
        // Example supported input formats: "devbox.local", "http://devbox.local:3000"
        allowedDevOrigins: [
          'localhost',
          '127.0.0.1',
          '*.local',
          process.env.DEV_HOST.replace(/^https?:\/\//, '').replace(/:\d+$/, ''),
        ],
      }
    : {
        allowedDevOrigins: ['localhost', '127.0.0.1', '*.local'],
      }),
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
