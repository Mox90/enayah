// src/modules/notifications/service/notification-generator.service.ts

import { and, eq, isNotNull } from 'drizzle-orm'
import {
  db,
  employeeIdentifications,
  employees,
  users,
  userRoles,
  roles,
  DB,
} from '../../../db'
import { NotificationRepository } from '../repository/notification.repository'
import { IqamaExpiryGenerator } from '../generators/iqama-expiry.generator'
import { LicenseExpiryGenerator } from '../generators/license-expiry.generator'
import { LifeSupportExpiryGenerator } from '../generators/life-support-expiry.generator'
import { MalpracticeExpiryGenerator } from '../generators/malpractice-expiry.generator'
import { MembershipExpiryGenerator } from '../generators/membership-expiry.generator'
import { PassportExpiryGenerator } from '../generators/passport-expiry.generator'

export const NotificationGeneratorService = {
  generateIqamaExpiryAlerts: async () => {
    return IqamaExpiryGenerator.run()
  },

  runAll: async () => {
    const iqama = await IqamaExpiryGenerator.run()
    const passport = await PassportExpiryGenerator.run()
    const license = await LicenseExpiryGenerator.run()
    const membership = await MembershipExpiryGenerator.run()
    const lifeSupport = await LifeSupportExpiryGenerator.run()
    const malpractice = await MalpracticeExpiryGenerator.run()

    return {
      iqama,
      passport,
      license,
      membership,
      lifeSupport,
      malpractice,
    }
  },
}
