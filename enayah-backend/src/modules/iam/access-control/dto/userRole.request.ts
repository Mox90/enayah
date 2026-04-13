import { z } from 'zod'

export const userParamsSchema = z.object({
  userId: z.uuid(),
})

export const userRoleParamsSchema = z.object({
  userId: z.uuid(),
  roleId: z.uuid(),
})

export const assignRoleSchema = z.object({
  roleId: z.uuid(),
})

export const removeRoleSchema = z.object({
  userId: z.uuid(),
  roleId: z.uuid(),
})

export type UserParamsDTO = z.infer<typeof userParamsSchema>
export type AssignRoleDTO = z.infer<typeof assignRoleSchema>
export type UserRoleParamsDTO = z.infer<typeof userRoleParamsSchema>
