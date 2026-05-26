'use client'

import { Button } from '@/components/ui/button'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '../../../i18n/navigation'

//import { usePathname, useRouter } from '@/i18n/navigation'

const LanguageSwitcher = () => {
  const locale = useLocale()

  const router = useRouter()

  const pathname = usePathname()

  const handleSwitchLanguage = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en'

    router.replace(pathname, {
      locale: nextLocale,
    })
  }

  return (
    <Button variant='ghost' size='icon' onClick={handleSwitchLanguage}>
      <span className='text-lg'>{locale === 'ar' ? '🇸🇦' : '🇺🇸'}</span>
    </Button>
  )
}

export default LanguageSwitcher
