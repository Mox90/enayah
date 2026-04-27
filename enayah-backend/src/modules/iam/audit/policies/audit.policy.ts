// src/modules/iam/audit/policies/audit.policy.ts
export const AuditPolicy = {
  retentionDays: 365 * 5, // 5 years (CBAHI/JCI-friendly)

  sensitiveFields: [
    'password',
    'nationalId',
    'email',
    'phone',
    'mobile',
    'salary',
    'iban',
    'bankAccount',
  ],

  highRiskActions: ['DELETE_EMPLOYEE', 'TERMINATE_EMPLOYMENT', 'UPDATE_SALARY'],
}
