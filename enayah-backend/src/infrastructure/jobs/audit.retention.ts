// src/jobs/auditRetention.job.ts

import { auditLogs, db } from '../db'
import { lt } from 'drizzle-orm'
import { AuditPolicy } from '../modules/iam/audit/policies/audit.policy'

export async function purgeOldAuditLogs() {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - AuditPolicy.retentionDays)

  await db.delete(auditLogs).where(lt(auditLogs.createdAt, cutoff))
}
