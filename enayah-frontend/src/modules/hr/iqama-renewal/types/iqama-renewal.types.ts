// src/modules/hr/iqama-renewal/types/iqama-renewal.types.ts
export interface IqamaRenewalPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type IqamaRenewalStatus =
  | 'pending_upload'
  | 'uploaded_to_mhrsd'
  | 'under_process'
  | 'approved_by_mhrsd'
  | 'denied_by_mhrsd'
  | 'sent_to_government_relations'
  | 'completed'
  | 'eoc_required'
  | 'cancelled'

export type IqamaRenewalCase = {
  id: string

  employeeId: string
  employeeNumber: string
  employeeNameEn: string
  employeeNameAr?: string | null

  identificationId: string
  iqamaNumber: string
  expiryDate: string
  expiryDateHijri?: string | null

  status: IqamaRenewalStatus

  assignedToUserId?: string | null
  assignedToName?: string | null

  mhrsdUploadedAt?: string | null
  mhrsdApprovedAt?: string | null
  mhrsdDeniedAt?: string | null

  governmentRelationsDueDate?: string | null

  notes?: string | null
  denialReason?: string | null

  createdAt: string
  updatedAt: string
}

export interface IqamaRenewalCaseListResponse {
  data: IqamaRenewalCase[]
  pagination: IqamaRenewalPagination
}

export type CreateIqamaRenewalCasePayload = {
  employeeId: string
  identificationId: string
  assignedToUserId?: string | null
  governmentRelationsDueDate?: string | null
  notes?: string | null
}

export type UpdateIqamaRenewalCasePayload = {
  status: IqamaRenewalStatus

  assignedToUserId?: string | null
  governmentRelationsDueDate?: string | null

  notes?: string | null
  denialReason?: string | null

  mhrsdUploadedAt?: string | null
  mhrsdApprovedAt?: string | null
  mhrsdDeniedAt?: string | null
}

export type IqamaRenewalView = 'list' | 'kanban'
