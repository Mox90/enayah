// src/modules/hr/iqama-renewal/components/
// iqama-renewal-workflow-actions.tsx

'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  CircleX,
  Clock3,
  RefreshCcw,
  Send,
  Upload,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { useChangeIqamaRenewalStatus } from '../hooks/use-iqama-renewal-processes'
import {
  ChangeIqamaRenewalStatusPayload,
  IqamaRenewalCase,
  IqamaRenewalStatus,
} from '../types/iqama-renewal.types'

interface Props {
  renewalCase: IqamaRenewalCase
  canManageWorkflow: boolean
}

type ActionDefinition = {
  status: IqamaRenewalStatus
  label: string
  icon: React.ReactNode
  variant?: 'default' | 'outline' | 'secondary' | 'destructive'
}

function getAvailableActions(status: IqamaRenewalStatus): ActionDefinition[] {
  switch (status) {
    case 'pending_upload':
      return [
        {
          status: 'uploaded_to_mhrsd',
          label: 'Uploaded to MHRSD',
          icon: <Upload className='h-4 w-4' />,
        },
        {
          status: 'cancelled',
          label: 'Cancel Process',
          icon: <CircleX className='h-4 w-4' />,
          variant: 'destructive',
        },
      ]

    case 'uploaded_to_mhrsd':
      return [
        {
          status: 'under_process',
          label: 'Mark Under Process',
          icon: <Clock3 className='h-4 w-4' />,
        },
        {
          status: 'approved_by_mhrsd',
          label: 'MHRSD Approved',
          icon: <CheckCircle2 className='h-4 w-4' />,
        },
        {
          status: 'denied_by_mhrsd',
          label: 'MHRSD Denied',
          icon: <CircleX className='h-4 w-4' />,
          variant: 'destructive',
        },
        {
          status: 'cancelled',
          label: 'Cancel Process',
          icon: <CircleX className='h-4 w-4' />,
          variant: 'outline',
        },
      ]

    case 'under_process':
      return [
        {
          status: 'approved_by_mhrsd',
          label: 'MHRSD Approved',
          icon: <CheckCircle2 className='h-4 w-4' />,
        },
        {
          status: 'denied_by_mhrsd',
          label: 'MHRSD Denied',
          icon: <CircleX className='h-4 w-4' />,
          variant: 'destructive',
        },
        {
          status: 'cancelled',
          label: 'Cancel Process',
          icon: <CircleX className='h-4 w-4' />,
          variant: 'outline',
        },
      ]

    case 'approved_by_mhrsd':
      return [
        {
          status: 'sent_to_government_relations',
          label: 'Send to Government Relations',
          icon: <Send className='h-4 w-4' />,
        },
        {
          status: 'cancelled',
          label: 'Cancel Process',
          icon: <CircleX className='h-4 w-4' />,
          variant: 'outline',
        },
      ]

    case 'denied_by_mhrsd':
      return [
        {
          status: 'pending_upload',
          label: 'Return for Correction',
          icon: <RefreshCcw className='h-4 w-4' />,
        },
        {
          status: 'uploaded_to_mhrsd',
          label: 'Re-upload to MHRSD',
          icon: <Upload className='h-4 w-4' />,
        },
        {
          status: 'eoc_required',
          label: 'EOC Required',
          icon: <CircleX className='h-4 w-4' />,
          variant: 'destructive',
        },
        {
          status: 'cancelled',
          label: 'Cancel Process',
          icon: <CircleX className='h-4 w-4' />,
          variant: 'outline',
        },
      ]

    case 'sent_to_government_relations':
      return [
        {
          status: 'completed',
          label: 'Complete Process',
          icon: <CheckCircle2 className='h-4 w-4' />,
        },
        {
          status: 'eoc_required',
          label: 'EOC Required',
          icon: <CircleX className='h-4 w-4' />,
          variant: 'destructive',
        },
        {
          status: 'cancelled',
          label: 'Cancel Process',
          icon: <CircleX className='h-4 w-4' />,
          variant: 'outline',
        },
      ]

    case 'eoc_required':
      return [
        {
          status: 'completed',
          label: 'Complete Process',
          icon: <CheckCircle2 className='h-4 w-4' />,
        },
        {
          status: 'cancelled',
          label: 'Cancel Process',
          icon: <CircleX className='h-4 w-4' />,
          variant: 'outline',
        },
      ]

    case 'completed':
    case 'cancelled':
      return []
  }
}

export function IqamaRenewalWorkflowActions({
  renewalCase,
  canManageWorkflow,
}: Props) {
  const t = useTranslations('iqamaRenewal')
  const changeStatus = useChangeIqamaRenewalStatus()

  const [selectedStatus, setSelectedStatus] =
    useState<IqamaRenewalStatus | null>(null)

  const [denialReason, setDenialReason] = useState('')
  const [governmentRelationsDueDate, setGovernmentRelationsDueDate] =
    useState('')
  const [notes, setNotes] = useState('')

  if (!canManageWorkflow) {
    return null
  }

  const actions = getAvailableActions(renewalCase.status)

  const requiresDenialReason = selectedStatus === 'denied_by_mhrsd'

  const requiresDueDate = selectedStatus === 'sent_to_government_relations'

  function closeDialog() {
    if (changeStatus.isPending) return

    setSelectedStatus(null)
    setDenialReason('')
    setGovernmentRelationsDueDate('')
    setNotes('')
  }

  async function handleConfirm() {
    if (!selectedStatus) return

    if (requiresDenialReason && !denialReason.trim()) {
      return
    }

    if (requiresDueDate && !governmentRelationsDueDate) {
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

    if (requiresDueDate) {
      payload.governmentRelationsDueDate = governmentRelationsDueDate
    }

    try {
      await changeStatus.mutateAsync({
        id: renewalCase.id,
        payload,
      })

      closeDialog()
    } catch {
      // The hook displays the error message.
    }
  }

  if (actions.length === 0) {
    return (
      <div className='rounded-xl border bg-muted/30 p-4'>
        <p className='text-sm text-muted-foreground'>
          {renewalCase.status === 'completed'
            ? t('processCompleted')
            : t('processCancelled')}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className='rounded-xl border bg-muted/20 p-4'>
        <div className='mb-4'>
          <h2 className='font-semibold'>{t('workflowActions')}</h2>

          <p className='mt-1 text-sm text-muted-foreground'>
            {t('workflowActionsDescription')}
          </p>
        </div>

        <div className='flex flex-wrap gap-2'>
          {actions.map((action) => (
            <Button
              key={action.status}
              type='button'
              variant={action.variant ?? 'default'}
              disabled={changeStatus.isPending}
              onClick={() => setSelectedStatus(action.status)}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      <Dialog
        open={selectedStatus !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirmStatusChange')}</DialogTitle>

            <DialogDescription>
              {t('confirmStatusChangeDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='rounded-lg bg-muted p-3'>
              <div className='text-xs text-muted-foreground'>
                {t('newStatus')}
              </div>

              <div className='mt-1 font-medium'>
                {selectedStatus?.replaceAll('_', ' ')}
              </div>
            </div>

            {requiresDenialReason && (
              <div className='space-y-2'>
                <Label htmlFor='denialReason'>{t('denialReason')}</Label>

                <Textarea
                  id='denialReason'
                  rows={4}
                  required
                  value={denialReason}
                  disabled={changeStatus.isPending}
                  onChange={(event) => setDenialReason(event.target.value)}
                />
              </div>
            )}

            {requiresDueDate && (
              <div className='space-y-2'>
                <Label htmlFor='workflowGovernmentRelationsDueDate'>
                  {t('governmentRelationsDueDate')}
                </Label>

                <Input
                  id='workflowGovernmentRelationsDueDate'
                  type='date'
                  required
                  value={governmentRelationsDueDate}
                  disabled={changeStatus.isPending}
                  onChange={(event) =>
                    setGovernmentRelationsDueDate(event.target.value)
                  }
                />
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='workflowNotes'>{t('notes')}</Label>

              <Textarea
                id='workflowNotes'
                rows={3}
                value={notes}
                disabled={changeStatus.isPending}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              disabled={changeStatus.isPending}
              onClick={closeDialog}
            >
              {t('cancel')}
            </Button>

            <Button
              type='button'
              disabled={
                changeStatus.isPending ||
                (requiresDenialReason && !denialReason.trim()) ||
                (requiresDueDate && !governmentRelationsDueDate)
              }
              onClick={handleConfirm}
            >
              {changeStatus.isPending ? t('updatingStatus') : t('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
