import { Request } from 'express'

export interface AuthenticatedRequest extends Request {
  user: {
    id: string
    employeeId?: string
    roles?: string[]
    permissions?: string[]
  }
}
