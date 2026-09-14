// enayah-frontend/src/modules/hr/iqama-renewal/components/workflow/iqama-renewal-workflow-actions.tsx

'use client'

import {
  ArrowRight,
  CheckCircle2,
  CircleX,
  IdCard,
  Sparkles,
  Undo2,
  Workflow,
} from 'lucide-react'

import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { IqamaRenewalCase } from '../../types/iqama-renewal.types'

import type { IqamaRenewalAccess } from '../../hooks/use-iqama-renewal-access'

import { useIqamaRenewalWorkflow } from '../../hooks/use-iqama-renewal-workflow'

import { IQAMA_RENEWAL_ACTION_STYLES } from '../../config/iqama-renewal-styles'

import { isTerminalIqamaRenewalStatus } from '../../config/iqama-renewal-workflow.config'

import { IqamaRenewalStatusBadge } from '../iqama-renewal-status-badge'
import { IqamaRenewalWorkflowDialogs } from './iqama-renewal-workflow-dialogs'

//import { IqamaRenewalWorkflowDialogs } from './iqama-renewal-workflow-dialogs'

interface Props {
  renewalCase: IqamaRenewalCase
  access: IqamaRenewalAccess
}

export function IqamaRenewalWorkflowActions({ renewalCase, access }: Props) {
  const t = useTranslations('iqamaRenewal')

  const locale = useLocale()

  const isRtl = locale.toLowerCase().startsWith('ar')

  const workflow = useIqamaRenewalWorkflow({
    renewalCase,
    access,
  })

  const visibleActionCount =
    workflow.actions.length +
    (workflow.canHandleAssignedGovernmentRelationsCase ? 2 : 0)

  const isTerminal = isTerminalIqamaRenewalStatus(renewalCase.status)

  //--------------------------------
  // Terminal state
  //--------------------------------

  if (isTerminal) {
    const isCompleted = renewalCase.status === 'completed'

    const StatusIcon = isCompleted ? CheckCircle2 : CircleX

    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border p-6 shadow-sm',
          isCompleted
            ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 via-background to-background dark:border-emerald-900/70 dark:from-emerald-950/30'
            : 'border-rose-200 bg-gradient-to-br from-rose-50 via-background to-background dark:border-rose-900/70 dark:from-rose-950/30',
        )}
      >
        <div
          className={cn(
            'absolute -end-12 -top-12 h-32 w-32 rounded-full blur-3xl',
            isCompleted ? 'bg-emerald-400/20' : 'bg-rose-400/20',
          )}
        />

        <div className='relative flex items-start gap-4'>
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg',
              isCompleted ? 'bg-emerald-600' : 'bg-rose-600',
            )}
          >
            <StatusIcon className='h-6 w-6' />
          </div>

          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center gap-3'>
              <h2 className='text-lg font-semibold'>
                {isCompleted ? t('processCompleted') : t('processCancelled')}
              </h2>

              {renewalCase.status && (
                <IqamaRenewalStatusBadge status={renewalCase.status} />
              )}
            </div>

            <p className='mt-2 text-sm leading-6 text-muted-foreground'>
              {isCompleted ? t('processCompleted') : t('processCancelled')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (visibleActionCount === 0) {
    return null
  }

  return (
    <>
      <div className='relative overflow-hidden rounded-2xl border bg-card shadow-sm'>
        <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent' />

        <div className='absolute -end-20 -top-20 h-48 w-48 rounded-full bg-primary/5 blur-3xl' />

        <div className='relative p-6'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
            <div className='flex items-start gap-4'>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/20 dark:bg-slate-100 dark:text-slate-950'>
                <Workflow className='h-6 w-6' />
              </div>

              <div>
                <div className='flex flex-wrap items-center gap-3'>
                  <h2 className='text-lg font-semibold'>
                    {t('workflowActions')}
                  </h2>

                  {renewalCase.status && (
                    <IqamaRenewalStatusBadge status={renewalCase.status} />
                  )}
                </div>

                <p className='mt-1 max-w-2xl text-sm leading-6 text-muted-foreground'>
                  {t('workflowActionsDescription')}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur'>
              <Sparkles className='h-3.5 w-3.5 text-amber-500' />
              {visibleActionCount}{' '}
              {visibleActionCount === 1 ? 'action' : 'actions'}
            </div>
          </div>

          <div className='mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
            {/* Government Relations:
                Update renewed Iqama */}

            {workflow.canHandleAssignedGovernmentRelationsCase && (
              <Button
                type='button'
                variant='outline'
                disabled={workflow.isCompletingIqama}
                className={cn(
                  'group h-auto min-h-24 justify-start whitespace-normal rounded-2xl p-4 text-start shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                  IQAMA_RENEWAL_ACTION_STYLES.success.card,
                )}
                onClick={workflow.openIqamaDialog}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md',
                    IQAMA_RENEWAL_ACTION_STYLES.success.icon,
                  )}
                >
                  <IdCard className='h-5 w-5' />
                </div>

                <div className='min-w-0 flex-1'>
                  <div className='font-semibold'>{t('updateRenewedIqama')}</div>

                  <div className='mt-1 text-xs font-normal text-muted-foreground'>
                    {t('updateRenewedIqamaDescription')}
                  </div>
                </div>

                <div className='hidden h-9 w-9 items-center justify-center rounded-full border bg-background shadow-sm lg:flex'>
                  <ArrowRight
                    className={cn(
                      'h-4 w-4 text-muted-foreground',
                      isRtl && 'rotate-180',
                    )}
                  />
                </div>
              </Button>
            )}

            {/* Government Relations:
                Return to HR */}

            {workflow.canHandleAssignedGovernmentRelationsCase && (
              <Button
                type='button'
                variant='outline'
                disabled={
                  workflow.isReturningToHr || workflow.isCompletingIqama
                }
                className={cn(
                  'group h-auto min-h-24 justify-start whitespace-normal rounded-2xl p-4 text-start shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                  IQAMA_RENEWAL_ACTION_STYLES.warning.card,
                )}
                onClick={workflow.openReturnToHrDialog}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md',
                    IQAMA_RENEWAL_ACTION_STYLES.warning.icon,
                  )}
                >
                  <Undo2 className='h-5 w-5' />
                </div>

                <div className='min-w-0 flex-1'>
                  <div className='font-semibold'>{t('returnCaseToHr')}</div>

                  <div className='mt-1 text-xs font-normal text-muted-foreground'>
                    {t('returnCaseToHrDescription')}
                  </div>
                </div>

                <div className='hidden h-9 w-9 items-center justify-center rounded-full border bg-background shadow-sm lg:flex'>
                  <ArrowRight
                    className={cn(
                      'h-4 w-4 text-muted-foreground',
                      isRtl && 'rotate-180',
                    )}
                  />
                </div>
              </Button>
            )}

            {/* HR workflow transitions */}

            {workflow.actions.map((action) => {
              const ActionIcon = action.icon

              const style = IQAMA_RENEWAL_ACTION_STYLES[action.tone]

              return (
                <Button
                  key={action.status}
                  type='button'
                  variant='outline'
                  disabled={workflow.isChangingStatus}
                  className={cn(
                    'group h-auto min-h-24 justify-start whitespace-normal rounded-2xl p-4 text-start shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                    style.card,
                  )}
                  onClick={() => workflow.openStatusAction(action.status)}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md',
                      style.icon,
                    )}
                  >
                    <ActionIcon className='h-5 w-5' />
                  </div>

                  <div className='min-w-0 flex-1'>
                    <div className='font-semibold'>{t(action.labelKey)}</div>

                    <div className='mt-1 text-xs font-normal text-muted-foreground'>
                      {t('newStatus')}
                    </div>
                  </div>

                  <div className='hidden h-9 w-9 items-center justify-center rounded-full border bg-background shadow-sm lg:flex'>
                    <ArrowRight
                      className={cn(
                        'h-4 w-4 text-muted-foreground',
                        isRtl && 'rotate-180',
                      )}
                    />
                  </div>
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      <IqamaRenewalWorkflowDialogs workflow={workflow} />
    </>
  )
}
