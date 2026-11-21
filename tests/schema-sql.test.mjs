import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import {
  CONTACT_TOPICS,
  LOCALES,
  PREFERRED_CONTACT,
  PRODUCT_SLUGS,
  SERVICES,
  SITE_TYPES,
} from '../shared/constants.js';

function quoteList(items) {
  return items.map((s) => `'${s}'`).join(',');
}

test('SQL schemas match shared constants and enable RLS in Postgres', async () => {
  const pgSql = await fs.readFile('db/schema.postgres.sql', 'utf8');
  const sqliteSql = await fs.readFile('db/schema.sqlite.sql', 'utf8');

  for (const sql of [pgSql, sqliteSql]) {
    assert.ok(sql.includes(`topic IN (${quoteList(CONTACT_TOPICS)})`), 'topic CHECK mismatch');
    assert.ok(sql.includes(`locale IN (${quoteList(LOCALES)})`), 'locale CHECK mismatch');
    assert.ok(sql.includes(`service IN (${quoteList(SERVICES)})`), 'service CHECK mismatch');
    assert.ok(sql.includes(`site_type IN (${quoteList(SITE_TYPES)})`), 'site_type CHECK mismatch');
    assert.ok(sql.includes(`product IN (${quoteList(PRODUCT_SLUGS)})`), 'product CHECK mismatch');
    assert.ok(
      sql.includes(`preferred_contact IN (${quoteList(PREFERRED_CONTACT)})`),
      'preferred_contact CHECK mismatch',
    );
  }

  assert.match(pgSql, /ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY/i);
  assert.match(pgSql, /ALTER TABLE quote_requests\s+ENABLE ROW LEVEL SECURITY/i);
});
