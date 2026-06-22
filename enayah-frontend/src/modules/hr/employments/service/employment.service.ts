// employment.service.ts

import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export const employmentService = {
  getTimeline: async (employeeId: string) => {
    const response = await api.get(
      `${API_ENDPOINTS.hr.employments}/employee/${employeeId}`,
    )

    return response.data
  },
}
