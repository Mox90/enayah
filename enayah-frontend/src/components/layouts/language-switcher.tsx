'use client'

import { Button } from '@/components/ui/button'
import { useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'

import { usePathname, useRouter } from '../../../i18n/navigation'

const LanguageSwitcher = () => {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleSwitchLanguage = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en'

    const query = Object.fromEntries(searchParams.entries())

    router.replace(
      {
        pathname,
        query,
      },
      {
        locale: nextLocale,
      },
    )
  }

  return (
    <Button
      type='button'
      variant='ghost'
      size='icon'
      onClick={handleSwitchLanguage}
      aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <span className='text-lg' aria-hidden='true'>
        {locale === 'ar' ? '🇸🇦' : '🇺🇸'}
      </span>
    </Button>
  )
}

export default LanguageSwitcher
