import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/i18n/LocaleProvider';
import { isWeakDevice } from '@/lib/device';

const SPLINE_SCENE = 'https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode';
const Spline = lazy(() => import('@splinetool/react-spline'));

interface SplineAppLike {
  play?: () => void;
  stop?: () => void;
}

class SplineErrorBoundary extends Component<
  { readonly children: ReactNode; readonly onError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(): void {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export function SplineHero() {
  const { t } = useLocale();
  const sectionRef = useRef<HTMLElement | null>(null);
  const splineAppRef = useRef<SplineAppLike | null>(null);

  const [gated, setGated] = useState<boolean>(() => isWeakDevice());
  const [loaded, setLoaded] = useState(false);
  const [stalled, setStalled] = useState(false);
  const [errored, setErrored] = useState(false);
  const [mountKey, setMountKey] = useState(0);

  const shouldMountSpline = !gated && !stalled && !errored;

  useEffect(() => {
    if (!shouldMountSpline || loaded) return;
    const timer = window.setTimeout(() => {
      setStalled(true);
    }, 25000);
    return () => window.clearTimeout(timer);
  }, [shouldMountSpline, loaded, mountKey]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let visible = true;
    const syncPlayback = () => {
      const app = splineAppRef.current;
      if (!app) return;
      try {
        if (visible && !document.hidden) app.play?.();
        else app.stop?.();
      } catch {
        // Not every Spline runtime build exposes play/stop.
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        visible = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.05 },
    );
    observer.observe(el);

    const onVisibility = () => syncPlayback();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const handleLoad = (app: unknown) => {
    splineAppRef.current = (app && typeof app === 'object' ? app : null) as SplineAppLike | null;
    setLoaded(true);
    setStalled(false);
  };

  const handleRetry = () => {
    setErrored(false);
    setStalled(false);
    setLoaded(false);
    setMountKey((k) => k + 1);
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] flex items-end bg-hero-bg overflow-hidden"
    >
      {/* Static backdrop (always underneath, visible when gated, loading, or failed) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-hero-bg bg-[radial-gradient(60%_60%_at_70%_40%,hsl(119_99%_46%/0.10),transparent)]"
      />

      {shouldMountSpline ? (
        <div className="absolute inset-0">
          <SplineErrorBoundary onError={() => setErrored(true)}>
            <Suspense fallback={<div className="absolute inset-0 bg-hero-bg" />}>
              <Spline
                key={mountKey}
                scene={SPLINE_SCENE}
                className="w-full h-full"
                onLoad={handleLoad}
              />
            </Suspense>
          </SplineErrorBoundary>
        </div>
      ) : null}

      {/* Contrast scrims */}
      <div aria-hidden="true" className="absolute inset-0 bg-black/30 z-[1] pointer-events-none" />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_bottom_left,rgba(10,10,10,.78),rgba(10,10,10,.35)_45%,transparent_72%)]"
      />

      {/* Explicit load / retry triggers for gated or stalled 3D */}
      {gated ? (
        <Button
          type="button"
          variant="heroOutline"
          size="sm"
          onClick={() => setGated(false)}
          className="pointer-events-auto absolute bottom-10 right-6 md:right-10 z-20 text-sm"
        >
          {t.hero.load3d}
        </Button>
      ) : stalled || errored ? (
        <Button
          type="button"
          variant="heroOutline"
          size="sm"
          onClick={handleRetry}
          className="pointer-events-auto absolute bottom-10 right-6 md:right-10 z-20 text-sm"
        >
          {t.hero.retry3d}
        </Button>
      ) : null}

      {/* Bottom-left hero copy (Appendix A + Master overrides) */}
      <div className="relative z-10 pointer-events-none w-full max-w-[90%] sm:max-w-md lg:max-w-2xl px-6 md:px-10 pb-10 md:pb-10 pt-32">
        <h1
          className="text-[clamp(3rem,8vw,6rem)] font-bold leading-[1.05] tracking-[-0.05em] text-foreground mb-2 md:mb-4 uppercase opacity-0 animate-fade-up"
          style={{ animationDelay: '0.2s' }}
        >
          SENTINEL<span className="text-primary"> AI</span>
        </h1>

        <p
          className="text-foreground/80 text-[clamp(1.125rem,2.5vw,1.875rem)] font-light mb-3 md:mb-6 opacity-0 animate-fade-up"
          style={{ animationDelay: '0.4s' }}
        >
          {t.hero.sub}
        </p>

        <p
          className="text-muted-foreground text-[clamp(0.875rem,1.5vw,1.25rem)] font-light mb-4 md:mb-8 opacity-0 animate-fade-up"
          style={{ animationDelay: '0.55s' }}
        >
          {t.hero.desc}
        </p>

        <div
          className="flex flex-wrap gap-3 font-bold opacity-0 animate-fade-up"
          style={{ animationDelay: '0.7s' }}
        >
          <Link
            to="/contact?topic=call"
            className="pointer-events-auto inline-flex min-h-11 items-center justify-center bg-primary text-primary-foreground px-6 py-3 md:px-8 md:py-4 text-sm rounded-sm cursor-pointer hover:brightness-110 transition-all active:scale-[0.97] whitespace-nowrap"
          >
            {t.hero.book}
          </Link>
          <Link
            to="/projects"
            className="pointer-events-auto inline-flex min-h-11 items-center justify-center bg-white text-background px-6 py-3 md:px-8 md:py-4 text-sm rounded-sm cursor-pointer hover:brightness-90 transition-all active:scale-[0.97] whitespace-nowrap"
          >
            {t.hero.work}
          </Link>
        </div>

        <p
          className="text-muted-foreground text-xs font-light mt-4 md:mt-6 opacity-0 animate-fade-up"
          style={{ animationDelay: '0.85s' }}
        >
          {t.hero.trust}
        </p>
      </div>
    </section>
  );
}
