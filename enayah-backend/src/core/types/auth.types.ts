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
  sid: z.uuid(),
  sub: z.uuid(),
  employeeId: z.uuid().optional(),
  roles: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
  iat: z.number().optional(),
  exp: z.number().optional(),
})

export type AppJwtPayload = z.infer<typeof jwtPayloadSchema>
