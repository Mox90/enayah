import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { RenewContractPayload } from '../types/contract-renewal.types'

export const contractService = {
  renew: async (payload: RenewContractPayload) => {
    const response = await api.post(
      `${API_ENDPOINTS.hr.contracts}/renew`,
      payload,
    )
    return response.data
  },

  getRenewalDefaults: async (contractId: string) => {
    const response = await api.get(
      `${API_ENDPOINTS.hr.contracts}/${contractId}/renewal-defaults`,
    )

    return response.data
  },
}
