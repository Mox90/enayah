import 'express'

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string
      employeeId?: string
      roles?: string[]
      permissions?: string[]
    }

    requestContext?: {
      ip?: string
      userAgent?: string
      requestId?: string
    }

    validated?: {
      params?: any
      body?: any
      query?: any
    }
  }
}
