import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { EmployeeCredentialsResponse } from '../../onboarding/types/onboarding.types'

export type DegreeDocumentRequest = {
  employeeId: string
  degreeId: string
}

export const credentialService = {
  getEmployeeCredentials: async (
    employeeId: string,
  ): Promise<EmployeeCredentialsResponse> => {
    const response = await api.get<EmployeeCredentialsResponse>(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}`,
    )

    //console.log(`${API_ENDPOINTS.hr.credentials}/employee/${employeeId}`)
    //console.log(response)

    return response.data
  },

  previewDocument: async ({
    employeeId,
    degreeId,
  }: DegreeDocumentRequest): Promise<Blob> => {
    const response = await api.get<Blob>(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/degrees/${degreeId}/document/preview`,
      {
        responseType: 'blob',
      },
    )

    return response.data
  },

  downloadDocument: async ({
    employeeId,
    degreeId,
  }: DegreeDocumentRequest): Promise<Blob> => {
    const response = await api.get<Blob>(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/degrees/${degreeId}/document/download`,
      {
        responseType: 'blob',
      },
    )

    return response.data
  },
}
