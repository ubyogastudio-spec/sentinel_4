import { useEffect, useState } from 'react';
import type { WebGLProbeResult } from '@/lib/webgl';

export interface GlassDebugTelemetry {
  readonly effectiveMode: 'webgl' | 'static';
  readonly reason: string;
  readonly webglProbe: WebGLProbeResult;
  readonly firstFrameMs: number | null;
  readonly contextLostEvents: number;
  readonly engineFailures: number;
  readonly attempt: number;
  readonly splineReady: boolean;
  readonly lowPower: boolean;
}

interface NavigatorDebug extends Navigator {
  readonly deviceMemory?: number;
  readonly connection?: { readonly saveData?: boolean };
}

export function GlassDebugOverlay({ telemetry }: { readonly telemetry: GlassDebugTelemetry }) {
  const [envInfo, setEnvInfo] = useState(() => readEnv());

  useEffect(() => {
    const update = () => setEnvInfo(readEnv());
    window.addEventListener('resize', update);
    const mqHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    mqHover.addEventListener('change', update);
    mqMotion.addEventListener('change', update);
    return () => {
      window.removeEventListener('resize', update);
      mqHover.removeEventListener('change', update);
      mqMotion.removeEventListener('change', update);
    };
  }, []);

  return (
    <aside
      aria-label="Glass diagnostic overlay"
      className="fixed bottom-3 left-3 z-[100] pointer-events-none rounded-md border border-white/25 bg-black/90 px-3 py-2.5 font-mono text-[12px] leading-snug text-white shadow-lg"
    >
      <div>
        mode: <strong>{telemetry.effectiveMode}</strong> ({telemetry.reason}) | attempt:{' '}
        {telemetry.attempt} | lowPower: {String(telemetry.lowPower)}
      </div>
      <div>
        viewport: {envInfo.width} × {envInfo.height} | splineReady:{' '}
        {String(telemetry.splineReady)}
      </div>
      <div>
        (hover: hover) and (pointer: fine): {String(envInfo.hoverFine)}
      </div>
      <div>
        prefers-reduced-motion: {envInfo.reducedMotion}
      </div>
      <div>
        deviceMemory: {String(envInfo.deviceMemory)} | hardwareConcurrency:{' '}
        {String(envInfo.hardwareConcurrency)} | saveData: {String(envInfo.saveData)}
      </div>
      <div>
        webgl2: {String(telemetry.webglProbe.webgl2)} | webgl:{' '}
        {String(telemetry.webglProbe.webgl)}
      </div>
      <div>
        firstFrameMs:{' '}
        {telemetry.firstFrameMs !== null ? `${telemetry.firstFrameMs} ms` : 'pending'} |
        contextLost: {telemetry.contextLostEvents} | failures: {telemetry.engineFailures}
      </div>
    </aside>
  );
}

function readEnv() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      width: 0,
      height: 0,
      hoverFine: false,
      reducedMotion: 'no-preference',
      deviceMemory: 'n/a' as number | string,
      hardwareConcurrency: 'n/a' as number | string,
      saveData: 'n/a' as boolean | string,
    };
  }
  const nav = navigator as NavigatorDebug;
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    hoverFine: window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'reduce'
      : 'no-preference',
    deviceMemory: nav.deviceMemory ?? 'n/a',
    hardwareConcurrency: nav.hardwareConcurrency ?? 'n/a',
    saveData: nav.connection?.saveData ?? 'n/a',
  };
}
