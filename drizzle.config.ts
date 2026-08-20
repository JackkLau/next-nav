import { loadEnvConfig } from '@next/env'
import { defineConfig } from 'drizzle-kit'

loadEnvConfig(process.cwd())

const migrationUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  strict: true,
  verbose: true,
  ...(migrationUrl ? { dbCredentials: { url: migrationUrl } } : {}),
})
