import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { RenewContractPayload } from '../types/contract-renewal.types'
import { ApplyContractMovementPayload } from '../types/contract-movement.types'

export const contractService = {
  renew: async (payload: RenewContractPayload) => {
    const response = await api.post(
      `${API_ENDPOINTS.hr.contracts}/renew`,
      payload,
    )
    //console.log('Renew Contract Response: ', response.data)
    return response.data
  },

  applyMovement: async (payload: ApplyContractMovementPayload) => {
    const response = await api.post(
      `${API_ENDPOINTS.hr.contracts}/movement`,
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
