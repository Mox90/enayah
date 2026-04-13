import z, { email } from 'zod'

export const loginSchema = z.object({
  username: z.string(),
  password: z.string().min(6),
})

export const signupSchema = z.object({
  username: z.string().min(3),
  email: z.email(),
  password: z.string().min(6),
  employeeId: z.uuid().optional(),
})
