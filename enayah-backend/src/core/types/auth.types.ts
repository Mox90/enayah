import z from 'zod'

export interface SignupDTO {
  email: string
  username: string
  password: string
  employeeId: string
}

export interface LoginDTO {
  username: string
  password: string
  ip: string
}

export const jwtPayloadSchema = z.object({
  sub: z.string(),
  employeeId: z.string().optional(),
  roles: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
})

/*export interface AppJwtPayload {
  sub: string
  employeeId?: string
  roles: string[]
  permissions: string[]
}*/

export type AppJwtPayload = z.infer<typeof jwtPayloadSchema>
