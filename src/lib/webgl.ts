let cachedWebglSupport: boolean | null = null;

export function hasWebGL(): boolean {
  if (cachedWebglSupport !== null) return cachedWebglSupport;
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    cachedWebglSupport = Boolean(gl);
    if (gl && 'getExtension' in gl) {
      const ext = gl.getExtension('WEBGL_lose_context');
      ext?.loseContext();
    }
  } catch {
    cachedWebglSupport = false;
  }
  return cachedWebglSupport;
}
