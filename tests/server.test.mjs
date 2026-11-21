import assert from 'node:assert/strict';
import test from 'node:test';
import { makeMemoryRepo, withTestServer } from './helpers.mjs';

const validContact = {
  requestId: '11111111-1111-4111-8111-111111111111',
  fullName: 'Bat-Erdene Ganbold',
  email: 'bat@example.mn',
  phone: '9007 0740',
  topic: 'call',
  message: 'Please call about cameras for our warehouse.',
  consent: true,
  locale: 'mn',
  website: '',
};

const validQuote = {
  requestId: '22222222-2222-4222-8222-222222222222',
  fullName: 'Solongo Tserendorj',
  company: 'Altan Retail',
  email: 'solongo@example.mn',
  phone: '+976 9007 0740',
  service: 'surveillance',
  siteType: 'warehouse',
  product: 'camera',
  preferredContact: 'phone',
  details: 'Need 12 cameras and NVR isolation across two loading bays.',
  consent: true,
  locale: 'en',
  website: '',
};

test('GET /api/health returns 200 when DB is ready and 503 when unavailable', async () => {
  await withTestServer({ isDbReady: () => true }, async ({ baseUrl }) => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
  });

  await withTestServer({ isDbReady: () => false }, async ({ baseUrl }) => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 503);
    assert.deepEqual(await res.json(), { ok: false, code: 'unavailable' });
  });
});

test('POST /api/contact stores valid submission, enforces idempotency, and validates fields', async () => {
  const repo = makeMemoryRepo();
  await withTestServer({ repo }, async ({ baseUrl }) => {
    const res1 = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validContact),
    });
    assert.equal(res1.status, 201);
    assert.deepEqual(await res1.json(), { ok: true });
    assert.equal(repo.contacts.length, 1);

    // Repeat with same requestId
    const res2 = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validContact),
    });
    assert.equal(res2.status, 201);
    assert.equal(repo.contacts.length, 1);

    // Invalid email + missing consent
    const bad = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validContact, email: 'not-an-email', consent: false }),
    });
    assert.equal(bad.status, 400);
    const badJson = await bad.json();
    assert.equal(badJson.ok, false);
    assert.equal(badJson.code, 'invalid');
    assert.equal(badJson.fields.email, 'email');
    assert.equal(badJson.fields.consent, 'consent');
  });
});

test('POST /api/quote validates enum fields and stores valid request', async () => {
  const repo = makeMemoryRepo();
  await withTestServer({ repo }, async ({ baseUrl }) => {
    const res = await fetch(`${baseUrl}/api/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validQuote),
    });
    assert.equal(res.status, 201);
    assert.equal(repo.quotes.length, 1);
    assert.equal(repo.quotes[0].product, 'camera');

    const bad = await fetch(`${baseUrl}/api/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validQuote, service: 'unknown', siteType: 'mars' }),
    });
    assert.equal(bad.status, 400);
    const body = await bad.json();
    assert.equal(body.fields.service, 'invalid');
    assert.equal(body.fields.siteType, 'invalid');
  });
});

test('Honeypot field returns 200 silently without saving or calling DB', async () => {
  const repo = makeMemoryRepo();
  await withTestServer({ repo }, async ({ baseUrl }) => {
    const res = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validContact, website: 'https://spam.example' }),
    });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
    assert.equal(repo.contacts.length, 0);
  });
});

test('Form endpoints return 503 unavailable when DB is disconnected or throws', async () => {
  await withTestServer({ isDbReady: () => false }, async ({ baseUrl }) => {
    const res = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validContact),
    });
    assert.equal(res.status, 503);
    assert.deepEqual(await res.json(), { ok: false, code: 'unavailable' });
  });

  await withTestServer({ repo: makeMemoryRepo({ failOnWrite: true }) }, async ({ baseUrl }) => {
    const res = await fetch(`${baseUrl}/api/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validQuote),
    });
    assert.equal(res.status, 503);
    assert.deepEqual(await res.json(), { ok: false, code: 'unavailable' });
  });
});

test('API handles malformed JSON, oversized payloads, unknown endpoints, and rate limiting', async () => {
  await withTestServer({}, async ({ baseUrl }) => {
    const badJson = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{not json',
    });
    assert.equal(badJson.status, 400);
    assert.deepEqual(await badJson.json(), { ok: false, code: 'invalid_json' });

    const bigPayload = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validContact, message: 'x'.repeat(20000) }),
    });
    assert.equal(bigPayload.status, 413);
    assert.deepEqual(await bigPayload.json(), { ok: false, code: 'payload_too_large' });

    const missing = await fetch(`${baseUrl}/api/does-not-exist`);
    assert.equal(missing.status, 404);
    assert.deepEqual(await missing.json(), { ok: false, code: 'not_found' });

    // Trigger 10-request window limit
    for (let i = 0; i < 10; i += 1) {
      await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validContact, website: 'bot-skip' }),
      });
    }
    const limited = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validContact),
    });
    assert.equal(limited.status, 429);
    assert.deepEqual(await limited.json(), { ok: false, code: 'rate_limited' });
  });
});

test('Production routing returns 200 for known routes and 404 HTML for unknown paths', async () => {
  await withTestServer({ isProduction: true }, async ({ baseUrl }) => {
    const ok = await fetch(`${baseUrl}/products/camera`);
    assert.equal(ok.status, 200);
    assert.match(await ok.text(), /SENTINEL/);

    const missing = await fetch(`${baseUrl}/products/nonexistent`);
    assert.equal(missing.status, 404);
    assert.match(await missing.text(), /SENTINEL/);
  });
});
