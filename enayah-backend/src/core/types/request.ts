import { Request } from 'express'

export type ValidatedRequest<P = any, B = any, Q = any> = Request & {
  validated?: {
    params?: P
    body?: B
    query?: Q
  }
}
