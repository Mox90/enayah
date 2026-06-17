import { useTranslations } from 'next-intl'

export function useAllowanceOptions() {
  const t = useTranslations('allowanceTypes')

  return [
    { value: 'housing', label: t('housing') },
    { value: 'transportation', label: t('transportation') },
    { value: 'food', label: t('food') },
    { value: 'supervisory', label: t('supervisory') },
    { value: 'rare', label: t('rare') },
    { value: 'gasoline', label: t('gasoline') },
    { value: 'security', label: t('security') },
    { value: 'damage', label: t('damage') },
    { value: 'psychology', label: t('psychology') },
    { value: 'hazard', label: t('hazard') },
    { value: 'safety', label: t('safety') },
    { value: 'excellence', label: t('excellence') },
    { value: 'education', label: t('education') },
  ]
}
