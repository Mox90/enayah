// enayah-frontend/src/modules/hr/iqama-renewal/config/iqama-renewal-styles.ts

import type { IqamaRenewalStatus } from '../types/iqama-renewal.types'
import type { ActionTone } from './iqama-renewal-workflow.config'

export const IQAMA_RENEWAL_STATUS_CLASSES: Record<IqamaRenewalStatus, string> =
  {
    pending_upload:
      'border-amber-200 bg-amber-50 text-amber-700 ring-amber-600/10 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
    uploaded_to_mhrsd:
      'border-blue-200 bg-blue-50 text-blue-700 ring-blue-600/10 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
    under_process:
      'border-indigo-200 bg-indigo-50 text-indigo-700 ring-indigo-600/10 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300',
    approved_by_mhrsd:
      'border-emerald-200 bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
    denied_by_mhrsd:
      'border-red-200 bg-red-50 text-red-700 ring-red-600/10 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300',
    sent_to_government_relations:
      'border-cyan-200 bg-cyan-50 text-cyan-700 ring-cyan-600/10 dark:border-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300',
    completed:
      'border-green-300 bg-green-100 text-green-800 ring-green-600/15 dark:border-green-700 dark:bg-green-950/60 dark:text-green-300',
    eoc_required:
      'border-rose-200 bg-rose-50 text-rose-700 ring-rose-600/10 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300',
    cancelled:
      'border-slate-300 bg-slate-100 text-slate-600 ring-slate-600/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400',
  }

export const IQAMA_RENEWAL_ACTION_STYLES: Record<
  ActionTone,
  {
    card: string
    icon: string
    menu: string
    menuIcon: string
  }
> = {
  default: {
    card: 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-100/80 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-900/70',
    icon: 'bg-slate-950 text-white shadow-slate-950/20 dark:bg-slate-100 dark:text-slate-950',
    menu: 'bg-slate-50/70 text-slate-700 focus:bg-slate-100 focus:text-slate-900 dark:bg-slate-900/40 dark:text-slate-300 dark:focus:bg-slate-800 dark:focus:text-slate-100',
    menuIcon: 'text-slate-600 dark:text-slate-300',
  },

  info: {
    card: 'border-blue-200 bg-blue-50/70 hover:border-blue-300 hover:bg-blue-100/70 dark:border-blue-900/70 dark:bg-blue-950/30 dark:hover:bg-blue-950/50',
    icon: 'bg-blue-600 text-white shadow-blue-600/20 dark:bg-blue-500',
    menu: 'bg-blue-50/80 text-blue-800 focus:bg-blue-100 focus:text-blue-900 dark:bg-blue-950/35 dark:text-blue-300 dark:focus:bg-blue-950/60 dark:focus:text-blue-200',
    menuIcon: 'text-blue-600 dark:text-blue-400',
  },

  success: {
    card: 'border-emerald-200 bg-emerald-50/70 hover:border-emerald-300 hover:bg-emerald-100/70 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50',
    icon: 'bg-emerald-600 text-white shadow-emerald-600/20 dark:bg-emerald-500',
    menu: 'bg-emerald-50/80 text-emerald-800 focus:bg-emerald-100 focus:text-emerald-900 dark:bg-emerald-950/35 dark:text-emerald-300 dark:focus:bg-emerald-950/60 dark:focus:text-emerald-200',
    menuIcon: 'text-emerald-600 dark:text-emerald-400',
  },

  warning: {
    card: 'border-amber-200 bg-amber-50/70 hover:border-amber-300 hover:bg-amber-100/70 dark:border-amber-900/70 dark:bg-amber-950/30 dark:hover:bg-amber-950/50',
    icon: 'bg-amber-500 text-white shadow-amber-500/20',
    menu: 'bg-amber-50/80 text-amber-800 focus:bg-amber-100 focus:text-amber-900 dark:bg-amber-950/35 dark:text-amber-300 dark:focus:bg-amber-950/60 dark:focus:text-amber-200',
    menuIcon: 'text-amber-600 dark:text-amber-400',
  },

  danger: {
    card: 'border-rose-200 bg-rose-50/70 hover:border-rose-300 hover:bg-rose-100/70 dark:border-rose-900/70 dark:bg-rose-950/30 dark:hover:bg-rose-950/50',
    icon: 'bg-rose-600 text-white shadow-rose-600/20',
    menu: 'bg-rose-50/80 text-rose-800 focus:bg-rose-100 focus:text-rose-900 dark:bg-rose-950/35 dark:text-rose-300 dark:focus:bg-rose-950/60 dark:focus:text-rose-200',
    menuIcon: 'text-rose-600 dark:text-rose-400',
  },
}

export function getIqamaRenewalDialogHeaderClass(
  status: IqamaRenewalStatus | null,
) {
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
