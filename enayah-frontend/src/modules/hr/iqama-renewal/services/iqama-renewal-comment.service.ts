// enayah-frontend/src/modules/hr/iqama-renewal/services/iqama-renewal-comment.service.ts

import { api } from '@/lib/api/client'

import type {
  CreateIqamaRenewalCommentPayload,
  IqamaRenewalCaseComment,
  ReplyToIqamaRenewalCommentPayload,
} from '../types/iqama-renewal-comment.types'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

type ApiResponse<T> = {
  data: T
}

//const BASE_PATH = '/hr/iqama-renewal-process'

export async function getIqamaRenewalCaseComments(
  caseId: string,
): Promise<IqamaRenewalCaseComment[]> {
  const response = await api.get<ApiResponse<IqamaRenewalCaseComment[]>>(
    `${API_ENDPOINTS.hr.iqamaRenewal}/${caseId}/comments`,
  )

  return response.data.data
}

export async function createIqamaRenewalCaseComment(
  caseId: string,
  payload: CreateIqamaRenewalCommentPayload,
): Promise<IqamaRenewalCaseComment> {
  const response = await api.post<ApiResponse<IqamaRenewalCaseComment>>(
    `${API_ENDPOINTS.hr.iqamaRenewal}/${caseId}/comments`,
    payload,
  )

  return response.data.data
}

export async function replyToIqamaRenewalCaseComment(
  caseId: string,
  commentId: string,
  payload: ReplyToIqamaRenewalCommentPayload,
): Promise<IqamaRenewalCaseComment> {
  const response = await api.post<ApiResponse<IqamaRenewalCaseComment>>(
    `${API_ENDPOINTS.hr.iqamaRenewal}/${caseId}/comments/${commentId}/replies`,
    payload,
  )

  return response.data.data
}
