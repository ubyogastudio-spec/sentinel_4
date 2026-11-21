export interface SpringState {
  value: number;
  velocity: number;
}

export function stepSpring(
  state: SpringState,
  target: number,
  dt: number,
  stiffness = 170,
  damping = 19,
): number {
  const clampedDt = Math.min(dt, 0.05);
  const force = (target - state.value) * stiffness;
  const accel = force - state.velocity * damping;
  state.velocity += accel * clampedDt;
  state.value += state.velocity * clampedDt;
  return state.value;
}

export function expSmooth(current: number, target: number, dt: number, tau = 0.3): number {
  const alpha = 1 - Math.exp(-Math.min(dt, 0.1) / tau);
  return current + (target - current) * alpha;
}

export function easeInCubic(t: number): number {
  return t * t * t;
}

export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export interface Point2D {
  readonly x: number;
  readonly y: number;
}

/**
 * Computes a CSS `matrix3d(...)` string mapping rectangle `(0,0) (w,0) (w,h) (0,h)`
 * onto the 4 projected screen corners `dst[0..3]`.
 */
export function computePanelMatrix3d(w: number, h: number, dst: readonly [Point2D, Point2D, Point2D, Point2D]): string {
  const src: readonly Point2D[] = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: 0, y: h },
  ];

  const a: number[][] = [];
  const b: number[] = [];

  for (let i = 0; i < 4; i += 1) {
    const sx = src[i].x;
    const sy = src[i].y;
    const dx = dst[i].x;
    const dy = dst[i].y;
    a.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
    b.push(dx);
    a.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
    b.push(dy);
  }

  // Gaussian elimination with partial pivoting
  const n = 8;
  for (let col = 0; col < n; col += 1) {
    let maxRow = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(a[row][col]) > Math.abs(a[maxRow][col])) maxRow = row;
    }
    if (maxRow !== col) {
      const tmpA = a[col];
      a[col] = a[maxRow];
      a[maxRow] = tmpA;
      const tmpB = b[col];
      b[col] = b[maxRow];
      b[maxRow] = tmpB;
    }
    const pivot = a[col][col];
    if (Math.abs(pivot) < 1e-10) {
      return 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)';
    }
    for (let j = col; j < n; j += 1) a[col][j] /= pivot;
    b[col] /= pivot;

    for (let row = 0; row < n; row += 1) {
      if (row === col) continue;
      const factor = a[row][col];
      if (factor === 0) continue;
      for (let j = col; j < n; j += 1) a[row][j] -= factor * a[col][j];
      b[row] -= factor * b[col];
    }
  }

  const [h0, h1, h2, h3, h4, h5, h6, h7] = b;
  const values = [h0, h3, 0, h6, h1, h4, 0, h7, 0, 0, 1, 0, h2, h5, 0, 1];
  return `matrix3d(${values.map((v) => Number(v.toFixed(6))).join(',')})`;
}
