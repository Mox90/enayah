import { useTranslations } from 'next-intl'

export function useProviderOptions() {
  const t = useTranslations('credentials')

  return [
    { value: 'sha', label: t('sha') },
    { value: 'aha', label: t('aha') },
  ]
}
