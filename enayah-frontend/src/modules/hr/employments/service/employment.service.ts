// employment.service.ts

import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { EmploymentTimelineResponse } from '../types/employment-timeline'

export const employmentService = {
  getTimeline: async (
    employeeId: string,
  ): Promise<EmploymentTimelineResponse> => {
    const response = await api.get(
      `${API_ENDPOINTS.hr.employments}/employee/${employeeId}`,
    )

    return response.data
  },
}
