//import type { Metadata } from 'next'

import '@/app/globals.css'

//import { Inter, Cairo, Geist, Geist_Mono } from 'next/font/google'
import { Cairo } from 'next/font/google'
//import { IBM_Plex_Sans_Arabic } from 'next/font/google'

import { ThemeProvider } from '@/components/providers/theme-provider'

import { NextIntlClientProvider } from 'next-intl'

import { getMessages, getTranslations } from 'next-intl/server'
import AuthProvider from '@/components/providers/auth-provider'
import QueryProvider from '@/components/providers/query-provider'
import { Toaster } from '@/components/ui/sonner'

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
  weight: ['400', '500', '600', '700'],
  variable: '--font-cairo',
})

// const arabicFont = IBM_Plex_Sans_Arabic({
//   subsets: ['arabic'],
//   weight: ['400', '500', '600', '700'],
//   variable: '--font-arabic',
// })

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
        `}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <ThemeProvider>
              <AuthProvider>{children}</AuthProvider>
              <Toaster richColors duration={10000} />
            </ThemeProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
