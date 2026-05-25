import { getRequestConfig } from 'next-intl/server'

const locales = ['en', 'ar'] as const

export default getRequestConfig(async ({ locale }) => {
  const validLocale =
    locale && locales.includes(locale as (typeof locales)[number])
      ? locale
      : 'en'

  return {
    locale: validLocale,

    messages: (await import(`../src/messages/${validLocale}.json`)).default,
  }
})
