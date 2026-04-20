import { AppError } from '../../../../core/errors/AppError'
import { auditLogger } from '../../../../core/logging/auditLogger'
import { TOTP } from '../../../../core/security/totp'
import { UserRepository } from '../../users/repository/user.repository'
import { MFARepository } from '../repository/mfa.repository'

export const MFAService = {
  setup: async (user: any) => {
    const currentUser = await UserRepository.findUserById(user.id)

    if (!currentUser) {
      throw new AppError('User not found', 404)
    }

    if (!currentUser.isActive) {
      throw new AppError('Account disabled', 403)
    }

    if (currentUser.mfaEnabled) {
      throw new AppError('MFA already enabled', 400)
    }

    if (!currentUser.email) {
      throw new AppError('User email is required for MFA setup', 400)
    }

    const secret = TOTP.generateSecret(currentUser.email)

    await MFARepository.saveSecret(currentUser.id, secret.base32)

    const qr = await TOTP.generateQRCode(secret.otpauth_url!)

    return {
      qrCode: qr,
      manualKey: secret.base32,
    }
  },

  /*verifyAndEnable: async (user: any, token: string) => {
    console.log('USER: >>> ', user)
    if (!user.mfaSecret) {
      throw new AppError('MFA not initialized', 400)
    }

    const isValid = TOTP.verify(token, user.mfaSecret)

    if (!isValid) {
      throw new AppError('Invalid MFA code', 401)
    }

    await MFARepository.enableMFA(user.id)

    await auditLogger.log({
      userId: user.id,
      action: 'MFA_ENABLED',
    })

    return { message: 'MFA enabled successfully' }
  },*/

  verifyAndEnable: async (userId: string, token: string) => {
    const user = await UserRepository.findUserById(userId)

    if (!user) {
      throw new AppError('User not found', 404)
    }

    if (!user.isActive) {
      throw new AppError('Account disabled', 403)
    }

    if (user.mfaEnabled) {
      throw new AppError('MFA already enabled', 400)
    }

    if (!user.mfaSecret) {
      throw new AppError('MFA not initialized', 400)
    }

    const isValid = TOTP.verify(token, user.mfaSecret)

    if (!isValid) {
      throw new AppError('Invalid MFA code', 401)
    }

    await MFARepository.enableMFA(user.id)

    await auditLogger.log({
      userId: user.id,
      action: 'MFA_ENABLED',
    })

    return { message: 'MFA enabled successfully' }
  },

  /*verifyLogin: async (user: any, token: string) => {
    if (!user.mfaSecret) {
      throw new AppError('MFA not configured', 400)
    }

    const isValid = TOTP.verify(token, user.mfaSecret)

    if (!isValid) {
      throw new AppError('Invalid MFA code', 401)
    }

    return true
  },
*/

  verifyLogin: async (userId: string, token: string) => {
    const user = await UserRepository.findUserById(userId)

    if (!user) throw new AppError('User not found', 404)

    if (!user.isActive) {
      throw new AppError('Account disabled', 403)
    }

    if (!user.mfaEnabled) {
      throw new AppError('MFA not enabled', 400)
    }

    if (!user.mfaSecret) {
      throw new AppError('MFA not configured', 400)
    }

    const isValid = TOTP.verify(token, user.mfaSecret)

    if (!isValid) {
      throw new AppError('Invalid MFA code', 401)
    }

    return true
  },

  disable: async (user: any) => {
    const res = await UserRepository.findUserById(user.id)

    if (!res) {
      throw new AppError('User not found', 404)
    }

    if (!res.isActive) {
      throw new AppError('Account disabled', 403)
    }

    if (!res.mfaEnabled) {
      throw new AppError('MFA is not enabled', 400)
    }

    await MFARepository.disableMFA(res.id)

    await auditLogger.log({
      userId: user.id,
      action: 'MFA_DISABLED',
    })

    return { message: 'MFA disabled successfully' }
  },
}
