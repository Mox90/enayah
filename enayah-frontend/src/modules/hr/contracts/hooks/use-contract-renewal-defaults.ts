import { useQuery } from '@tanstack/react-query'
import { contractService } from '../services/contract.service'

export function useContractRenewalDefaults(
  contractId?: string,
  enabled = false,
) {
  return useQuery({
    queryKey: ['contract-renewal-defaults', contractId],
    queryFn: () => contractService.getRenewalDefaults(contractId!),
    enabled: enabled && !!contractId,
  })
}
