/*import crypto from 'crypto'

export function generateAuditHash(data: any): string {
  const payload = JSON.stringify(data)
  return crypto.createHash('sha256').update(payload).digest('hex')
}*/

import crypto from 'crypto'

// Deterministic JSON: sort keys recursively so semantically equal objects
// (incl. JSONB round-trips) produce the same digest.
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value))
    return '[' + value.map(stableStringify).join(',') + ']'
  const keys = Object.keys(value as Record<string, unknown>).sort()
  return (
    '{' +
    keys
      .map(
        (k) =>
          JSON.stringify(k) +
          ':' +
          stableStringify((value as Record<string, unknown>)[k]),
      )
      .join(',') +
    '}'
  )
}

export function generateAuditHash(data: Record<string, unknown>): string {
  return crypto.createHash('sha256').update(stableStringify(data)).digest('hex')
}
