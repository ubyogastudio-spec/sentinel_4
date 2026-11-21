import { readFileSync } from 'node:fs';
import pg from 'pg';
import { errorCode } from '../lib/errorCode.js';
import { buildPgConfig } from './pgConfig.js';

export function createPgRepo({ env, schemaPath }) {
  const pool = new pg.Pool(buildPgConfig(env));
  // A dropped idle connection emits `error` on the pool; without a listener it would crash the process.
  pool.on('error', (error) => console.error(`[pg] ${errorCode(error)}`));

  return {
    async init() {
      await pool.query(readFileSync(schemaPath, 'utf8'));
    },
    async createContactMessage(m) {
      await pool.query(
        `INSERT INTO contact_messages
           (request_id, full_name, email, phone, topic, message, locale, consent_given)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (request_id) DO NOTHING`,
        [m.requestId, m.fullName, m.email, m.phone, m.topic, m.message, m.locale, m.consentGiven],
      );
    },
    async createQuoteRequest(q) {
      await pool.query(
        `INSERT INTO quote_requests
           (request_id, full_name, company, email, phone, service, site_type, product,
            preferred_contact, details, locale, consent_given)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (request_id) DO NOTHING`,
        [q.requestId, q.fullName, q.company, q.email, q.phone, q.service, q.siteType, q.product, q.preferredContact, q.details, q.locale, q.consentGiven],
      );
    },
    async ping() {
      await pool.query('SELECT 1');
    },
    async counts() {
      const { rows } = await pool.query(
        `SELECT (SELECT count(*) FROM contact_messages)::int AS contact_messages,
                (SELECT count(*) FROM quote_requests)::int AS quote_requests`,
      );
      return rows[0];
    },
    async close() {
      await pool.end();
    },
  };
}
