// enayah-backend/src/modules/hr/credentials/repository/credential-document.repository.ts

// usage: reusable repository factory
import { and, eq, getTableColumns, isNull, type SQL } from 'drizzle-orm'
import type { AnyPgColumn, AnyPgTable } from 'drizzle-orm/pg-core'
import type { InferSelectModel } from 'drizzle-orm'

import { type DB, files } from '../../../../db'

export type CredentialFileCategory = (typeof files.category.enumValues)[number]

export type CredentialDocumentMetadata = {
  id: string
  originalName: string
  mimeType: string
  fileSize: number
}

export type ActiveCredentialDocument = {
  id: string
  credentialId: string
  employeeId: string
  originalName: string
  storedName: string
  mimeType: string
  fileSize: number
  storageKey: string
}

export type CredentialForDocumentUpdate = {
  id: string
  employeeId: string
  documentFileId: string | null
  documentStorageKey: string | null
  documentCategory: CredentialFileCategory | null
}

export type CredentialWithDocument<TTable extends AnyPgTable> =
  TTable['$inferSelect'] & {
    document: CredentialDocumentMetadata | null
  }

type CredentialDocumentRepositoryConfig<TTable extends AnyPgTable> = {
  table: TTable
  columns: {
    id: AnyPgColumn
    employeeId: AnyPgColumn
    documentFileId: AnyPgColumn
    isDeleted: AnyPgColumn
    deletedAt: AnyPgColumn
  }

  category: CredentialFileCategory
  /*
   * Each credential domain can define its own sorting.
   */
  orderBy?: SQL[]
}

type CredentialDocumentJoinRow<TTable extends AnyPgTable> = {
  credential: TTable['$inferSelect']
  document: CredentialDocumentMetadata | null
}

function buildActiveCredentialConditions({
  config,
  employeeId,
  credentialId,
}: {
  config: CredentialDocumentRepositoryConfig<AnyPgTable>
  employeeId: string
  credentialId?: string
}): SQL[] {
  const conditions: SQL[] = [
    eq(config.columns.employeeId, employeeId),
    eq(config.columns.isDeleted, false),
    isNull(config.columns.deletedAt),
  ]

  if (credentialId) {
    conditions.push(eq(config.columns.id, credentialId))
  }

  return conditions
}

export function createCredentialDocumentRepository<TTable extends AnyPgTable>(
  config: CredentialDocumentRepositoryConfig<TTable>,
) {
  const tableColumns = getTableColumns(config.table)
  const sourceTable: AnyPgTable = config.table

  return {
    /**
     * Returns credential rows with public-safe attachment
     * metadata for list/detail responses.
     *
     * It does not expose storageKey, storedName, checksum,
     * or physical paths.
     */
    findManyWithDocument: async (
      tx: DB,
      employeeId: string,
    ): Promise<CredentialWithDocument<TTable>[]> => {
      const rawRows = await tx
        .select({
          credential: tableColumns,

          document: {
            id: files.id,
            originalName: files.originalName,
            mimeType: files.mimeType,
            fileSize: files.fileSize,
          },
        })
        .from(sourceTable)
        .leftJoin(
          files,
          and(
            eq(files.id, config.columns.documentFileId),
            eq(files.isDeleted, false),
            isNull(files.deletedAt),
            eq(files.category, config.category),
            eq(files.visibility, 'private'),
          ),
        )
        .where(
          and(
            ...buildActiveCredentialConditions({
              config,
              employeeId,
            }),
          ),
        )
        .orderBy(...(config.orderBy ?? []))

      /*
       * Drizzle cannot preserve the concrete table model through
       * the generic AnyPgTable query boundary.
       *
       * The query shape above guarantees this structure:
       * {
       *   credential: TTable['$inferSelect']
       *   document: CredentialDocumentMetadata | null
       * }
       */
      const rows = rawRows as unknown as CredentialDocumentJoinRow<TTable>[]

      return rows.map(({ credential, document }) => ({
        ...credential,
        document,
      }))
    },

    /**
     * Resolves the active private attachment for
     * preview/download.
     */
    findActiveDocument: async (
      tx: DB,
      employeeId: string,
      credentialId: string,
    ): Promise<ActiveCredentialDocument | null> => {
      const [document] = await tx
        .select({
          id: files.id,
          credentialId: config.columns.id,
          employeeId: config.columns.employeeId,
          originalName: files.originalName,
          storedName: files.storedName,
          mimeType: files.mimeType,
          fileSize: files.fileSize,
          storageKey: files.storageKey,
        })
        .from(sourceTable)
        .innerJoin(files, eq(files.id, config.columns.documentFileId))
        .where(
          and(
            ...buildActiveCredentialConditions({
              config,
              employeeId,
              credentialId,
            }),
            eq(files.isDeleted, false),
            isNull(files.deletedAt),
            eq(files.category, config.category),
            eq(files.visibility, 'private'),
          ),
        )
        .limit(1)

      return (document as ActiveCredentialDocument | undefined) ?? null
    },

    /**
     * Locks the credential row before replacing or
     * removing its attachment.
     */
    findForDocumentUpdate: async (
      tx: DB,
      employeeId: string,
      credentialId: string,
    ): Promise<CredentialForDocumentUpdate | null> => {
      /*
       * Serialize simultaneous updates against the same
       * credential record.
       */
      await tx
        .select({
          id: config.columns.id,
        })
        .from(sourceTable)
        .where(
          and(
            ...buildActiveCredentialConditions({
              config,
              employeeId,
              credentialId,
            }),
          ),
        )
        .for('update')

      const [credential] = await tx
        .select({
          id: config.columns.id,
          employeeId: config.columns.employeeId,
          documentFileId: config.columns.documentFileId,
          documentStorageKey: files.storageKey,
          documentCategory: files.category,
        })
        .from(sourceTable)
        .leftJoin(files, eq(config.columns.documentFileId, files.id))
        .where(
          and(
            ...buildActiveCredentialConditions({
              config,
              employeeId,
              credentialId,
            }),
          ),
        )
        .limit(1)

      return (credential as CredentialForDocumentUpdate | undefined) ?? null
    },
  }
}
