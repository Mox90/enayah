// enayah-frontend/src/modules/hr/credentials/services/credential-board.service.ts

import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

// export type CreateBoardPayload = {
//   employeeId: string
//   boardName: string
//   specialty?: string | null
//   issuingBody: string
//   issueDate?: string | null
//   expiryDate?: string | null
//   isLifetime?: boolean
//   isVerified?: boolean
// }

export type BoardWritePayload = {
  boardName: string
  specialty?: string | null
  issuingBody: string
  issueDate?: string | null
  expiryDate?: string | null
  isLifetime?: boolean
  documentFile?: File | null
  //isVerified?: boolean
}

export type CreateBoardPayload = BoardWritePayload & {
  employeeId: string
}

export type UpdateBoardPayload = BoardWritePayload & {
  employeeId: string
  id: string
}

export type DeleteBoardPayload = {
  employeeId: string
  id: string
}

// export type UpdateBoardPayload = Partial<CreateBoardPayload> & {
//   id: string
// }

// export type UpdateBoardPayload = Omit<
//   Partial<CreateBoardPayload>,
//   'employeeId'
// > & {
//   id: string
// }

function buildBoardFormData(payload: BoardWritePayload): FormData {
  const { documentFile, ...boardData } = payload

  const formData = new FormData()

  /*
   * This name must match:
   *
   * parseCredentialMultipartBody(
   *   req.body,
   *   'board',
   *   schema,
   * )
   */
  formData.append('board', JSON.stringify(boardData))

  /*
   * This name must match:
   *
   * upload.single('document')
   */
  if (documentFile) {
    formData.append('document', documentFile, documentFile.name)
  }

  return formData
}

export const credentialBoardService = {
  create: async ({ employeeId, ...payload }: CreateBoardPayload) => {
    const response = await api.post(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/boards`,
      buildBoardFormData(payload),
    )

    return response.data
  },

  update: async ({ employeeId, id, ...payload }: UpdateBoardPayload) => {
    const response = await api.patch(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/boards/${id}`,
      buildBoardFormData(payload),
    )

    return response.data
  },

  delete: async ({ employeeId, id }: DeleteBoardPayload) => {
    const response = await api.delete(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/boards/${id}`,
    )

    return response.data
  },
}
