import { and, desc, eq, isNull, or, sql } from 'drizzle-orm'
import { DB, employeeIdentifications } from '../../db'

export const currentIqamaIdentification = (tx: DB) => {
  return tx
    .selectDistinctOn([employeeIdentifications.employeeId], {
      id: employeeIdentifications.id,
      employeeId: employeeIdentifications.employeeId,

      type: employeeIdentifications.type,
      identificationNumber: employeeIdentifications.identificationNumber,

      issueDate: employeeIdentifications.issueDate,
      expiryDate: employeeIdentifications.expiryDate,

      issueDateHijri: employeeIdentifications.issueDateHijri,
      expiryDateHijri: employeeIdentifications.expiryDateHijri,

      sponsor: employeeIdentifications.sponsor,
      issuingAuthority: employeeIdentifications.issuingAuthority,
      occupation: employeeIdentifications.occupation,

      isCurrent: employeeIdentifications.isCurrent,
      documentFileId: employeeIdentifications.documentFileId,
    })
    .from(employeeIdentifications)
    .where(
      and(
        or(
          eq(employeeIdentifications.type, 'iqama'),
          eq(employeeIdentifications.type, 'national_id'),
        ),
        eq(employeeIdentifications.isCurrent, true),
        eq(employeeIdentifications.isDeleted, false),
        isNull(employeeIdentifications.deletedAt),
      ),
    )
    .orderBy(
      employeeIdentifications.employeeId,

      // If malformed data contains multiple "current" Iqamas,
      // prefer the most recently issued one.
      sql`${employeeIdentifications.issueDate} DESC NULLS LAST`,

      desc(employeeIdentifications.createdAt),
    )
    .as('current_iqama')
}
