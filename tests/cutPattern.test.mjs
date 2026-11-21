import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCells } from '../src/components/glass/engine/cutPattern.ts';

test('buildCells produces 5 topologically valid panels A–E with expected vertex counts', () => {
  const cells = buildCells(0, null, false);
  assert.deepEqual(Object.keys(cells), ['A', 'B', 'C', 'D', 'E']);
  assert.equal(cells.A.length, 5);
  assert.equal(cells.B.length, 4);
  assert.equal(cells.C.length, 4);
  assert.equal(cells.D.length, 5);
  assert.equal(cells.E.length, 5);

  for (const poly of Object.values(cells)) {
    for (const [x, y] of poly) {
      assert.equal(Number.isFinite(x), true);
      assert.equal(Number.isFinite(y), true);
      assert.ok(x >= -0.05 && x <= 1.05, `x out of range: ${x}`);
      assert.ok(y >= -0.05 && y <= 1.05, `y out of range: ${y}`);
    }
  }
});

test('buildCells is deterministic and transposes coordinates when portrait=true', () => {
  const a = buildCells(4.2, [0.5, 0.5], false);
  const b = buildCells(4.2, [0.5, 0.5], false);
  assert.deepEqual(a, b);

  const landscape = buildCells(2.5, null, false);
  const portrait = buildCells(2.5, null, true);
  for (const key of ['A', 'B', 'C', 'D', 'E']) {
    assert.deepEqual(
      portrait[key],
      landscape[key].map(([x, y]) => [y, x]),
    );
  }
});
