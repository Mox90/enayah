import { eq, or } from 'drizzle-orm'
import {
  comparePassword,
  generateToken,
  hashPassword,
} from '../../../../core/utils/auth.utils'
import {
  findUserByEmailOrUsername,
  createUserWithRole,
  findUserByUsername,
  getRoles,
  getPermissionsByRoleIds,
} from '../repository/auth.repository'
import { AppError } from '../../../../core/errors/AppError'
import { toAuthResponse } from '../dto/auth.mapper'

export const AuthService = {
  signup: async (data: any) => {
    const existing = await findUserByEmailOrUsername(data.email, data.username)

    if (existing) {
      throw new AppError('Email or Username already exists', 409)
    }

    const hashedPassword = await hashPassword(data.password)

    const user = await createUserWithRole({
      email: data.email,
      username: data.username,
      passwordHash: hashedPassword,
      employeeId: data.employeeId,
    })

    /*if (user) {
      siemLog({
        type: 'USER_SIGNUP',
        userId: user.id,
      })
    }*/

    if (!user) {
      throw new AppError('User creation failed', 500)
    }

    //return user
    return toAuthResponse(user)
  },

  login: async (username: string, password: string) => {
    const user = await findUserByUsername(username)

    if (!user || !user.passwordHash) {
      throw new AppError('Invalid credentials', 401)
    }

    const isValid = await comparePassword(password, user.passwordHash)

    if (!isValid) {
      throw new AppError('Invalid credentials', 401)
    }

    if (!user.isActive) {
      throw new AppError('Account disabled', 403)
    }

    const roles = await getRoles(user.id)
    const roleIds = roles.map((r: any) => r.roleId)

    //const permissions = await getPermissionsByRoleIds(roleIds)

    const token = generateToken({
      sub: user.id,
      employeeId: user.employeeId,
      roles: roleIds,
      //permissions,
    })

    return { token }
  },
}
