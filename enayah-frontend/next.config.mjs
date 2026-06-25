import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig = {
  reactCompiler: true,

  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '*.local',

    ...(process.env.DEV_HOST
      ? [process.env.DEV_HOST.replace(/^https?:\/\//, '').replace(/:\d+$/, '')]
      : []),
  ],

  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: 'http',
  //       hostname: 'local',
  //     },
  //     {
  //       protocol: 'http',
  //       hostname: '192.168.3.6',
  //     },
  //   ],
  // },

  devIndicators: false,
}

export default withNextIntl(nextConfig)
