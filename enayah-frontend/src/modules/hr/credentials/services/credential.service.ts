import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export const credentialService = {
  getEmployeeCredentials: async (employeeId: string) => {
    const response = await api.get(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}`,
    )

    console.log(`${API_ENDPOINTS.hr.credentials}/employee/${employeeId}`)
    console.log(response)

    return response.data
  },
}
