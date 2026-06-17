import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { EmployeeCredentialsResponse } from '../../onboarding/types/onboarding.types'

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
}
