// src/modules/hr/credentials/services/credential-degree.service.ts

import { api } from '@/lib/api/client'

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

export type UpdateDegreePayload = Partial<CreateDegreePayload> & {
  id: string
}

export const credentialDegreeService = {
  create: async ({ employeeId, ...body }: CreateDegreePayload) => {
    const response = await api.post(
      `/hr/employees/${employeeId}/credentials/degrees`,
      body,
    )

    return response.data
  },

  update: async ({ id, ...body }: UpdateDegreePayload) => {
    const response = await api.patch(`/hr/credentials/degrees/${id}`, body)

    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/hr/credentials/degrees/${id}`)

    return response.data
  },
}
