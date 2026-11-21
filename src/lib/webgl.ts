export interface WebGLProbeResult {
  readonly webgl2: boolean;
  readonly webgl: boolean;
  readonly supported: boolean;
}

let cachedProbe: WebGLProbeResult | null = null;

export function probeWebGL(): WebGLProbeResult {
  if (cachedProbe !== null) return cachedProbe;
  if (typeof document === 'undefined') {
    cachedProbe = { webgl2: false, webgl: false, supported: false };
    return cachedProbe;
  }

  let webgl2 = false;
  let webgl = false;

  try {
    const c2 = document.createElement('canvas');
    const gl2 = c2.getContext('webgl2');
    webgl2 = Boolean(gl2);
  } catch {
    webgl2 = false;
  }

  try {
    const c1 = document.createElement('canvas');
    const gl1 = c1.getContext('webgl');
    webgl = Boolean(gl1);
  } catch {
    webgl = false;
  }

  cachedProbe = {
    webgl2,
    webgl,
    supported: webgl2 || webgl,
  };
  return cachedProbe;
}

export function hasWebGL(): boolean {
  return probeWebGL().supported;
}
