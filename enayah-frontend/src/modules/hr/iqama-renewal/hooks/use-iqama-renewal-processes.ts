// src/modules/hr/iqama-renewal/hooks/use-iqama-renewal-cases.ts

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { iqamaRenewalService } from '../services/iqama-renewal.service'
import type { IqamaRenewalListParams } from '../services/iqama-renewal.service'
import type {
  ChangeIqamaRenewalStatusPayload,
  CreateIqamaRenewalCasePayload,
  UpdateIqamaRenewalCasePayload,
} from '../types/iqama-renewal.types'
import { useTranslations } from 'next-intl'

export const iqamaRenewalKeys = {
  all: ['iqama-renewal-cases'] as const,

  lists: () => [...iqamaRenewalKeys.all, 'list'] as const,

  list: (params: IqamaRenewalListParams) =>
    [...iqamaRenewalKeys.lists(), params] as const,

  details: () => [...iqamaRenewalKeys.all, 'detail'] as const,

  detail: (id: string) => [...iqamaRenewalKeys.details(), id] as const,
}

export function useIqamaRenewalProcesses(params: IqamaRenewalListParams) {
  //console.log(params)
  return useQuery({
    queryKey: iqamaRenewalKeys.list(params),
    queryFn: () => iqamaRenewalService.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useIqamaRenewalProcess(id?: string | null) {
  return useQuery({
    queryKey: iqamaRenewalKeys.detail(id ?? ''),
    queryFn: () => iqamaRenewalService.findById(id!),
    enabled: Boolean(id),
  })
}

export function useCreateIqamaRenewalProcess() {
  const queryClient = useQueryClient()
  const t = useTranslations('iqamaRenewal')

  return useMutation({
    mutationFn: (payload: CreateIqamaRenewalCasePayload) =>
      iqamaRenewalService.create(payload),

    onSuccess: async (created) => {
      queryClient.setQueryData(iqamaRenewalKeys.detail(created.id), created)

      await queryClient.invalidateQueries({
        queryKey: iqamaRenewalKeys.lists(),
      })

      toast.success('Iqama renewal process created successfully')
    },

    onError: (error) => {
      console.error(error)
      toast.error('Failed to create Iqama renewal process')
    },
  })
}

export function useUpdateIqamaRenewalCase() {
  const queryClient = useQueryClient()
  const t = useTranslations('iqamaRenewal')

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateIqamaRenewalCasePayload
    }) => iqamaRenewalService.update(id, payload),

    onSuccess: async (updated) => {
      queryClient.setQueryData(iqamaRenewalKeys.detail(updated.id), updated)
      await queryClient.invalidateQueries({
        queryKey: iqamaRenewalKeys.lists(),
      })

      toast.success('Iqama renewal process updated successfully')
    },

    onError: (error) => {
      console.error(error)
      toast.error('Failed to update Iqama renewal process')
    },
  })
}

export function useChangeIqamaRenewalStatus() {
  const queryClient = useQueryClient()
  const t = useTranslations('iqamaRenewal')

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: ChangeIqamaRenewalStatusPayload
    }) => iqamaRenewalService.changeIqamaRenewalStatus(id, payload),

    onSuccess: async (updatedCase) => {
      queryClient.setQueryData(
        iqamaRenewalKeys.detail(updatedCase.id),
        updatedCase,
      )

      await queryClient.invalidateQueries({
        queryKey: iqamaRenewalKeys.lists(),
      })

      toast.success('Iqama renewal status updated.')
    },

    onError: (error) => {
      console.error(error)
      toast.error('Failed to update Iqama renewal status.')
    },
  })
}
