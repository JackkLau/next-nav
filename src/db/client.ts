import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

function createDatabase(databaseUrl: string) {
  const client = postgres(databaseUrl, {
    connect_timeout: 10,
    idle_timeout: 20,
    max: 1,
    prepare: false,
  })

  return drizzle({ client, schema })
}

export type AppDatabase = ReturnType<typeof createDatabase>

const databaseCache = globalThis as typeof globalThis & {
  nextNavDatabase?: AppDatabase
}

/** Reuse one small Postgres.js pool per server instance. */
export function getDatabase(): AppDatabase {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured')
  }

  databaseCache.nextNavDatabase ??= createDatabase(databaseUrl)
  return databaseCache.nextNavDatabase
}
