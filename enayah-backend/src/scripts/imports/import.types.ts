import { db } from '../../db'

export type ImportType = 'employee-database' | 'jawazat-database'

export type DBTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

export type ImportSummary = {
  imported: number
  skipped: number
  failed: number
  errors: string[]
}
