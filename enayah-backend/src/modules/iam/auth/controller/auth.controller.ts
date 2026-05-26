import { NextFunction, Request, Response } from 'express'
import { loginSchema, signupSchema, verifyMfaSchema } from '../dto/auth.request'
import { AuthService } from '../service/auth.service'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import { SessionService } from '../../session/service/session.service'
//import { refreshSchema } from '../../session/dto/session.request'
import { AppError } from '../../../../core/errors/AppError'
import {
  findAuthenticatedUserById,
  findUserById,
} from '../repository/auth.repository'
import { toAuthResponse } from '../dto/auth.mapper'
const isProd = process.env.NODE_ENV === 'production'
const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
} as const

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

    if ('mfaRequired' in result) {
      return res.status(200).json(result)
    }

    /*res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: false, //process.env.NODE_ENV === 'production',
      sameSite: 'lax', //process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })*/
    res.cookie('refreshToken', result.refreshToken, refreshCookieOptions)
    res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
    })
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      throw new AppError('Refresh token missing', 401)
    }

    const result = await SessionService.refreshSession(refreshToken)

    // optionally rotate cookie
    /*res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: false, //process.env.NODE_ENV === 'production',
      sameSite: 'lax', //process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })*/
    res.cookie('refreshToken', result.refreshToken, refreshCookieOptions)

    return res.json({
      accessToken: result.accessToken,
    })
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
      throw new AppError('Unauthorized', 401)
    }

    //const user = await findUserById(req.user.id)
    const user = await findAuthenticatedUserById(req.user.id)

    if (!user) {
      throw new AppError('User not found', 404)
    }

    return res.json({
      user: toAuthResponse(user),
    })
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    //const { refreshToken } = refreshSchema.parse(req.body)
    const refreshToken = req.cookies.refreshToken

    /*if (!req.user?.id) {
      throw new AppError('Unauthorized', 401)
    }*/
    if (!refreshToken) {
      throw new AppError('Unauthorized', 401)
    }

    await SessionService.logout(refreshToken)

    //res.clearCookie('refreshToken')
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    })

    res.json({ message: 'Logged out successfully' })
  }),

  logoutAll: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
      throw new AppError('Unauthorized', 401)
    }

    await SessionService.logoutAll(req.user.id)

    res.json({ message: 'Logged out from all devices' })
  }),

  verifyMfa: asyncHandler(async (req: Request, res: Response) => {
    const { userId, token } = verifyMfaSchema.parse(req.body)

    const result = await AuthService.verifyMfaLogin(
      userId,
      token,
      req.ip ?? 'unknown',
      req.headers['user-agent'] ?? 'unknown',
    )

    if ('refreshToken' in result) {
      res.cookie('refreshToken', result.refreshToken, refreshCookieOptions)
      return res.json({
        accessToken: result.accessToken,
        user: result.user,
      })
    }

    return res.json(result)
  }),
}
