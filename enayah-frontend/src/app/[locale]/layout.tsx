//import type { Metadata } from 'next'

import '@/app/globals.css'

//import { Inter, Cairo, Geist, Geist_Mono } from 'next/font/google'
import { Cairo } from 'next/font/google'

import { ThemeProvider } from '@/components/providers/theme-provider'

import { NextIntlClientProvider } from 'next-intl'

import { getMessages, getTranslations } from 'next-intl/server'
import AuthProvider from '@/components/providers/auth-provider'
import QueryProvider from '@/components/providers/query-provider'

/*const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})*/

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo',
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({
    locale,
    namespace: 'metadata',
  })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode

  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  const messages = await getMessages({ locale })

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      suppressHydrationWarning
    >
      <body
        className={`
          min-h-screen
          bg-background
          text-foreground
          antialiased
          ${cairo.variable}
          ${locale === 'ar' ? 'font-[var(--font-cairo)]' : 'font-sans'}
        `}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <ThemeProvider>
              <AuthProvider>{children}</AuthProvider>
            </ThemeProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
