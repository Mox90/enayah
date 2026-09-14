// enayah-frontend/src/modules/hr/iqama-renewal/components/workflow/iqama-renewal-workflow-dialogs.tsx

'use client'

import {
  AlertTriangle,
  ArrowRight,
  MessageSquareText,
  ShieldAlert,
  Undo2,
  UserRoundCheck,
  Workflow,
} from 'lucide-react'

import { useLocale, useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'

import { FormDialog } from '@/components/forms'
import { Footer } from '@/components/footer/footer'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { DatePicker } from '@/components/dialogs/date-picker'
import { IdentificationDialog } from '@/components/dialogs/personal-detail-dialogs'
import { IqamaRenewalStatusBadge } from '../iqama-renewal-status-badge'
import { IqamaRenewalWorkflowController } from '../../hooks/use-iqama-renewal-workflow'
import { getIqamaRenewalDialogHeaderClass } from '../../config/iqama-renewal-styles'

interface Props {
  workflow: IqamaRenewalWorkflowController
}

export function IqamaRenewalWorkflowDialogs({ workflow }: Props) {
  const t = useTranslations('iqamaRenewal')
  const locale = useLocale()
  const isRtl = locale.toLowerCase().startsWith('ar')
  const SelectedActionIcon = workflow.selectedAction?.icon

  return (
    <>
      {/* --------------------------------
          Status transition
      -------------------------------- */}

      <FormDialog
        open={workflow.selectedStatus !== null}
        onOpenChange={(open) => {
          if (!open) {
            workflow.closeStatusDialog()
          }
        }}
        title={
          workflow.selectedAction
            ? t(workflow.selectedAction.labelKey)
            : t('confirmStatusChange')
        }
        description={t('confirmStatusChangeDescription')}
        className='md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
        headerClassName={cn(
          'shrink-0 border-b bg-gradient-to-r px-6 py-5 text-white',
          getIqamaRenewalDialogHeaderClass(workflow.selectedStatus),
        )}
      >
        {workflow.selectedStatus && workflow.renewalCase && (
          <>
            <div className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-6 py-5'>
              {/* Summary */}

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

                    {workflow.renewalCase.status && (
                      <IqamaRenewalStatusBadge
                        status={workflow.renewalCase.status}
                      />
                    )}
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

                    <IqamaRenewalStatusBadge status={workflow.selectedStatus} />
                  </div>
                </div>
              </section>

              {/* Danger warning */}

              {workflow.selectedAction?.tone === 'danger' && (
                <div className='flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-rose-950 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-100'>
                  <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400' />

                  <div>
                    <div className='text-sm font-semibold'>
                      {t(workflow.selectedAction.labelKey)}
                    </div>

                    <p className='mt-1 text-sm leading-6 text-rose-800/80 dark:text-rose-200/80'>
                      {t('confirmStatusChangeDescription')}
                    </p>
                  </div>
                </div>
              )}

              {/* Denial reason */}

              {workflow.requiresDenialReason && (
                <section className='rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm dark:border-rose-900/70 dark:bg-rose-950/20'>
                  <div className='mb-4 flex items-center gap-3'>
                    <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white'>
                      <ShieldAlert className='h-4 w-4' />
                    </div>

                    <Label
                      htmlFor='iqamaRenewalDenialReason'
                      className='text-sm font-semibold'
                    >
                      {t('denialReason')}

                      <span className='ms-1 text-destructive'>*</span>
                    </Label>
                  </div>

                  <Textarea
                    id='iqamaRenewalDenialReason'
                    rows={5}
                    required
                    value={workflow.denialReason}
                    disabled={workflow.isChangingStatus}
                    className='min-h-32 resize-none bg-background'
                    onChange={(event) =>
                      workflow.setDenialReason(event.target.value)
                    }
                  />
                </section>
              )}

              {/* Government Relations */}

              {workflow.requiresGovernmentRelationsAssignment && (
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
                      <Label htmlFor='iqamaRenewalGovernmentRelationsAssignee'>
                        {t('assignedTo')}

                        <span className='ms-1 text-destructive'>*</span>
                      </Label>

                      <Select
                        value={workflow.assignedToUserId}
                        disabled={
                          workflow.isChangingStatus ||
                          workflow.isLoadingGovernmentRelationsUsers ||
                          workflow.isGovernmentRelationsUsersError ||
                          workflow.governmentRelationsUsers.length === 0
                        }
                        onValueChange={workflow.setAssignedToUserId}
                      >
                        <SelectTrigger
                          id='iqamaRenewalGovernmentRelationsAssignee'
                          className='h-11 w-full min-w-0'
                        >
                          <SelectValue
                            placeholder={t('selectGovernmentRelationsUser')}
                          />
                        </SelectTrigger>

                        <SelectContent dir={isRtl ? 'rtl' : 'ltr'}>
                          {workflow.isLoadingGovernmentRelationsUsers ? (
                            <SelectItem
                              value='loading-government-relations-users'
                              disabled
                            >
                              {t('loadingAssignees')}
                            </SelectItem>
                          ) : workflow.isGovernmentRelationsUsersError ? (
                            <SelectItem
                              value='government-relations-users-error'
                              disabled
                            >
                              {t('loadAssigneesFailed')}
                            </SelectItem>
                          ) : workflow.governmentRelationsUsers.length === 0 ? (
                            <SelectItem
                              value='no-government-relations-users'
                              disabled
                            >
                              {t('noAssigneesAvailable')}
                            </SelectItem>
                          ) : (
                            workflow.governmentRelationsUsers.map((user) => {
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
                      <Label htmlFor='iqamaRenewalGovernmentRelationsDueDate'>
                        {t('governmentRelationsDueDate')}

                        <span className='ms-1 text-destructive'>*</span>
                      </Label>

                      <DatePicker
                        id='iqamaRenewalGovernmentRelationsDueDate'
                        value={workflow.governmentRelationsDueDate || null}
                        onChange={(value) =>
                          workflow.setGovernmentRelationsDueDate(value ?? '')
                        }
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* Comment */}

              <section className='rounded-2xl border bg-card p-5 shadow-sm'>
                <div className='mb-4 flex items-center gap-3'>
                  <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950'>
                    <MessageSquareText className='h-4 w-4' />
                  </div>

                  <div>
                    <Label
                      htmlFor='iqamaRenewalWorkflowComment'
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
                  id='iqamaRenewalWorkflowComment'
                  rows={4}
                  maxLength={2000}
                  value={workflow.comment}
                  disabled={workflow.isChangingStatus}
                  className='min-h-28 resize-none'
                  onChange={(event) => workflow.setComment(event.target.value)}
                />

                <div className='mt-2 text-end text-xs text-muted-foreground'>
                  {workflow.comment.length}
                  /2000
                </div>
              </section>
            </div>

            <Footer
              onCancel={workflow.closeStatusDialog}
              onSave={workflow.confirmStatusChange}
              label={t('confirm')}
              savingLabel={t('updatingStatus')}
              disabled={workflow.confirmDisabled}
              isSaving={workflow.isChangingStatus}
              saveVariant={
                workflow.selectedAction?.tone === 'danger'
                  ? 'destructive'
                  : 'default'
              }
              saveIcon={
                SelectedActionIcon ? (
                  <SelectedActionIcon className='h-4 w-4' />
                ) : undefined
              }
            />
          </>
        )}
      </FormDialog>

      {/* --------------------------------
          Renewed Iqama
      -------------------------------- */}

      {workflow.initialIqama && (
        <IdentificationDialog
          open={workflow.isIqamaDialogOpen}
          onOpenChange={(open) => {
            if (open) {
              workflow.openIqamaDialog()
            } else {
              workflow.closeIqamaDialog()
            }
          }}
          initialValue={workflow.initialIqama}
          title={t('updateRenewedIqama')}
          description={t('updateRenewedIqamaDialogDescription')}
          submitLabel={t('saveIqamaAndComplete')}
          lockType
          lockCurrent
          requireExpiryDate
          onSubmit={workflow.completeIqama}
        />
      )}

      {/* --------------------------------
          Return to HR
      -------------------------------- */}

      {workflow.renewalCase && (
        <FormDialog
          open={workflow.isReturnToHrDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              workflow.closeReturnToHrDialog()
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

                    <IqamaRenewalStatusBadge
                      status={workflow.renewalCase?.status ?? 'pending_upload'}
                    />
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
                      htmlFor='iqamaRenewalReturnReason'
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
                  id='iqamaRenewalReturnReason'
                  rows={6}
                  required
                  maxLength={2000}
                  value={workflow.returnReason}
                  disabled={workflow.isReturningToHr}
                  className='min-h-36 resize-none'
                  placeholder={t('returnReasonPlaceholder')}
                  onChange={(event) =>
                    workflow.setReturnReason(event.target.value)
                  }
                />

                <div className='mt-2 text-end text-xs text-muted-foreground'>
                  {workflow.returnReason.length}
                  /2000
                </div>
              </section>
            </div>

            <Footer
              onCancel={workflow.closeReturnToHrDialog}
              onSave={workflow.confirmReturnToHr}
              label={t('confirmReturnToHr')}
              savingLabel={t('returningCase')}
              disabled={
                !workflow.returnReason.trim() || workflow.isReturningToHr
              }
              isSaving={workflow.isReturningToHr}
              saveIcon={<Undo2 className='h-4 w-4' />}
            />
          </>
        </FormDialog>
      )}
    </>
  )
}
