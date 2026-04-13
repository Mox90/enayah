import { siemLog } from '../logging/siem.logger'

export const detectAnomaly = (user: any, ip: string) => {
  if (!user.lastLoginAt) return

  const lastIp = user.lastLoginIp

  if (lastIp && lastIp !== ip) {
    siemLog({
      type: 'ANOMALY_IP_CHANGE',
      userId: user.id,
      ip,
    })
  }
}
