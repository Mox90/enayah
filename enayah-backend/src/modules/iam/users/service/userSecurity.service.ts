import { addMinutes } from '../../../../core/utils/date'
import { AppError } from '../../../../core/errors/AppError'
import { UserRepository } from '../repository/user.repository'

const MAX_ATTEMPTS = 5
const LOCK_DURATION_MINUTES = 15

export const UserSecurityService = {
  checkLock: (user: any) => {
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      throw new AppError('Account locked. Try again later.', 403)
    }
  },

  handleFailedLogin: async (user: any) => {
    const attempts = (user.failedLoginAttempts ?? 0) + 1

    if (attempts >= MAX_ATTEMPTS) {
      const lockedUntil = addMinutes(new Date(), LOCK_DURATION_MINUTES)

      await UserRepository.lockAccount(user.id, lockedUntil)

      // 🔥 audit hook (later you can expand)
      console.warn(`🔒 User ${user.id} locked until ${lockedUntil}`)

      throw new AppError('Account locked due to multiple failed attempts', 403)
    }

    await UserRepository.incrementFailedAttempts(user.id)
  },

  handleSuccessfulLogin: async (userId: string) => {
    await UserRepository.resetFailedAttempts(userId)
  },
}
