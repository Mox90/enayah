// enayah-frontend/src/modules/hr/employees/hire/services/hire.service.ts

import { api } from '@/lib/api/client'
import { HireEmployeePayload } from '../types/onboarding.types'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
//import { HireEmployeePayload } from '../types/hire.types'

export const onboardService = {
  submit: async (payload: HireEmployeePayload) => {
    const response = await api.post(`${API_ENDPOINTS.hr.onboarding}`, payload)

    return response.data
  },
}
