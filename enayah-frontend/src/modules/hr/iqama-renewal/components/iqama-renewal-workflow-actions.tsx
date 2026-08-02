// src/modules/hr/iqama-renewal/components/iqama-renewal-workflow-actions.tsx

'use client'

import { useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleX,
  Clock3,
  IdCard,
  MessageSquareText,
  RefreshCcw,
  Send,
  ShieldAlert,
  Sparkles,
  Undo2,
  Upload,
  UserRoundCheck,
  Workflow,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FormDialog } from '@/components/forms'
import { Footer } from '@/components/footer/footer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import {
  useChangeIqamaRenewalStatus,
  useCompleteIqamaRenewal,
  useReturnIqamaRenewalToHr,
} from '../hooks/use-iqama-renewal-processes'

import {
  AssigneeOption,
  ChangeIqamaRenewalStatusPayload,
  IqamaRenewalCase,
  IqamaRenewalStatus,
} from '../types/iqama-renewal.types'

import { IqamaRenewalStatusBadge } from './iqama-renewal-status-badge'
import { Identification } from '../../employees/types/employee-personal-details.types'
import { IdentificationDialog } from '@/components/dialogs/personal-detail-dialogs'

interface Props {
  renewalCase: IqamaRenewalCase
  canManageWorkflow?: boolean
  canProcessGovernmentRelations?: boolean
  currentUserId?: string | null
  governmentRelationsUsers?: AssigneeOption[]
  isLoadingGovernmentRelationsUsers?: boolean
  isGovernmentRelationsUsersError?: boolean
}

type ActionTone = 'default' | 'success' | 'warning' | 'danger' | 'info'

type ActionTranslationKey =
  | 'actions2.uploadToMhrsd'
  | 'actions2.cancelProcess'
  | 'actions2.markUnderProcess'
  | 'actions2.approveByMhrsd'
  | 'actions2.denyByMhrsd'
  | 'actions2.sendToGovernmentRelations'
  | 'actions2.returnForCorrection'
  | 'actions2.reuploadToMhrsd'
  | 'actions2.markEocRequired'
  | 'actions2.completeProcess'

type ActionDefinition = {
  status: IqamaRenewalStatus
  labelKey: ActionTranslationKey
  icon: LucideIcon
  tone: ActionTone
}

const actionToneClasses: Record<ActionTone, string> = {
  default:
    'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-100/80 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-900/70',
  success:
    'border-emerald-200 bg-emerald-50/70 hover:border-emerald-300 hover:bg-emerald-100/70 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50',
  warning:
    'border-amber-200 bg-amber-50/70 hover:border-amber-300 hover:bg-amber-100/70 dark:border-amber-900/70 dark:bg-amber-950/30 dark:hover:bg-amber-950/50',
  danger:
    'border-rose-200 bg-rose-50/70 hover:border-rose-300 hover:bg-rose-100/70 dark:border-rose-900/70 dark:bg-rose-950/30 dark:hover:bg-rose-950/50',
  info: 'border-blue-200 bg-blue-50/70 hover:border-blue-300 hover:bg-blue-100/70 dark:border-blue-900/70 dark:bg-blue-950/30 dark:hover:bg-blue-950/50',
}

const actionIconClasses: Record<ActionTone, string> = {
  default:
    'bg-slate-950 text-white shadow-slate-950/20 dark:bg-slate-100 dark:text-slate-950',
  success:
    'bg-emerald-600 text-white shadow-emerald-600/20 dark:bg-emerald-500',
  warning: 'bg-amber-500 text-white shadow-amber-500/20',
  danger: 'bg-rose-600 text-white shadow-rose-600/20',
  info: 'bg-blue-600 text-white shadow-blue-600/20',
}

function getAvailableActions(status: IqamaRenewalStatus): ActionDefinition[] {
  switch (status) {
    case 'pending_upload':
      return [
        {
          status: 'uploaded_to_mhrsd',
          labelKey: 'actions2.uploadToMhrsd',
          icon: Upload,
          tone: 'info',
        },
        {
          status: 'cancelled',
          labelKey: 'actions2.cancelProcess',
          icon: CircleX,
          tone: 'danger',
        },
      ]

    case 'uploaded_to_mhrsd':
      return [
        {
          status: 'under_process',
          labelKey: 'actions2.markUnderProcess',
          icon: Clock3,
          tone: 'warning',
        },
        {
          status: 'approved_by_mhrsd',
          labelKey: 'actions2.approveByMhrsd',
          icon: CheckCircle2,
          tone: 'success',
        },
        {
          status: 'denied_by_mhrsd',
          labelKey: 'actions2.denyByMhrsd',
          icon: CircleX,
          tone: 'danger',
        },
      ]

    case 'under_process':
      return [
        {
          status: 'approved_by_mhrsd',
          labelKey: 'actions2.approveByMhrsd',
          icon: CheckCircle2,
          tone: 'success',
        },
        {
          status: 'denied_by_mhrsd',
          labelKey: 'actions2.denyByMhrsd',
          icon: CircleX,
          tone: 'danger',
        },
      ]

    case 'approved_by_mhrsd':
      return [
        {
          status: 'sent_to_government_relations',
          labelKey: 'actions2.sendToGovernmentRelations',
          icon: Send,
          tone: 'info',
        },
      ]

    case 'denied_by_mhrsd':
      return [
        {
          status: 'pending_upload',
          labelKey: 'actions2.returnForCorrection',
          icon: RefreshCcw,
          tone: 'warning',
        },
        {
          status: 'uploaded_to_mhrsd',
          labelKey: 'actions2.reuploadToMhrsd',
          icon: Upload,
          tone: 'info',
        },
        {
          status: 'eoc_required',
          labelKey: 'actions2.markEocRequired',
          icon: ShieldAlert,
          tone: 'danger',
        },
      ]

    case 'sent_to_government_relations':
      return [
        // {
        //   status: 'completed',
        //   labelKey: 'actions2.completeProcess',
        //   icon: CheckCircle2,
        //   tone: 'success',
        // },
        {
          status: 'eoc_required',
          labelKey: 'actions2.markEocRequired',
          icon: ShieldAlert,
          tone: 'danger',
        },
      ]

    case 'eoc_required':
      return [
        {
          status: 'completed',
          labelKey: 'actions2.completeProcess',
          icon: CheckCircle2,
          tone: 'success',
        },
      ]

    case 'completed':
    case 'cancelled':
      return []
  }
}

function getDialogHeaderClass(status: IqamaRenewalStatus | null) {
  switch (status) {
    case 'approved_by_mhrsd':
    case 'completed':
      return 'from-emerald-950 via-emerald-900 to-slate-900'

    case 'denied_by_mhrsd':
    case 'eoc_required':
    case 'cancelled':
      return 'from-rose-950 via-rose-900 to-slate-900'

    case 'uploaded_to_mhrsd':
    case 'sent_to_government_relations':
      return 'from-blue-950 via-blue-900 to-slate-900'

    case 'under_process':
    case 'pending_upload':
      return 'from-amber-950 via-amber-900 to-slate-900'

    default:
      return 'from-slate-950 via-slate-900 to-slate-800'
  }
}

export function IqamaRenewalWorkflowActions({
  renewalCase,
  canManageWorkflow = false,
  canProcessGovernmentRelations = false,
  currentUserId = null,
  governmentRelationsUsers = [],
  isLoadingGovernmentRelationsUsers = false,
  isGovernmentRelationsUsersError = false,
}: Props) {
  const t = useTranslations('iqamaRenewal')
  const locale = useLocale()
  const isRtl = locale.toLowerCase().startsWith('ar')

  /****
   *
   *
   */
  const changeStatus = useChangeIqamaRenewalStatus()
  const completeIqamaRenewal = useCompleteIqamaRenewal()
  const returnToHr = useReturnIqamaRenewalToHr()

  const [selectedStatus, setSelectedStatus] =
    useState<IqamaRenewalStatus | null>(null)
  const [assignedToUserId, setAssignedToUserId] = useState('')
  const [governmentRelationsDueDate, setGovernmentRelationsDueDate] =
    useState('')
  const [denialReason, setDenialReason] = useState('')
  const [comment, setComment] = useState('')
  const [isIqamaDialogOpen, setIsIqamaDialogOpen] = useState(false)
  const [isReturnToHrDialogOpen, setIsReturnToHrDialogOpen] = useState(false)
  const [returnReason, setReturnReason] = useState('')

  /*
   * Keep this before conditional returns because useMemo is a React hook.
   */
  const initialIqama = useMemo<Identification>(
    () => ({
      ...renewalCase.identification,

      /*
       * The renewal workflow must always update an Iqama,
       * and the renewed identification remains current.
       */
      type: 'iqama',
      isCurrent: true,
    }),
    [renewalCase.identification],
  )

  const canHandleAssignedGovernmentRelationsCase =
    canProcessGovernmentRelations &&
    Boolean(currentUserId) &&
    renewalCase.status === 'sent_to_government_relations' &&
    renewalCase.assignedToUserId === currentUserId

  const canUpdateAssignedIqama = canHandleAssignedGovernmentRelationsCase
  //canProcessGovernmentRelations &&
  //Boolean(currentUserId) &&
  //renewalCase.status === 'sent_to_government_relations' &&
  //renewalCase.assignedToUserId === currentUserId

  const canReturnAssignedCaseToHr = canHandleAssignedGovernmentRelationsCase

  /*
   * HR Admin receives normal workflow actions.
   * Government Relations receives only the assigned Iqama update action.
   */
  const actions = canManageWorkflow
    ? getAvailableActions(renewalCase.status)
    : []

  //const visibleActionCount = actions.length + (canUpdateAssignedIqama ? 1 : 0)
  const visibleActionCount =
    actions.length +
    (canUpdateAssignedIqama ? 1 : 0) +
    (canReturnAssignedCaseToHr ? 1 : 0)

  const selectedAction =
    actions.find((action) => action.status === selectedStatus) ?? null

  const requiresDenialReason = selectedStatus === 'denied_by_mhrsd'

  const requiresGovernmentRelationsAssignment =
    selectedStatus === 'sent_to_government_relations'

  const governmentRelationsUsersUnavailable =
    isLoadingGovernmentRelationsUsers ||
    isGovernmentRelationsUsersError ||
    governmentRelationsUsers.length === 0

  /**
   *
   */

  const confirmDisabled =
    changeStatus.isPending ||
    !selectedStatus ||
    (requiresDenialReason && !denialReason.trim()) ||
    (requiresGovernmentRelationsAssignment &&
      (governmentRelationsUsersUnavailable ||
        !assignedToUserId ||
        !governmentRelationsDueDate))

  function clearFormFields() {
    setAssignedToUserId('')
    setGovernmentRelationsDueDate('')
    setDenialReason('')
    //setNotes('')
    setComment('')
  }

  function openAction(status: IqamaRenewalStatus) {
    clearFormFields()
    setSelectedStatus(status)
  }

  function resetDialog() {
    setSelectedStatus(null)
    clearFormFields()
  }

  function closeDialog() {
    if (changeStatus.isPending) {
      return
    }

    resetDialog()
  }

  async function handleConfirm() {
    if (!selectedStatus || confirmDisabled) {
      return
    }

    const payload: ChangeIqamaRenewalStatusPayload = {
      status: selectedStatus,
      version: renewalCase.version,
    }

    if (comment.trim()) {
      payload.comment = comment.trim()
    }

    if (requiresDenialReason) {
      payload.denialReason = denialReason.trim()
    }

    if (requiresGovernmentRelationsAssignment) {
      payload.assignedToUserId = assignedToUserId
      payload.governmentRelationsDueDate = governmentRelationsDueDate
    }

    try {
      await changeStatus.mutateAsync({
        id: renewalCase.id,
        payload,
      })

      resetDialog()
    } catch {
      // The mutation hook displays the error toast.
    }
  }

  async function handleCompleteIqamaRenewal(identification: Identification) {
    if (identification.id !== renewalCase.identificationId) {
      throw new Error(
        'The identification does not belong to this renewal case.',
      )
    }

    const identificationNumber = identification.identificationNumber.trim()

    const expiryDate = identification.expiryDate?.trim()

    if (!identificationNumber) {
      throw new Error('The Iqama number is required.')
    }

    if (!expiryDate) {
      throw new Error('The renewed Iqama expiry date is required.')
    }

    await completeIqamaRenewal.mutateAsync({
      id: renewalCase.id,
      payload: {
        version: renewalCase.version,
        identification: {
          identificationNumber,
          issueDate: identification.issueDate?.trim() || null,
          expiryDate,
          issueDateHijri: identification.issueDateHijri?.trim() || null,
          expiryDateHijri: identification.expiryDateHijri?.trim() || null,
          //dateCalendar: identification.dateCalendar,
          sponsor: identification.sponsor?.trim() || null,
          issuingAuthority: identification.issuingAuthority?.trim() || null,
          occupation: identification.occupation?.trim() || null,
          isCurrent: true,
          fileId: identification.fileId || null,
        },
      },
    })

    setIsIqamaDialogOpen(false)
  }

  async function handleReturnToHr() {
    const reason = returnReason.trim()

    if (!reason || returnToHr.isPending) {
      return
    }

    try {
      await returnToHr.mutateAsync({
        id: renewalCase.id,

        payload: {
          version: renewalCase.version,

          reason,
        },
      })

      setReturnReason('')
      setIsReturnToHrDialogOpen(false)
    } catch {
      /*
       * The mutation hook displays the error.
       * Keep the dialog open so the user does
       * not lose the entered justification.
       */
    }
  }

  const isTerminalStatus =
    renewalCase.status === 'completed' || renewalCase.status === 'cancelled'

  if (!isTerminalStatus && visibleActionCount === 0) {
    return null
  }

  function closeReturnToHrDialog() {
    if (returnToHr.isPending) {
      return
    }

    setIsReturnToHrDialogOpen(false)
    setReturnReason('')
  }

  //if (actions.length === 0) {
  if (isTerminalStatus) {
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

              <IqamaRenewalStatusBadge status={renewalCase.status} />
            </div>

            <p className='mt-2 text-sm leading-6 text-muted-foreground'>
              {isCompleted ? t('processCompleted') : t('processCancelled')}
            </p>
          </div>
        </div>
      </div>
    )
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

                  <IqamaRenewalStatusBadge status={renewalCase.status} />
                </div>

                <p className='mt-1 max-w-2xl text-sm leading-6 text-muted-foreground'>
                  {t('workflowActionsDescription')}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur'>
              <Sparkles className='h-3.5 w-3.5 text-amber-500' />
              {/* {actions.length} {actions.length === 1 ? 'action' : 'actions'} */}
              {visibleActionCount}{' '}
              {visibleActionCount === 1 ? 'action' : 'actions'}
            </div>
          </div>

          <div className='mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
            {canUpdateAssignedIqama && (
              <Button
                type='button'
                variant='outline'
                disabled={completeIqamaRenewal.isPending}
                className={cn(
                  'group h-auto min-h-24 justify-start whitespace-normal rounded-2xl p-4 text-start shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                  actionToneClasses.success,
                )}
                onClick={() => setIsIqamaDialogOpen(true)}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md',
                    actionIconClasses.success,
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

            {canReturnAssignedCaseToHr && (
              <Button
                type='button'
                variant='outline'
                disabled={
                  returnToHr.isPending || completeIqamaRenewal.isPending
                }
                className={cn(
                  'group h-auto min-h-24 justify-start whitespace-normal rounded-2xl p-4 text-start shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                  actionToneClasses.warning,
                )}
                onClick={() => {
                  setReturnReason('')
                  setIsReturnToHrDialogOpen(true)
                }}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md',
                    actionIconClasses.warning,
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

            {actions.map((action) => {
              const ActionIcon = action.icon

              return (
                <Button
                  key={action.status}
                  type='button'
                  variant='outline'
                  disabled={changeStatus.isPending}
                  className={cn(
                    'group h-auto min-h-24 justify-start whitespace-normal rounded-2xl p-4 text-start shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                    actionToneClasses[action.tone],
                  )}
                  onClick={() => openAction(action.status)}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md',
                      actionIconClasses[action.tone],
                    )}
                  >
                    <ActionIcon aria-hidden='true' className='h-5 w-5' />
                  </div>

                  <div className='min-w-0 flex-1'>
                    <div className='font-semibold'>{t(action.labelKey)}</div>

                    <div className='mt-1 text-xs font-normal text-muted-foreground'>
                      {t('newStatus')}
                    </div>
                  </div>

                  <div className='hidden h-9 w-9 items-center justify-center rounded-full border bg-background shadow-sm lg:flex'>
                    <ArrowRight
                      aria-hidden='true'
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

      <FormDialog
        open={selectedStatus !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog()
          }
        }}
        title={
          selectedAction?.labelKey
            ? t(selectedAction.labelKey)
            : t('confirmStatusChange')
        }
        description={t('confirmStatusChangeDescription')}
        //className='flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] flex-col overflow-hidden p-0 md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
        className='md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
        headerClassName={cn(
          'shrink-0 border-b bg-gradient-to-r px-6 py-5 text-white',
          getDialogHeaderClass(selectedStatus),
        )}
      >
        {selectedStatus && (
          <>
            {/* <div className='flex-1 space-y-6 overflow-y-auto px-6 py-5'> */}
            <div className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-6 py-5'>
              <section className='rounded-2xl border bg-card p-5 shadow-sm'>
                <div className='mb-5 flex items-center gap-3'>
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950'>
                    <Workflow className='h-5 w-5' />
                  </div>

                  <div>
                    <h3 className='font-semibold'>
                      {t('confirmStatusChange')}
                    </h3>

                    <p className='mt-0.5 text-sm text-muted-foreground'>
                      {t('confirmStatusChangeDescription')}
                    </p>
                  </div>
                </div>

                <div className='grid items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]'>
                  <div className='min-w-0 rounded-xl border bg-muted/30 p-4'>
                    <div className='mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                      {t('currentStage')}
                    </div>

                    <div className='min-w-0'>
                      <IqamaRenewalStatusBadge status={renewalCase.status} />
                    </div>
                  </div>

                  <div className='hidden items-center justify-center xl:flex'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full border bg-background shadow-sm'>
                      <ArrowRight
                        className={cn(
                          'h-4 w-4 text-muted-foreground',
                          isRtl && 'rotate-180',
                        )}
                      />
                    </div>
                  </div>

                  <div className='min-w-0 rounded-xl border border-primary/20 bg-primary/5 p-4'>
                    <div className='mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                      {t('newStatus')}
                    </div>

                    <div className='min-w-0'>
                      <IqamaRenewalStatusBadge status={selectedStatus} />
                    </div>
                  </div>
                </div>
              </section>

              {selectedAction?.tone === 'danger' && (
                <div className='flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-rose-950 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-100'>
                  <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400' />

                  <div>
                    <div className='text-sm font-semibold'>
                      {selectedAction.labelKey
                        ? t(selectedAction.labelKey)
                        : selectedAction.labelKey}
                    </div>

                    <p className='mt-1 text-sm leading-6 text-rose-800/80 dark:text-rose-200/80'>
                      {t('confirmStatusChangeDescription')}
                    </p>
                  </div>
                </div>
              )}

              {requiresDenialReason && (
                <section className='rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm dark:border-rose-900/70 dark:bg-rose-950/20'>
                  <div className='mb-4 flex items-center gap-3'>
                    <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white'>
                      <ShieldAlert className='h-4 w-4' />
                    </div>

                    <div>
                      <Label
                        htmlFor='denialReason'
                        className='text-sm font-semibold'
                      >
                        {t('denialReason')}
                        <span className='ms-1 text-destructive'>*</span>
                      </Label>
                    </div>
                  </div>

                  <Textarea
                    id='denialReason'
                    rows={5}
                    required
                    value={denialReason}
                    disabled={changeStatus.isPending}
                    className='min-h-32 resize-none bg-background'
                    onChange={(event) => setDenialReason(event.target.value)}
                  />
                </section>
              )}

              {requiresGovernmentRelationsAssignment && (
                <section className='rounded-2xl border bg-card p-5 shadow-sm'>
                  <div className='mb-5 flex items-center gap-3'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white'>
                      <UserRoundCheck className='h-5 w-5' />
                    </div>

                    <div>
                      <h3 className='font-semibold'>{t('assignedTo')}</h3>

                      <p className='mt-0.5 text-sm text-muted-foreground'>
                        {t('selectGovernmentRelationsUser')}
                      </p>
                    </div>
                  </div>

                  <div className='grid gap-4 xl:grid-cols-2'>
                    <div className='min-w-0 space-y-2'>
                      <Label htmlFor='governmentRelationsAssignee'>
                        {t('assignedTo')}
                        <span className='ms-1 text-destructive'>*</span>
                      </Label>

                      <Select
                        value={assignedToUserId}
                        disabled={
                          changeStatus.isPending ||
                          isLoadingGovernmentRelationsUsers ||
                          isGovernmentRelationsUsersError ||
                          governmentRelationsUsers.length === 0
                        }
                        onValueChange={setAssignedToUserId}
                      >
                        <SelectTrigger
                          id='governmentRelationsAssignee'
                          className='h-11 w-full min-w-0'
                        >
                          <SelectValue
                            placeholder={t('selectGovernmentRelationsUser')}
                          />
                        </SelectTrigger>

                        <SelectContent dir={isRtl ? 'rtl' : 'ltr'}>
                          {isLoadingGovernmentRelationsUsers ? (
                            <SelectItem
                              value='loading-government-relations-users'
                              disabled
                            >
                              {t('loadingAssignees')}
                            </SelectItem>
                          ) : isGovernmentRelationsUsersError ? (
                            <SelectItem
                              value='government-relations-users-error'
                              disabled
                            >
                              {t('loadAssigneesFailed')}
                            </SelectItem>
                          ) : governmentRelationsUsers.length === 0 ? (
                            <SelectItem
                              value='no-government-relations-users'
                              disabled
                            >
                              {t('noAssigneesAvailable')}
                            </SelectItem>
                          ) : (
                            governmentRelationsUsers.map((user) => {
                              const displayName = isRtl
                                ? user.labelAr || user.labelEn
                                : user.labelEn || user.labelAr

                              return (
                                <SelectItem key={user.id} value={user.id}>
                                  {displayName ||
                                    user.email ||
                                    user.username ||
                                    t('unnamedUser')}
                                </SelectItem>
                              )
                            })
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='min-w-0 space-y-2'>
                      <Label htmlFor='governmentRelationsDueDate'>
                        {t('governmentRelationsDueDate')}
                        <span className='ms-1 text-destructive'>*</span>
                      </Label>

                      <Input
                        id='governmentRelationsDueDate'
                        type='date'
                        required
                        value={governmentRelationsDueDate}
                        disabled={changeStatus.isPending}
                        className='h-11 w-full min-w-0'
                        onChange={(event) =>
                          setGovernmentRelationsDueDate(event.target.value)
                        }
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* <section className='rounded-2xl border bg-card p-5 shadow-sm'>
                <div className='mb-4 flex items-center gap-3'>
                  <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950'>
                    <MessageSquareText className='h-4 w-4' />
                  </div>

                  <div>
                    <Label
                      htmlFor='workflowNotes'
                      className='text-sm font-semibold'
                    >
                      {t('notes')}
                    </Label>

                    <p className='mt-0.5 text-xs text-muted-foreground'>
                      Optional remarks for this workflow action
                    </p>
                  </div>
                </div>

                <Textarea
                  id='workflowNotes'
                  rows={4}
                  value={notes}
                  disabled={changeStatus.isPending}
                  className='min-h-28 resize-none'
                  onChange={(event) => setNotes(event.target.value)}
                />
              </section> */}
              <section className='rounded-2xl border bg-card p-5 shadow-sm'>
                <div className='mb-4 flex items-center gap-3'>
                  <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950'>
                    <MessageSquareText className='h-4 w-4' />
                  </div>

                  <div>
                    <Label
                      htmlFor='workflowComment'
                      className='text-sm font-semibold'
                    >
                      {t('workflowComment')}
                    </Label>

                    <p className='mt-0.5 text-xs text-muted-foreground'>
                      {t('workflowCommentDescription')}
                    </p>
                  </div>
                </div>

                <Textarea
                  id='workflowComment'
                  rows={4}
                  maxLength={2000}
                  value={comment}
                  disabled={changeStatus.isPending}
                  className='min-h-28 resize-none'
                  onChange={(event) => setComment(event.target.value)}
                />

                <div className='mt-2 text-end text-xs text-muted-foreground'>
                  {comment.length}/2000
                </div>
              </section>
            </div>

            <Footer
              onCancel={closeDialog}
              onSave={handleConfirm}
              label={t('confirm')}
              savingLabel={t('updatingStatus')}
              disabled={confirmDisabled}
              isSaving={changeStatus.isPending}
              saveVariant={
                selectedAction?.tone === 'danger' ? 'destructive' : 'default'
              }
              saveIcon={
                selectedAction ? (
                  <selectedAction.icon className='h-4 w-4' />
                ) : undefined
              }
            />
          </>
        )}
      </FormDialog>

      <FormDialog
        open={isReturnToHrDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeReturnToHrDialog()
          }
        }}
        title={t('returnCaseToHr')}
        description={t('returnCaseToHrDialogDescription')}
        className='md:w-[80vw] md:max-w-3xl'
        headerClassName='shrink-0 border-b bg-gradient-to-r from-amber-950 via-amber-900 to-slate-900 px-6 py-5 text-white'
      >
        <>
          <div className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-6 py-5'>
            <section className='rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm dark:border-amber-900/70 dark:bg-amber-950/20'>
              <div className='flex items-start gap-3'>
                <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-amber-600' />

                <div>
                  <h3 className='font-semibold'>
                    {t('returnCaseWarningTitle')}
                  </h3>

                  <p className='mt-1 text-sm leading-6 text-muted-foreground'>
                    {t('returnCaseWarningDescription')}
                  </p>
                </div>
              </div>
            </section>

            <section className='rounded-2xl border bg-card p-5 shadow-sm'>
              <div className='grid items-stretch gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]'>
                <div className='rounded-xl border bg-muted/30 p-4'>
                  <div className='mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    {t('currentStage')}
                  </div>

                  <IqamaRenewalStatusBadge status={renewalCase.status} />
                </div>

                <div className='hidden items-center justify-center md:flex'>
                  <ArrowRight
                    className={cn(
                      'h-4 w-4 text-muted-foreground',
                      isRtl && 'rotate-180',
                    )}
                  />
                </div>

                <div className='rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/70 dark:bg-amber-950/20'>
                  <div className='mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    {t('newStatus')}
                  </div>

                  <IqamaRenewalStatusBadge status='pending_upload' />
                </div>
              </div>
            </section>

            <section className='rounded-2xl border bg-card p-5 shadow-sm'>
              <div className='mb-4 flex items-center gap-3'>
                <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white'>
                  <MessageSquareText className='h-4 w-4' />
                </div>

                <div>
                  <Label
                    htmlFor='returnReason'
                    className='text-sm font-semibold'
                  >
                    {t('returnReason')}
                    <span className='ms-1 text-destructive'>*</span>
                  </Label>

                  <p className='mt-0.5 text-xs text-muted-foreground'>
                    {t('returnReasonDescription')}
                  </p>
                </div>
              </div>

              <Textarea
                id='returnReason'
                rows={6}
                required
                maxLength={2000}
                value={returnReason}
                disabled={returnToHr.isPending}
                className='min-h-36 resize-none'
                placeholder={t('returnReasonPlaceholder')}
                onChange={(event) => setReturnReason(event.target.value)}
              />

              <div className='mt-2 text-end text-xs text-muted-foreground'>
                {returnReason.length}/2000
              </div>
            </section>
          </div>

          <Footer
            onCancel={closeReturnToHrDialog}
            onSave={handleReturnToHr}
            label={t('confirmReturnToHr')}
            savingLabel={t('returningCase')}
            disabled={!returnReason.trim() || returnToHr.isPending}
            isSaving={returnToHr.isPending}
            saveVariant='default'
            saveIcon={<Undo2 className='h-4 w-4' />}
          />
        </>
      </FormDialog>

      <IdentificationDialog
        open={isIqamaDialogOpen}
        onOpenChange={(open) => {
          if (!completeIqamaRenewal.isPending) {
            setIsIqamaDialogOpen(open)
          }
        }}
        initialValue={initialIqama}
        title={t('updateRenewedIqama')}
        description={t('updateRenewedIqamaDialogDescription')}
        submitLabel={t('saveIqamaAndComplete')}
        lockType
        lockCurrent
        requireExpiryDate
        onSubmit={handleCompleteIqamaRenewal}
      />
    </>
  )
}
