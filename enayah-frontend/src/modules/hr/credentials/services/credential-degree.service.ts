// src/modules/hr/credentials/services/credential-degree.service.ts

import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export type CreateDegreePayload = {
  employeeId: string
  degreeType:
    | 'diploma'
    | 'associate'
    | 'bachelor'
    | 'master'
    | 'doctorate'
    | 'other'
  degreeName: string
  major?: string | null
  institution: string
  graduationDate?: string | null
  isVerified?: boolean
}

export type UpdateDegreePayload = Omit<
  Partial<CreateDegreePayload>,
  'employeeId'
> & {
  id: string
}

export const credentialDegreeService = {
  create: async ({ employeeId, ...body }: CreateDegreePayload) => {
    const response = await api.post(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/degrees`,
      body,
    )
    //console.log('Data is: ', response.data)
    return response.data
  },

  update: async ({ id, ...body }: UpdateDegreePayload) => {
    const response = await api.patch(
      `${API_ENDPOINTS.hr.credentials}/degrees/${id}`,
      body,
    )

    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(
      `${API_ENDPOINTS.hr.credentials}/degrees/${id}`,
    )

    return response.data
  },
}
