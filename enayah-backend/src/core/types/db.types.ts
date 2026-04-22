import { PgTransaction } from 'drizzle-orm/pg-core'
import { DB, Schema } from '../../db/client'
//import { DB, Schema } from '../../db'
//import { DB, Schema } from './client'

export type Executor<T extends DB | PgTransaction<any, Schema, any>> = T

// ✅ Transaction type with schema awareness
export type Tx = PgTransaction<any, Schema, any>

// ✅ Unified executor (db OR transaction)
export type DbOrTx = DB | Tx
