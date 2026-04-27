import crypto from 'crypto'

export function generateAuditHash(data: any): string {
  const payload = JSON.stringify(data)
  return crypto.createHash('sha256').update(payload).digest('hex')
}
