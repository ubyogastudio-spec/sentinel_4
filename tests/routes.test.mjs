import assert from 'node:assert/strict';
import test from 'node:test';
import { isKnownRoute } from '../shared/routes.js';

test('isKnownRoute recognizes all static, product, and legal routes', () => {
  for (const route of ['/', '/services', '/products', '/projects', '/about', '/team', '/contact', '/quote']) {
    assert.equal(isKnownRoute(route), true, `expected ${route} to be known`);
    if (route !== '/') {
      assert.equal(isKnownRoute(`${route}/`), true, `expected ${route}/ to be known`);
    }
  }

  for (const slug of ['camera', 'reader', 'hub']) {
    assert.equal(isKnownRoute(`/products/${slug}`), true);
  }

  for (const slug of ['privacy', 'terms', 'cookies']) {
    assert.equal(isKnownRoute(`/legal/${slug}`), true);
  }

  assert.equal(isKnownRoute('/SERVICES'), true);
});

test('isKnownRoute rejects unknown slugs, deep paths, and unknown sections', () => {
  assert.equal(isKnownRoute('/products/unknown'), false);
  assert.equal(isKnownRoute('/legal/unknown'), false);
  assert.equal(isKnownRoute('/products/camera/extra'), false);
  assert.equal(isKnownRoute('/blog'), false);
  assert.equal(isKnownRoute('/nonexistent'), false);
});
