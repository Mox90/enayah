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
  identificationId: string

  employeeNumber: string | null
  employeeNameEn: string | null
  employeeNameAr: string | null

  iqamaNumber: string | null
  expiryDate: string | null

  status: IqamaRenewalStatus

  assignedToUserId: string | null
  assignedToName: string | null

  governmentRelationsDueDate: string | null

  notes: string | null
  denialReason: string | null

  mhrsdUploadedAt: string | null
  mhrsdApprovedAt: string | null
  mhrsdDeniedAt: string | null

  version: number

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
  //status: IqamaRenewalStatus

  assignedToUserId?: string | null
  governmentRelationsDueDate?: string | null

  notes?: string | null
  //denialReason?: string | null

  //mhrsdUploadedAt?: string | null
  //mhrsdApprovedAt?: string | null
  //mhrsdDeniedAt?: string | null
  version: number
}

export type ChangeIqamaRenewalStatusPayload = {
  status: IqamaRenewalStatus
  assignedToUserId?: string | null
  governmentRelationsDueDate?: string | null
  denialReason?: string | null
  notes?: string | null
  version: number
}

export type AssigneeOption = {
  id: string
  label: string
}

export type IqamaRenewalView = 'list' | 'kanban'
