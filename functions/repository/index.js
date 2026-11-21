import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPgRepo } from './pgRepo.js';
import { createSqliteRepo } from './sqliteRepo.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** PostgreSQL when DATABASE_URL is set (production), otherwise a local SQLite file. */
export function createRepository(env = process.env) {
  if (env.DATABASE_URL) return createPgRepo({ env, schemaPath: path.join(root, 'db/schema.postgres.sql') });
  return createSqliteRepo({
    dbPath: env.DB_PATH || path.join(root, 'data/sentinel.db'),
    schemaPath: path.join(root, 'db/schema.sqlite.sql'),
  });
}
