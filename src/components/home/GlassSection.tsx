import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { GlassDebugOverlay } from '@/components/glass/GlassDebugOverlay';
import { StaticGlass } from '@/components/glass/StaticGlass';
import { useGlassMode } from '@/components/glass/useGlassMode';
import { isGlassLowPower } from '@/lib/device';

const LazyGlassStage = lazy(() =>
  import('@/components/glass/GlassStage').then((m) => ({ default: m.GlassStage })),
);

function isDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('glassdebug') === '1';
}

export function GlassSection({ splineReady = true }: { readonly splineReady?: boolean }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { mode, reason, webglProbe } = useGlassMode();
  const [lowPower] = useState(isGlassLowPower);
  const [debugEnabled] = useState(isDebugEnabled);

  // Up to 2 automatic attempts (initial + 1 fresh-canvas rebuild) before demoting to static.
  const [attempt, setAttempt] = useState(1);
  const [engineFailed, setEngineFailed] = useState(false);
  const [engineFailures, setEngineFailures] = useState(0);
  const [contextLostEvents, setContextLostEvents] = useState(0);
  const [firstFrameMs, setFirstFrameMs] = useState<number | null>(null);

  const [nearViewport, setNearViewport] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [docHidden, setDocHidden] = useState(() =>
    typeof document !== 'undefined' ? document.hidden : false,
  );

  useEffect(() => {
    const onVisibility = () => setDocHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const webglMode = mode === 'webgl' && !engineFailed;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !webglMode) return;

    let disposeTimer: number | null = null;

    const nearObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          if (disposeTimer !== null) {
            window.clearTimeout(disposeTimer);
            disposeTimer = null;
          }
          setNearViewport(true);
        } else {
          if (disposeTimer !== null) window.clearTimeout(disposeTimer);
          disposeTimer = window.setTimeout(() => {
            setNearViewport(false);
          }, 3000);
        }
      },
      { rootMargin: '100% 0px' },
    );

    const screenObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setOnScreen(entry.isIntersecting);
      },
      { threshold: 0.02 },
    );

    nearObserver.observe(el);
    screenObserver.observe(el);

    return () => {
      if (disposeTimer !== null) window.clearTimeout(disposeTimer);
      nearObserver.disconnect();
      screenObserver.disconnect();
    };
  }, [webglMode]);

  const handleEngineFail = useCallback(() => {
    setEngineFailures((n) => n + 1);
    setFirstFrameMs(null);
    setAttempt((prev) => {
      if (prev < 2) {
        // First failure: rebuild once with a fresh <canvas>.
        return prev + 1;
      }
      setEngineFailed(true);
      return prev;
    });
  }, []);

  const handleRetry3d = useCallback(() => {
    setEngineFailed(false);
    setFirstFrameMs(null);
    setAttempt(1);
  }, []);

  const handleContextLost = useCallback(() => {
    setContextLostEvents((n) => n + 1);
  }, []);

  const handleFirstFrame = useCallback((ms: number) => {
    setFirstFrameMs((prev) => (prev === null ? ms : prev));
  }, []);

  const canMountStage = webglMode && nearViewport && splineReady;
  const effectiveReason = engineFailed ? 'engine-failed' : reason;

  return (
    <section
      id="glass"
      ref={sectionRef}
      aria-labelledby="glass-title"
      className={
        webglMode
          ? 'relative h-[100svh] min-h-[600px] overflow-hidden bg-glass-bg'
          : 'relative min-h-[100svh] overflow-hidden bg-glass-bg'
      }
    >
      {canMountStage ? (
        <Suspense fallback={<StaticGlass />}>
          <LazyGlassStage
            key={attempt}
            active={canMountStage}
            paused={!onScreen || docHidden}
            onFirstFrame={handleFirstFrame}
            onContextLost={handleContextLost}
            onFail={handleEngineFail}
          />
        </Suspense>
      ) : (
        <StaticGlass onRetry3d={engineFailed ? handleRetry3d : undefined} />
      )}

      {debugEnabled ? (
        <GlassDebugOverlay
          telemetry={{
            effectiveMode: webglMode ? 'webgl' : 'static',
            reason: effectiveReason,
            webglProbe,
            firstFrameMs,
            contextLostEvents,
            engineFailures,
            attempt,
            splineReady,
            lowPower,
          }}
        />
      ) : null}
    </section>
  );
}
