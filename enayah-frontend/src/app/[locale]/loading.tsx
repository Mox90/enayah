import Loader from '@/components/animations/loader'
import { getTranslations } from 'next-intl/server'

export default async function Loading() {
  const t = await getTranslations('loading')
  return <Loader message={t('preparingWorkspace')} />
}
