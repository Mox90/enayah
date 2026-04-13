import { AuthResponseDTO } from './auth.response'

export const toAuthResponse = (user: any): AuthResponseDTO => ({
  id: user.id,
  email: user.email,
  username: user.username,
  employeeId: user.employeeId,
})
