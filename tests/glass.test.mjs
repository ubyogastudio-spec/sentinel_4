import assert from 'node:assert/strict';
import test from 'node:test';
import { measureGlassLayout } from '../src/components/glass/engine/pageCanvas.ts';
import { computePanelMatrix3d, expSmooth, stepSpring } from '../src/components/glass/engine/springs.ts';

const fakeCtx = {
  font: '',
  measureText(str) {
    return { width: str.length * 8 };
  },
};

const sampleCopy = {
  eyebrow: 'Security by design',
  line1: 'Security',
  line2: 'in glass.',
  sub: 'See every door, camera and login in one live view.',
  open: 'See the system',
  read: 'Read the principles →',
  copyLeft: '© 2026 SENTINEL AI',
  copyRight: 'Zero-trust architecture',
  navBrand: 'SENTINEL AI',
  navServices: 'Services',
  navProducts: 'Products',
  navProjects: 'Projects',
  navCta: 'Get a quote',
};

test('measureGlassLayout applies exact desktop margins, blockOffsetY, and scale S', () => {
  const layout = measureGlassLayout(fakeCtx, 1440, 960, sampleCopy, 'en');
  assert.equal(layout.sideMargin, 1440 * 0.055);
  assert.equal(layout.topMargin, Math.max(960 * 0.085, 88));
  assert.equal(layout.bottomMargin, 960 * 0.085);
  assert.equal(layout.blockW, 1440 - 1440 * 0.11);
  assert.ok(Math.abs(layout.scale - layout.blockW / 1730) < 1e-9);
  assert.equal(layout.navGap, 14);
  assert.equal(layout.showNavItems, true);
});

test('measureGlassLayout applies 16px block margins and compact nav on phones (<640px)', () => {
  const layout = measureGlassLayout(fakeCtx, 390, 844, sampleCopy, 'mn');
  assert.equal(layout.sideMargin, 16);
  assert.equal(layout.topMargin, 16);
  assert.equal(layout.bottomMargin, 16);
  assert.equal(layout.blockOffsetY, 0);
  assert.equal(layout.blockW, 358);
  assert.equal(layout.showNavItems, false);
});

test('stepSpring, expSmooth, and computePanelMatrix3d produce valid finite transforms', () => {
  const spring = { value: 0, velocity: 0 };
  for (let i = 0; i < 60; i += 1) {
    stepSpring(spring, 50, 1 / 60, 170, 19);
  }
  assert.ok(spring.value > 45 && spring.value < 55);

  const smoothed = expSmooth(0, 10, 0.05, 0.3);
  assert.ok(Math.abs(smoothed - 10 * (1 - Math.exp(-0.05 / 0.3))) < 1e-6);

  const m = computePanelMatrix3d(100, 100, [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ]);
  assert.match(m, /^matrix3d\(/);
});
