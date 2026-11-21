import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { StaticGlass } from '@/components/glass/StaticGlass';
import { isWeakDevice, prefersReducedMotion } from '@/lib/device';
import { hasWebGL } from '@/lib/webgl';

const LazyGlassStage = lazy(() =>
  import('@/components/glass/GlassStage').then((m) => ({ default: m.GlassStage })),
);

function canUseWebglGlass(): boolean {
  if (typeof window === 'undefined') return false;
  const wide = window.matchMedia('(min-width: 900px)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!wide || !finePointer) return false;
  if (prefersReducedMotion() || isWeakDevice()) return false;
  return hasWebGL();
}

export function GlassSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [eligible, setEligible] = useState<boolean>(canUseWebglGlass);
  const [failed, setFailed] = useState(false);
  const [nearViewport, setNearViewport] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [docHidden, setDocHidden] = useState(() =>
    typeof document !== 'undefined' ? document.hidden : false,
  );

  useEffect(() => {
    const mqWide = window.matchMedia('(min-width: 900px)');
    const mqPointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setEligible(canUseWebglGlass());

    mqWide.addEventListener('change', update);
    mqPointer.addEventListener('change', update);
    mqMotion.addEventListener('change', update);
    return () => {
      mqWide.removeEventListener('change', update);
      mqPointer.removeEventListener('change', update);
      mqMotion.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    const onVisibility = () => setDocHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !eligible || failed) return;

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
  }, [eligible, failed]);

  const handleFail = useCallback(() => {
    setFailed(true);
  }, []);

  const webglMode = eligible && !failed;

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
      {webglMode && nearViewport ? (
        <Suspense fallback={<StaticGlass />}>
          <LazyGlassStage active={nearViewport} paused={!onScreen || docHidden} onFail={handleFail} />
        </Suspense>
      ) : (
        <StaticGlass />
      )}
    </section>
  );
}
