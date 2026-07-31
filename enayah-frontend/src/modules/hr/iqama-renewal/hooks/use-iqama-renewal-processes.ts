// enayah-frontend/src/modules/hr/iqama-renewal/hooks/use-iqama-renewal-cases.ts

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
  CompleteIqamaRenewalPayload,
  CreateIqamaRenewalCasePayload,
  ReturnIqamaRenewalToHrPayload,
  UpdateIqamaRenewalCasePayload,
} from '../types/iqama-renewal.types'
import { iqamaRenewalCommentKeys } from './use-iqama-renewal-comments'
import { employeePersonalKeys } from '../../employees/hooks/use-employee-personal-details'

export const iqamaRenewalKeys = {
  all: ['iqama-renewal-cases'] as const,

  lists: () => [...iqamaRenewalKeys.all, 'list'] as const,

  list: (params: IqamaRenewalListParams) =>
    [...iqamaRenewalKeys.lists(), params] as const,

  details: () => [...iqamaRenewalKeys.all, 'detail'] as const,

  detail: (id: string) => [...iqamaRenewalKeys.details(), id] as const,

  assignees: () => [...iqamaRenewalKeys.all, 'assignees'] as const,

  governmentRelationsUsers: () =>
    [...iqamaRenewalKeys.assignees(), 'government-relations'] as const,
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
  //const t = useTranslations('iqamaRenewal')

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
  //const t = useTranslations('iqamaRenewal')

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

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: ChangeIqamaRenewalStatusPayload
    }) => iqamaRenewalService.changeIqamaRenewalStatus(id, payload),

    onSuccess: async (updatedCase, variables) => {
      queryClient.setQueryData(
        iqamaRenewalKeys.detail(updatedCase.id),
        updatedCase,
      )

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: iqamaRenewalKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey: iqamaRenewalCommentKeys.list(variables.id),
        }),
      ])

      toast.success('Iqama renewal status updated.')
    },

    onError: (error) => {
      console.error('Failed to update Iqama renewal status:', error)

      toast.error('Failed to update Iqama renewal status.')
    },
  })
}

export function useGovernmentRelationsUsers(enabled = true) {
  return useQuery({
    queryKey: iqamaRenewalKeys.governmentRelationsUsers(),
    queryFn: () => iqamaRenewalService.getGovernmentRelationsUsers(),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCompleteIqamaRenewal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: CompleteIqamaRenewalPayload
    }) => iqamaRenewalService.completeIqamaRenewal(id, payload),

    onSuccess: async (updatedCase) => {
      /*
       * Update the currently opened Iqama
       * renewal case immediately.
       */
      queryClient.setQueryData(
        iqamaRenewalKeys.detail(updatedCase.id),
        updatedCase,
      )

      await Promise.all([
        /*
         * Refresh the Iqama renewal table.
         */
        queryClient.invalidateQueries({
          queryKey: iqamaRenewalKeys.lists(),
        }),

        /*
         * Refresh the case discussion,
         * especially when completion creates
         * an automatic workflow comment.
         */
        queryClient.invalidateQueries({
          queryKey: iqamaRenewalCommentKeys.list(updatedCase.id),
        }),

        /*
         * Refresh the employee Personal tab.
         *
         * This reloads the identifications,
         * including the renewed Iqama dates.
         */
        queryClient.invalidateQueries({
          queryKey: employeePersonalKeys.detail(updatedCase.employeeId),
        }),
      ])

      toast.success('Iqama updated and renewal process completed.')
    },

    onError: (error) => {
      console.error('Failed to complete Iqama renewal:', error)

      toast.error('Failed to update the Iqama.')
    },
  })
}

export function useReturnIqamaRenewalToHr() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: ReturnIqamaRenewalToHrPayload
    }) => iqamaRenewalService.returnToHr(id, payload),

    onSuccess: async (updatedCase) => {
      queryClient.setQueryData(
        iqamaRenewalKeys.detail(updatedCase.id),
        updatedCase,
      )

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: iqamaRenewalKeys.lists(),
        }),

        /*
         * The transaction created a new
         * top-level comment.
         */
        queryClient.invalidateQueries({
          queryKey: iqamaRenewalCommentKeys.list(updatedCase.id),
        }),
      ])

      toast.success('The case was returned to HR.')
    },

    onError: (error) => {
      console.error('Failed to return Iqama renewal case:', error)

      toast.error('Failed to return the case to HR.')
    },
  })
}
