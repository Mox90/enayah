// enayah-frontend/src/modules/hr/iqama-renewal/hooks/use-iqama-renewal-workflow.ts

'use client'

import { useState } from 'react'

import type { Identification } from '@/modules/hr/employees/types/employee-personal-details.types'

import {
  useChangeIqamaRenewalStatus,
  useCompleteIqamaRenewal,
  useGovernmentRelationsUsers,
  useReturnIqamaRenewalToHr,
} from './use-iqama-renewal-processes'

import type {
  ChangeIqamaRenewalStatusPayload,
  IqamaRenewalCase,
  IqamaRenewalStatus,
} from '../types/iqama-renewal.types'

import type { IqamaRenewalAccess } from './use-iqama-renewal-access'

import { getAvailableActions } from '../config/iqama-renewal-workflow.config'

interface Args {
  renewalCase: IqamaRenewalCase | null
  access: IqamaRenewalAccess
}

export function useIqamaRenewalWorkflow({ renewalCase, access }: Args) {
  //--------------------------------
  // Mutations
  //--------------------------------

  const changeStatus = useChangeIqamaRenewalStatus()

  const completeIqamaRenewal = useCompleteIqamaRenewal()

  const returnToHr = useReturnIqamaRenewalToHr()

  //--------------------------------
  // Status transition state
  //--------------------------------

  const [selectedStatus, setSelectedStatus] =
    useState<IqamaRenewalStatus | null>(null)

  const [denialReason, setDenialReason] = useState('')

  const [comment, setComment] = useState('')

  const [assignedToUserId, setAssignedToUserId] = useState('')

  const [governmentRelationsDueDate, setGovernmentRelationsDueDate] =
    useState('')

  //--------------------------------
  // Special dialogs
  //--------------------------------

  const [isIqamaDialogOpen, setIsIqamaDialogOpen] = useState(false)

  const [isReturnToHrDialogOpen, setIsReturnToHrDialogOpen] = useState(false)

  const [returnReason, setReturnReason] = useState('')

  //--------------------------------
  // Workflow actions
  //--------------------------------

  const actions =
    access.canManageWorkflow && renewalCase?.status
      ? getAvailableActions(renewalCase.status)
      : []

  const selectedAction =
    actions.find((action) => action.status === selectedStatus) ?? null

  //--------------------------------
  // Government Relations users
  //--------------------------------

  const shouldLoadGovernmentRelationsUsers =
    access.canManageWorkflow && renewalCase?.status === 'approved_by_mhrsd'

  const {
    data: governmentRelationsUsers = [],
    isLoading: isLoadingGovernmentRelationsUsers,
    isError: isGovernmentRelationsUsersError,
  } = useGovernmentRelationsUsers(shouldLoadGovernmentRelationsUsers)

  const governmentRelationsUsersUnavailable =
    isLoadingGovernmentRelationsUsers ||
    isGovernmentRelationsUsersError ||
    governmentRelationsUsers.length === 0

  //--------------------------------
  // Assigned Government Relations user
  //--------------------------------

  const canHandleAssignedGovernmentRelationsCase =
    renewalCase !== null &&
    access.canProcessGovernmentRelations &&
    access.currentUserId !== null &&
    renewalCase.status === 'sent_to_government_relations' &&
    renewalCase.assignedToUserId === access.currentUserId

  //--------------------------------
  // Action requirements
  //--------------------------------

  const requiresDenialReason = selectedStatus === 'denied_by_mhrsd'

  const requiresGovernmentRelationsAssignment =
    selectedStatus === 'sent_to_government_relations'

  //--------------------------------
  // Confirmation state
  //--------------------------------

  const confirmDisabled =
    changeStatus.isPending ||
    !renewalCase ||
    !selectedStatus ||
    (requiresDenialReason && !denialReason.trim()) ||
    (requiresGovernmentRelationsAssignment &&
      (governmentRelationsUsersUnavailable ||
        !assignedToUserId ||
        !governmentRelationsDueDate))

  //--------------------------------
  // Iqama
  //--------------------------------

  const initialIqama: Identification | null = renewalCase?.identification
    ? {
        ...renewalCase.identification,
        type: 'iqama',
        isCurrent: true,
      }
    : null

  //--------------------------------
  // Status dialog helpers
  //--------------------------------

  function clearStatusFields() {
    setDenialReason('')
    setComment('')
    setAssignedToUserId('')
    setGovernmentRelationsDueDate('')
  }

  function openStatusAction(status: IqamaRenewalStatus) {
    clearStatusFields()
    setSelectedStatus(status)
  }

  function closeStatusDialog() {
    if (changeStatus.isPending) {
      return
    }

    setSelectedStatus(null)
    clearStatusFields()
  }

  //--------------------------------
  // Confirm status
  //--------------------------------

  async function confirmStatusChange() {
    if (!renewalCase || !selectedStatus || confirmDisabled) {
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

      setSelectedStatus(null)
      clearStatusFields()
    } catch {
      // Mutation hook handles toast/error.
    }
  }

  //--------------------------------
  // Iqama dialog
  //--------------------------------

  function openIqamaDialog() {
    setIsIqamaDialogOpen(true)
  }

  function closeIqamaDialog() {
    if (completeIqamaRenewal.isPending) {
      return
    }

    setIsIqamaDialogOpen(false)
  }

  async function completeIqama(identification: Identification) {
    if (!renewalCase) {
      return
    }

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

  //--------------------------------
  // Return to HR
  //--------------------------------

  function openReturnToHrDialog() {
    setReturnReason('')
    setIsReturnToHrDialogOpen(true)
  }

  function closeReturnToHrDialog() {
    if (returnToHr.isPending) {
      return
    }

    setReturnReason('')
    setIsReturnToHrDialogOpen(false)
  }

  async function confirmReturnToHr() {
    if (!renewalCase || !returnReason.trim() || returnToHr.isPending) {
      return
    }

    try {
      await returnToHr.mutateAsync({
        id: renewalCase.id,

        payload: {
          version: renewalCase.version,
          reason: returnReason.trim(),
        },
      })

      setReturnReason('')
      setIsReturnToHrDialogOpen(false)
    } catch {
      // Mutation hook handles error.
    }
  }

  return {
    renewalCase,

    actions,
    selectedAction,

    selectedStatus,

    denialReason,
    setDenialReason,

    comment,
    setComment,

    assignedToUserId,
    setAssignedToUserId,

    governmentRelationsDueDate,
    setGovernmentRelationsDueDate,

    requiresDenialReason,
    requiresGovernmentRelationsAssignment,

    governmentRelationsUsers,
    isLoadingGovernmentRelationsUsers,
    isGovernmentRelationsUsersError,

    canHandleAssignedGovernmentRelationsCase,

    confirmDisabled,

    openStatusAction,
    closeStatusDialog,
    confirmStatusChange,

    initialIqama,

    isIqamaDialogOpen,
    openIqamaDialog,
    closeIqamaDialog,
    completeIqama,

    isReturnToHrDialogOpen,
    openReturnToHrDialog,
    closeReturnToHrDialog,

    returnReason,
    setReturnReason,
    confirmReturnToHr,

    isChangingStatus: changeStatus.isPending,

    isCompletingIqama: completeIqamaRenewal.isPending,

    isReturningToHr: returnToHr.isPending,
  }
}

export type IqamaRenewalWorkflowController = ReturnType<
  typeof useIqamaRenewalWorkflow
>
