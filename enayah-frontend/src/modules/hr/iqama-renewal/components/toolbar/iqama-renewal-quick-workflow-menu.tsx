// enayah-frontend/src/modules/hr/iqama-renewal/components/toolbar/iqama-renewal-quick-workflow-menu.tsx

'use client'

import { Eye, IdCard, MoreHorizontal, Undo2 } from 'lucide-react'

import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type { IqamaRenewalCase } from '../../types/iqama-renewal.types'

import type { IqamaRenewalAccess } from '../../hooks/use-iqama-renewal-access'

import { useIqamaRenewalWorkflow } from '../../hooks/use-iqama-renewal-workflow'

import { IQAMA_RENEWAL_ACTION_STYLES } from '../../config/iqama-renewal-styles'

import { IqamaRenewalWorkflowDialogs } from '../workflow/iqama-renewal-workflow-dialogs'

interface Props {
  renewalCase: IqamaRenewalCase
  access: IqamaRenewalAccess
  onOpen: (id: string) => void
}

export function IqamaRenewalQuickWorkflowMenu({
  renewalCase,
  access,
  onOpen,
}: Props) {
  const t = useTranslations('common')
  const it = useTranslations('iqamaRenewal')

  const locale = useLocale()
  const isRtl = locale.toLowerCase().startsWith('ar')

  const workflow = useIqamaRenewalWorkflow({
    renewalCase,
    access,
  })

  const hasWorkflowActions =
    workflow.actions.length > 0 ||
    workflow.canHandleAssignedGovernmentRelationsCase

  const successStyle = IQAMA_RENEWAL_ACTION_STYLES.success

  const warningStyle = IQAMA_RENEWAL_ACTION_STYLES.warning

  return (
    <>
      <DropdownMenu dir={isRtl ? 'rtl' : 'ltr'}>
        <DropdownMenuTrigger asChild>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='h-10 w-10 shrink-0 rounded-xl md:w-auto md:px-4'
            aria-label={t('actions')}
            title={t('actions')}
          >
            <MoreHorizontal className='h-4 w-4 shrink-0' />

            <span className='ms-2 hidden md:inline'>{t('actions')}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end' className='w-64'>
          {/* Open */}

          <DropdownMenuItem
            onSelect={() => onOpen(renewalCase.id)}
            className='rounded-lg'
          >
            <Eye className='me-2 h-4 w-4 text-muted-foreground' />

            {it('open')}
          </DropdownMenuItem>

          {hasWorkflowActions && <DropdownMenuSeparator />}

          {/* HR transitions */}

          {workflow.actions.map((action) => {
            const ActionIcon = action.icon

            const style = IQAMA_RENEWAL_ACTION_STYLES[action.tone]

            return (
              <DropdownMenuItem
                key={action.status}
                disabled={workflow.isChangingStatus}
                onSelect={() => workflow.openStatusAction(action.status)}
                className={cn(
                  'my-1 rounded-lg px-3 py-2.5 font-medium transition-colors',
                  style.menu,
                )}
              >
                <ActionIcon
                  className={cn('me-2 h-4 w-4 shrink-0', style.menuIcon)}
                />

                {it(action.labelKey)}
              </DropdownMenuItem>
            )
          })}

          {/* Assigned GR actions */}

          {workflow.canHandleAssignedGovernmentRelationsCase && (
            <>
              {workflow.actions.length > 0 && <DropdownMenuSeparator />}

              <DropdownMenuItem
                disabled={workflow.isCompletingIqama}
                onSelect={workflow.openIqamaDialog}
                className={cn(
                  'my-1 rounded-lg px-3 py-2.5 font-medium transition-colors',
                  successStyle.menu,
                )}
              >
                <IdCard
                  className={cn('me-2 h-4 w-4 shrink-0', successStyle.menuIcon)}
                />

                {it('updateRenewedIqama')}
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={
                  workflow.isReturningToHr || workflow.isCompletingIqama
                }
                onSelect={workflow.openReturnToHrDialog}
                className={cn(
                  'my-1 rounded-lg px-3 py-2.5 font-medium transition-colors',
                  warningStyle.menu,
                )}
              >
                <Undo2
                  className={cn('me-2 h-4 w-4 shrink-0', warningStyle.menuIcon)}
                />

                {it('returnCaseToHr')}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <IqamaRenewalWorkflowDialogs workflow={workflow} />
    </>
  )
}
