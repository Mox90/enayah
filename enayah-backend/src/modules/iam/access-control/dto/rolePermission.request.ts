import { z } from 'zod'

export const roleParamsSchema = z.object({
  roleId: z.uuid(),
})

export const rolePermissionParamsSchema = z.object({
  roleId: z.uuid(),
  permissionId: z.uuid(),
})

export const assignPermissionSchema = z.object({
  permissionIds: z.array(z.uuid()),
})

export const removePermissionSchema = z.object({
  roleId: z.uuid(),
  permissionId: z.uuid(),
})

export type RoleParamsDTO = z.infer<typeof roleParamsSchema>
export type RolePermissionParamsDTO = z.infer<typeof rolePermissionParamsSchema>
export type AssignPermissionDTO = z.infer<typeof assignPermissionSchema>
