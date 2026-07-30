// enayah-backend/src/modules/hr/employees/dto/employee-avatar.dto.ts

import { z } from 'zod'

export const employeeAvatarParamsSchema = z.object({
  id: z.string().uuid(),
})

export type EmployeeAvatarParams = z.infer<typeof employeeAvatarParamsSchema>

export type EmployeeAvatarUploadResponse = {
  avatarFileId: string
  avatarUrl: string
  mimeType: 'image/webp'
  fileSize: number
  checksumSha256: string
}

export type EmployeeAvatarRemoveResponse = {
  avatarFileId: null
  avatarUrl: null
}
