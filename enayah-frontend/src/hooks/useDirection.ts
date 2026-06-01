import { useLocale } from 'next-intl'

export function useDirection() {
  const locale = useLocale()

  return {
    isRTL: locale === 'ar',
    dir: locale === 'ar' ? 'rtl' : 'ltr',
  }
}
