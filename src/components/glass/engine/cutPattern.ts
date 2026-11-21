export type Pt = readonly [number, number];
export type CellName = 'A' | 'B' | 'C' | 'D' | 'E';
export type Cells = Record<CellName, Pt[]>;

const TOP = [0.22, 0.515, 0.84] as const;   // tAB, tBC, tCE
const BOTTOM = [0.34, 0.865] as const;       // bAD, bDE
const JUNCTIONS: readonly Pt[] = [[0.385, 0.72], [0.48, 0.62], [0.716, 0.49]];

const wave = (index: number, t: number, amplitude: number, axis: number): number =>
  amplitude * Math.sin((t / (10 + ((index * 3.7 + axis * 2.3) % 10))) * Math.PI * 2 + index * 1.7 + axis * 0.9);

const push = (p: Pt, pointer: Pt | null, axisOnly?: 0 | 1): Pt => {
  if (!pointer) return p;
  const dx = p[0] - pointer[0];
  const dy = p[1] - pointer[1];
  const d = Math.hypot(dx, dy);
  if (d >= 0.6 || d === 0) return p;
  const k = (0.05 * (1 - d / 0.6)) / d;
  return [p[0] + (axisOnly === 1 ? 0 : dx * k), p[1] + (axisOnly === 0 ? 0 : dy * k)];
};

/** Cells in panel-normalised coordinates (x right, y down). `portrait` transposes so the hero cell sits on top. */
export function buildCells(time: number, pointer: Pt | null, portrait: boolean): Cells {
  const top = TOP.map((x, i) => push([x + wave(i, time, 0.03, 0), 0], pointer, 0));
  const bottom = BOTTOM.map((x, i) => push([x + wave(i + 3, time, 0.03, 0), 1], pointer, 0));
  const j = JUNCTIONS.map(([x, y], i) =>
    push([x + wave(i + 5, time, 0.03, 0), y + wave(i + 5, time, 0.05, 1)], pointer));
  const [tAB, tBC, tCE] = top;
  const [bAD, bDE] = bottom;
  const [J0, J1, J2] = j;
  const TL: Pt = [0, 0], TR: Pt = [1, 0], BL: Pt = [0, 1], BR: Pt = [1, 1];
  const cells: Cells = {
    A: [TL, tAB, J0, bAD, BL],
    B: [tAB, tBC, J1, J0],
    C: [tBC, tCE, J2, J1],
    D: [J0, J1, J2, bDE, bAD],
    E: [tCE, TR, BR, bDE, J2],
  };
  if (!portrait) return cells;
  const swap = (poly: Pt[]): Pt[] => poly.map(([x, y]): Pt => [y, x]);
  return { A: swap(cells.A), B: swap(cells.B), C: swap(cells.C), D: swap(cells.D), E: swap(cells.E) };
}
