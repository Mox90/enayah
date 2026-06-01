import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */

const nextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ['192.168.16.6'],
  devIndicators: false,
}

export default withNextIntl(nextConfig)
