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

export const verifyMfaSchema = z.object({
  userId: z.string().uuid(),

  // TOTP is typically 6 digits
  //token: z.string().length(6).regex(/^\d+$/, 'Token must be numeric'),
  token: z
    .string()
    .transform((val) => val.replace(/\s|-/g, ''))
    .refine((val) => /^\d{6}$/.test(val), {
      message: 'Invalid MFA token',
    }),
})
