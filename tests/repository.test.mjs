import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildPgConfig } from '../functions/repository/pgConfig.js';
import { createSqliteRepo } from '../functions/repository/sqliteRepo.js';

const schemaPath = path.resolve('db/schema.sqlite.sql');

test('SQLite repository creates schema, stores rows, and enforces idempotency on request_id', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'sentinel-db-'));
  const dbPath = path.join(dir, 'test.db');
  const repo = createSqliteRepo({ dbPath, schemaPath });

  try {
    await repo.init();
    await repo.ping();

    await repo.createContactMessage({
      requestId: 'req-contact-1',
      fullName: 'Temuulen Dorj',
      email: 'temuulen@example.mn',
      phone: null,
      topic: 'general',
      message: 'Need camera coverage details.',
      locale: 'mn',
      consentGiven: true,
    });
    await repo.createContactMessage({
      requestId: 'req-contact-1',
      fullName: 'Duplicate Name',
      email: 'dup@example.mn',
      phone: null,
      topic: 'general',
      message: 'Should be ignored.',
      locale: 'mn',
      consentGiven: true,
    });

    await repo.createQuoteRequest({
      requestId: 'req-quote-1',
      fullName: 'Anu Enkhbat',
      company: null,
      email: 'anu@example.mn',
      phone: '9007 0740',
      service: 'access',
      siteType: 'office',
      product: null,
      preferredContact: 'email',
      details: 'Access readers for 4 floors.',
      locale: 'en',
      consentGiven: true,
    });
    await repo.createQuoteRequest({
      requestId: 'req-quote-1',
      fullName: 'Anu Duplicate',
      company: 'Ignore Co',
      email: 'anu@example.mn',
      phone: '9007 0740',
      service: 'access',
      siteType: 'office',
      product: null,
      preferredContact: 'email',
      details: 'Should be ignored.',
      locale: 'en',
      consentGiven: true,
    });

    const { DatabaseSync } = await import('node:sqlite');
    const checkDb = new DatabaseSync(dbPath);
    const contactCount = checkDb.prepare('SELECT COUNT(*) AS count FROM contact_messages').get().count;
    const quoteCount = checkDb.prepare('SELECT COUNT(*) AS count FROM quote_requests').get().count;
    checkDb.close();

    assert.equal(contactCount, 1);
    assert.equal(quoteCount, 1);
  } finally {
    await repo.close();
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('buildPgConfig strictly verifies TLS in production or when PG_CA_CERT is set', () => {
  const prod = buildPgConfig({
    DATABASE_URL: 'postgres://user:pass@db.example.com:5432/sentinel?sslmode=disable',
    NODE_ENV: 'production',
  });
  assert.deepEqual(prod.ssl, { rejectUnauthorized: true });
  assert.equal(new URL(prod.connectionString).searchParams.has('sslmode'), false);

  const withCa = buildPgConfig({
    DATABASE_URL: 'postgres://user:pass@db.example.com:5432/sentinel',
    NODE_ENV: 'development',
    PG_CA_CERT: 'LINE1\\nLINE2',
  });
  assert.deepEqual(withCa.ssl, { ca: 'LINE1\nLINE2', rejectUnauthorized: true });
});
