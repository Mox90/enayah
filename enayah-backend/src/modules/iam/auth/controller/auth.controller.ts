import { NextFunction, Request, Response } from 'express'
import { sign } from 'node:crypto'
import { loginSchema, signupSchema } from '../dto/auth.request'
import { AuthService } from '../service/auth.service'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import { SessionService } from '../../session/service/session.service'

export const AuthController = {
  signup: asyncHandler(async (req: Request, res: Response) => {
    const body = signupSchema.parse(req.body)

    const result = await AuthService.signup(body)
    res.status(201).json(result)
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const body = loginSchema.parse(req.body)
    const ip = req.ip ?? 'unknown'

    const result = await AuthService.login(
      body.username,
      body.password,
      ip,
      req.headers['user-agent'] ?? 'unknown',
    )
    res.status(200).json(result)
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body

    const result = await SessionService.refreshSession(refreshToken)

    res.json(result)
  }),
}

/*export const signupHandler = async (req: Request, res: Response) => {
  console.log('Hitting signup')
  try {
    const user = await signup(req.body)
    res.json(user)
  } catch (error: any) {
    console.error('CONTROLLER ERROR:', error)
    res.status(error.statusCode || 500).json({
      message: error.message || 'Internal error',
    })
  }
}

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const result = await login({
      ...req.body,
      ip: req.ip,
    })

    res.json(result)
  } catch (error: any) {
    console.error('CONTROLLER ERROR:', error)
    res.status(error.statusCode || 500).json({
      message: error.message || 'Internal error',
    })
  }
}

export default { signupHandler, loginHandler }*/
