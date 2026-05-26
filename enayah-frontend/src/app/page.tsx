import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const acceptLanguage = (await headers()).get('accept-language') || ''

  const locale = acceptLanguage.toLowerCase().includes('ar') ? 'ar' : 'en'

  redirect(`/${locale}`)
}
