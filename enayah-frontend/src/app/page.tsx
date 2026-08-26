// enayah-frontend/src/app/page.tsx

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const acceptLanguage = (await headers()).get('accept-language') || ''

  //const locale = acceptLanguage.toLowerCase().includes('ar') ? 'ar' : 'en'
  const preferred = acceptLanguage
    .toLowerCase()
    .split(',')
    .map((part) => part.trim().split(';')[0]?.split('-')[0])

  const locale = preferred.includes('ar') ? 'ar' : 'en'

  redirect(`/${locale}/login`)
}
