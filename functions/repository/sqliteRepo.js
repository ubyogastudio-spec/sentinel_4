import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

export function createSqliteRepo({ dbPath, schemaPath }) {
  let db = null;
  const handle = () => {
    if (!db) throw new Error('database is not open');
    return db;
  };

  return {
    async init() {
      if (dbPath !== ':memory:') mkdirSync(path.dirname(dbPath), { recursive: true });
      // Loaded only when SQLite is used, so a production server on PostgreSQL never touches it.
      const { DatabaseSync } = await import('node:sqlite');
      db = new DatabaseSync(dbPath);
      db.exec(readFileSync(schemaPath, 'utf8'));
    },
    async createContactMessage(m) {
      handle()
        .prepare(
          `INSERT INTO contact_messages
             (request_id, full_name, email, phone, topic, message, locale, consent_given)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT (request_id) DO NOTHING`,
        )
        .run(m.requestId, m.fullName, m.email, m.phone ?? null, m.topic, m.message, m.locale, m.consentGiven ? 1 : 0);
    },
    async createQuoteRequest(q) {
      handle()
        .prepare(
          `INSERT INTO quote_requests
             (request_id, full_name, company, email, phone, service, site_type, product,
              preferred_contact, details, locale, consent_given)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT (request_id) DO NOTHING`,
        )
        .run(q.requestId, q.fullName, q.company ?? null, q.email, q.phone, q.service, q.siteType, q.product ?? null, q.preferredContact, q.details, q.locale, q.consentGiven ? 1 : 0);
    },
    async ping() {
      handle().prepare('SELECT 1').get();
    },
    async counts() {
      const row = handle()
        .prepare(`SELECT (SELECT count(*) FROM contact_messages) AS contact_messages,
                         (SELECT count(*) FROM quote_requests) AS quote_requests`)
        .get();
      return { contact_messages: Number(row.contact_messages), quote_requests: Number(row.quote_requests) };
    },
    async close() {
      db?.close();
      db = null;
    },
  };
}
