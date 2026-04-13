import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env'
//import { env } from '../../../config/env'

export const hashPassword = (password: string) => bcrypt.hash(password, 10)

export const comparePassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash)

export const generateToken = (payload: any) =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '8h',
  })
