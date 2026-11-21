import assert from 'node:assert/strict';
import test from 'node:test';
import { format } from '../src/i18n/format.ts';
import { hasUrl, isEmail } from '../src/lib/url.ts';

test('format substitutes known placeholders and leaves unknown ones intact', () => {
  assert.equal(format('© {year} SENTINEL AI', { year: 2026 }), '© 2026 SENTINEL AI');
  assert.equal(format('Call {phone}', { phone: '9007 0740' }), 'Call 9007 0740');
  assert.equal(format('Missing {unknown} key', { phone: '123' }), 'Missing {unknown} key');
});

test('hasUrl requires valid https URL with dotted hostname', () => {
  assert.equal(hasUrl('https://sentinel.mn/in'), true);
  assert.equal(hasUrl('  https://example.com  '), true);
  assert.equal(hasUrl('http://sentinel.mn'), false);
  assert.equal(hasUrl('javascript:alert(1)'), false);
  assert.equal(hasUrl(''), false);
  assert.equal(hasUrl(undefined), false);
});

test('isEmail validates basic email format', () => {
  assert.equal(isEmail('info@sentinel.mn'), true);
  assert.equal(isEmail(''), false);
  assert.equal(isEmail('invalid'), false);
  assert.equal(isEmail(null), false);
});
