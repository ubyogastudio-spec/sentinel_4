import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '@/lib/device';
import { probeWebGL, type WebGLProbeResult } from '@/lib/webgl';

export type GlassMode = 'webgl' | 'static';
export type GlassModeReason = 'ok' | 'reduced-motion' | 'no-webgl';

export interface GlassModeState {
  readonly mode: GlassMode;
  readonly reason: GlassModeReason;
  readonly webglProbe: WebGLProbeResult;
}

function evaluateGlassMode(): GlassModeState {
  const webglProbe = probeWebGL();
  if (prefersReducedMotion()) {
    return { mode: 'static', reason: 'reduced-motion', webglProbe };
  }
  if (!webglProbe.supported) {
    return { mode: 'static', reason: 'no-webgl', webglProbe };
  }
  return { mode: 'webgl', reason: 'ok', webglProbe };
}

/**
 * Step 2 mode rule:
 * WebGL mode whenever (a) WebGL2 or WebGL can be created (cached) and
 * (b) prefers-reduced-motion is not 'reduce'. Nothing else disables WebGL.
 */
export function useGlassMode(): GlassModeState {
  const [state, setState] = useState<GlassModeState>(evaluateGlassMode);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setState(evaluateGlassMode());
    mqMotion.addEventListener('change', update);
    return () => mqMotion.removeEventListener('change', update);
  }, []);

  return state;
}
