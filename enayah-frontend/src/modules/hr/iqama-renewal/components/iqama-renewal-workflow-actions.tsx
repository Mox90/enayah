// src/modules/hr/iqama-renewal/components/iqama-renewal-workflow-actions.tsx

'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleX,
  Clock3,
  MessageSquareText,
  RefreshCcw,
  Send,
  ShieldAlert,
  Sparkles,
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

import { useChangeIqamaRenewalStatus } from '../hooks/use-iqama-renewal-processes'

import {
  AssigneeOption,
  ChangeIqamaRenewalStatusPayload,
  IqamaRenewalCase,
  IqamaRenewalStatus,
} from '../types/iqama-renewal.types'

import { IqamaRenewalStatusBadge } from './iqama-renewal-status-badge'

interface Props {
  renewalCase: IqamaRenewalCase
  canManageWorkflow?: boolean
  governmentRelationsUsers?: AssigneeOption[]
}

type ActionTone = 'default' | 'success' | 'warning' | 'danger' | 'info'

type ActionDefinition = {
  status: IqamaRenewalStatus
  label: string
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

interface WorkflowActionButtonProps {
  action: ActionDefinition
  disabled: boolean
  isRtl: boolean
  subtitle: string
  animationDelay: number
  onClick: () => void
}

function WorkflowActionButton({
  action,
  disabled,
  isRtl,
  subtitle,
  animationDelay,
  onClick,
}: WorkflowActionButtonProps) {
  const iconRef = useRef<HTMLSpanElement>(null)
  const arrowRef = useRef<HTMLSpanElement>(null)
  const idleTweenRef = useRef<gsap.core.Tween | null>(null)

  const ActionIcon = action.icon

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  useEffect(() => {
    const icon = iconRef.current

    if (!icon) {
      return
    }

    const matchMedia = gsap.matchMedia()

    matchMedia.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(icon, {
        y: 0,
        rotate: 0,
        scale: 1,
        transformOrigin: '50% 50%',
      })

      const idleTween = gsap.to(icon, {
        y: -4,
        duration: 0.8,
        delay: animationDelay,
        repeat: -1,
        repeatDelay: 0.18,
        yoyo: true,
        ease: 'sine.inOut',
      })

      idleTweenRef.current = idleTween

      return () => {
        idleTween.kill()
        idleTweenRef.current = null
      }
    })

    return () => matchMedia.revert()
  }, [animationDelay])

  function playAttentionAnimation() {
    if (prefersReducedMotion()) {
      return
    }

    const icon = iconRef.current
    const arrow = arrowRef.current

    if (!icon) {
      return
    }

    idleTweenRef.current?.pause()
    gsap.killTweensOf(icon)

    gsap
      .timeline()
      .to(icon, {
        y: -7,
        rotate: -6,
        scale: 1.14,
        duration: 0.18,
        ease: 'power2.out',
      })
      .to(icon, {
        y: 0,
        rotate: 0,
        scale: 1,
        duration: 0.5,
        ease: 'bounce.out',
      })

    if (arrow) {
      gsap.killTweensOf(arrow)
      gsap.to(arrow, {
        x: isRtl ? -5 : 5,
        duration: 0.28,
        repeat: 1,
        yoyo: true,
        ease: 'power2.inOut',
      })
    }
  }

  function resumeIdleAnimation() {
    if (prefersReducedMotion()) {
      return
    }

    const icon = iconRef.current
    const arrow = arrowRef.current

    if (!icon) {
      return
    }

    gsap.killTweensOf(icon)

    gsap.to(icon, {
      y: 0,
      rotate: 0,
      scale: 1,
      duration: 0.2,
      ease: 'power2.out',
      onComplete: () => idleTweenRef.current?.restart(false),
    })

    if (arrow) {
      gsap.to(arrow, {
        x: 0,
        duration: 0.2,
        ease: 'power2.out',
      })
    }
  }

  function playPressAnimation() {
    if (prefersReducedMotion() || !iconRef.current) {
      return
    }

    gsap.to(iconRef.current, {
      scale: 0.86,
      duration: 0.1,
      ease: 'power2.out',
    })
  }

  function releasePressAnimation() {
    if (prefersReducedMotion() || !iconRef.current) {
      return
    }

    gsap.to(iconRef.current, {
      scale: 1,
      duration: 0.28,
      ease: 'back.out(2.4)',
    })
  }

  return (
    <Button
      type='button'
      variant='outline'
      disabled={disabled}
      className={cn(
        'group relative h-auto min-h-24 justify-start overflow-hidden whitespace-normal rounded-2xl p-4 text-start shadow-sm transition-[transform,box-shadow,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:-translate-y-0.5 focus-visible:shadow-md disabled:translate-y-0',
        actionToneClasses[action.tone],
      )}
      onBlur={resumeIdleAnimation}
      onClick={onClick}
      onFocus={playAttentionAnimation}
      onMouseEnter={playAttentionAnimation}
      onMouseLeave={resumeIdleAnimation}
      onPointerCancel={releasePressAnimation}
      onPointerDown={playPressAnimation}
      onPointerUp={releasePressAnimation}
    >
      <span
        aria-hidden='true'
        className='pointer-events-none absolute inset-y-0 -start-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 group-hover:start-[115%] group-hover:opacity-100 group-focus-visible:start-[115%] group-focus-visible:opacity-100 dark:via-white/10'
      />

      <div
        className={cn(
          'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md transition-transform duration-200 group-hover:scale-105 group-focus-visible:scale-105',
          actionIconClasses[action.tone],
        )}
      >
        <span ref={iconRef} className='flex will-change-transform'>
          <ActionIcon className='h-5 w-5' />
        </span>
      </div>

      <div className='relative z-10 min-w-0 flex-1'>
        <div className='font-semibold'>{action.label}</div>

        <div className='mt-1 text-xs font-normal text-muted-foreground'>
          {subtitle}
        </div>
      </div>

      <div className='relative z-10 hidden h-9 w-9 items-center justify-center rounded-full border bg-background shadow-sm lg:flex'>
        <span ref={arrowRef} className='flex will-change-transform'>
          <ArrowRight
            className={cn(
              'h-4 w-4 text-muted-foreground',
              isRtl && 'rotate-180',
            )}
          />
        </span>
      </div>
    </Button>
  )
}

function getAvailableActions(status: IqamaRenewalStatus): ActionDefinition[] {
  switch (status) {
    case 'pending_upload':
      return [
        {
          status: 'uploaded_to_mhrsd',
          label: 'Uploaded to MHRSD',
          icon: Upload,
          tone: 'info',
        },
        {
          status: 'cancelled',
          label: 'Cancel Process',
          icon: CircleX,
          tone: 'danger',
        },
      ]

    case 'uploaded_to_mhrsd':
      return [
        {
          status: 'under_process',
          label: 'Mark Under Process',
          icon: Clock3,
          tone: 'warning',
        },
        {
          status: 'approved_by_mhrsd',
          label: 'Approved by MHRSD',
          icon: CheckCircle2,
          tone: 'success',
        },
        {
          status: 'denied_by_mhrsd',
          label: 'Denied by MHRSD',
          icon: CircleX,
          tone: 'danger',
        },
      ]

    case 'under_process':
      return [
        {
          status: 'approved_by_mhrsd',
          label: 'Approved by MHRSD',
          icon: CheckCircle2,
          tone: 'success',
        },
        {
          status: 'denied_by_mhrsd',
          label: 'Denied by MHRSD',
          icon: CircleX,
          tone: 'danger',
        },
      ]

    case 'approved_by_mhrsd':
      return [
        {
          status: 'sent_to_government_relations',
          label: 'Send to Government Relations',
          icon: Send,
          tone: 'info',
        },
      ]

    case 'denied_by_mhrsd':
      return [
        {
          status: 'pending_upload',
          label: 'Return for Correction',
          icon: RefreshCcw,
          tone: 'warning',
        },
        {
          status: 'uploaded_to_mhrsd',
          label: 'Re-upload to MHRSD',
          icon: Upload,
          tone: 'info',
        },
        {
          status: 'eoc_required',
          label: 'EOC Required',
          icon: ShieldAlert,
          tone: 'danger',
        },
      ]

    case 'sent_to_government_relations':
      return [
        {
          status: 'completed',
          label: 'Complete Process',
          icon: CheckCircle2,
          tone: 'success',
        },
        {
          status: 'eoc_required',
          label: 'EOC Required',
          icon: ShieldAlert,
          tone: 'danger',
        },
      ]

    case 'eoc_required':
      return [
        {
          status: 'completed',
          label: 'Complete Process',
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
  governmentRelationsUsers = [],
}: Props) {
  const t = useTranslations('iqamaRenewal')
  const locale = useLocale()
  const isRtl = locale.toLowerCase().startsWith('ar')

  const changeStatus = useChangeIqamaRenewalStatus()

  const [selectedStatus, setSelectedStatus] =
    useState<IqamaRenewalStatus | null>(null)

  const [assignedToUserId, setAssignedToUserId] = useState('')
  const [governmentRelationsDueDate, setGovernmentRelationsDueDate] =
    useState('')
  const [denialReason, setDenialReason] = useState('')
  const [notes, setNotes] = useState('')

  if (!canManageWorkflow) {
    return null
  }

  const actions = getAvailableActions(renewalCase.status)

  const selectedAction =
    actions.find((action) => action.status === selectedStatus) ?? null

  const requiresDenialReason = selectedStatus === 'denied_by_mhrsd'

  const requiresGovernmentRelationsAssignment =
    selectedStatus === 'sent_to_government_relations'

  const confirmDisabled =
    changeStatus.isPending ||
    !selectedStatus ||
    (requiresDenialReason && !denialReason.trim()) ||
    (requiresGovernmentRelationsAssignment &&
      (!assignedToUserId || !governmentRelationsDueDate))

  function clearFormFields() {
    setAssignedToUserId('')
    setGovernmentRelationsDueDate('')
    setDenialReason('')
    setNotes('')
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

    if (notes.trim()) {
      payload.notes = notes.trim()
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

  if (actions.length === 0) {
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
              {actions.length} {actions.length === 1 ? 'action' : 'actions'}
            </div>
          </div>

          <div className='mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
            {actions.map((action, index) => (
              <WorkflowActionButton
                key={action.status}
                action={action}
                disabled={changeStatus.isPending}
                isRtl={isRtl}
                subtitle={t('newStatus')}
                animationDelay={index * 0.16}
                onClick={() => openAction(action.status)}
              />
            ))}
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
        title={selectedAction?.label ?? t('confirmStatusChange')}
        description={t('confirmStatusChangeDescription')}
        //className='flex max-h-[90vh] w-[70vw] flex-col overflow-hidden p-0 md:max-w-4xl lg:max-w-5xl'
        className='flex max-h-[90vh] w-[calc(100vw-2rem)] flex-col overflow-hidden p-0 md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
        headerClassName={cn(
          'shrink-0 border-b bg-gradient-to-r px-6 py-5 text-white',
          getDialogHeaderClass(selectedStatus),
        )}
      >
        {selectedStatus && (
          <>
            <div className='flex-1 space-y-6 overflow-y-auto px-6 py-5'>
              <section className='rounded-2xl border bg-gradient-to-br from-muted/60 via-background to-background p-5 shadow-sm'>
                <div className='mb-4 flex items-center gap-2 text-sm font-semibold'>
                  <Workflow className='h-4 w-4 text-primary' />
                  {t('confirmStatusChange')}
                </div>

                {/* <div className='grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]'> */}
                <div className='grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]'>
                  <div className='min-w-0 rounded-xl border bg-background p-4'>
                    <div className='mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                      {t('currentStage')}
                    </div>

                    <div className='max-w-full overflow-hidden'>
                      <IqamaRenewalStatusBadge status={renewalCase.status} />
                    </div>
                  </div>

                  <div className='hidden h-9 w-9 items-center justify-center rounded-full border bg-background shadow-sm sm:flex'>
                    <ArrowRight
                      className={cn(
                        'h-4 w-4 text-muted-foreground',
                        isRtl && 'rotate-180',
                      )}
                    />
                  </div>

                  <div className='min-w-0 rounded-xl border border-primary/20 bg-primary/5 p-4'>
                    <div className='mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                      {t('newStatus')}
                    </div>

                    <div className='max-w-full overflow-hidden'>
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
                      {selectedAction.label}
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
                    <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white'>
                      <UserRoundCheck className='h-4 w-4' />
                    </div>

                    <div>
                      <h3 className='text-sm font-semibold'>
                        {t('assignedTo')}
                      </h3>

                      <p className='mt-0.5 text-xs text-muted-foreground'>
                        {t('selectGovernmentRelationsUser')}
                      </p>
                    </div>
                  </div>

                  <div className='grid gap-4 lg:grid-cols-2'>
                    <div className='min-w-0 space-y-2'>
                      <Label htmlFor='governmentRelationsAssignee'>
                        {t('assignedTo')}
                        <span className='ms-1 text-destructive'>*</span>
                      </Label>

                      <Select
                        value={assignedToUserId}
                        disabled={changeStatus.isPending}
                        onValueChange={setAssignedToUserId}
                      >
                        <SelectTrigger
                          id='governmentRelationsAssignee'
                          className='h-11 w-full min-w-0 bg-background'
                        >
                          <SelectValue
                            placeholder={t('selectGovernmentRelationsUser')}
                          />
                        </SelectTrigger>

                        <SelectContent dir={isRtl ? 'rtl' : 'ltr'}>
                          {governmentRelationsUsers.length === 0 ? (
                            <SelectItem
                              value='no-government-relations-users'
                              disabled
                            >
                              {t('noAssigneesAvailable')}
                            </SelectItem>
                          ) : (
                            governmentRelationsUsers.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.label}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='governmentRelationsDueDate'>
                        {t('governmentRelationsDueDate')}
                        <span className='ms-1 text-destructive'>*</span>
                      </Label>

                      <div className='relative'>
                        {/* <CalendarDays className='pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' /> */}

                        <Input
                          id='governmentRelationsDueDate'
                          type='date'
                          required
                          value={governmentRelationsDueDate}
                          disabled={changeStatus.isPending}
                          className='h-11 w-full min-w-0 bg-background'
                          onChange={(event) =>
                            setGovernmentRelationsDueDate(event.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </section>
              )}

              <section className='rounded-2xl border bg-card p-5 shadow-sm'>
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
    </>
  )
}
