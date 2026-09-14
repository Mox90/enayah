// enayah-frontend/src/modules/hr/iqama-renewal/config/iqama-renewal-workflow.config.ts

import type { LucideIcon } from 'lucide-react'

import {
  CheckCircle2,
  CircleX,
  Clock3,
  RefreshCcw,
  Send,
  ShieldAlert,
  Upload,
} from 'lucide-react'

import type { IqamaRenewalStatus } from '../types/iqama-renewal.types'

export type ActionTone = 'default' | 'success' | 'warning' | 'danger' | 'info'

export type ActionTranslationKey =
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

export type ActionDefinition = {
  status: IqamaRenewalStatus
  labelKey: ActionTranslationKey
  icon: LucideIcon
  tone: ActionTone
}

export function getAvailableActions(
  status: IqamaRenewalStatus,
): ActionDefinition[] {
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

export function isTerminalIqamaRenewalStatus(
  status: IqamaRenewalStatus | null | undefined,
) {
  return status === 'completed' || status === 'cancelled'
}
