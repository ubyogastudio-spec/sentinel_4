import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { ProductEntry } from '@/content/products';
import { format } from '@/i18n/format';
import { useLocale } from '@/i18n/LocaleProvider';
import { isWeakDevice } from '@/lib/device';
import { hasWebGL } from '@/lib/webgl';
import { ProductIllustration } from './ProductIllustration';
import type { ProductViewerController } from './engine/createProductViewer';

type ViewerState = 'idle' | 'loading' | 'ready' | 'gated' | 'unavailable';

interface ProductViewerProps {
  readonly product: ProductEntry;
}

export function ProductViewer({ product }: ProductViewerProps) {
  const { t } = useLocale();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<ProductViewerController | null>(null);

  const [state, setState] = useState<ViewerState>(() => {
    if (!hasWebGL()) return 'unavailable';
    if (isWeakDevice()) return 'gated';
    return 'idle';
  });
  const [progress, setProgress] = useState<number | null>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [docHidden, setDocHidden] = useState(() =>
    typeof document !== 'undefined' ? document.hidden : false,
  );
  const [forceLoad, setForceLoad] = useState(false);

  const ariaLabel = format(t.productsUi.modelLabel, { name: product.name });
  const initialProductRef = useRef(product);
  const ariaLabelRef = useRef(ariaLabel);
  ariaLabelRef.current = ariaLabel;

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const nearObs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setNearViewport(true);
      },
      { rootMargin: '100% 0px' },
    );
    const screenObs = new IntersectionObserver(
      (entries) => {
        if (entries[0]) setOnScreen(entries[0].isIntersecting);
      },
      { threshold: 0.02 },
    );
    nearObs.observe(el);
    screenObs.observe(el);

    const onVis = () => setDocHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);

    return () => {
      nearObs.disconnect();
      screenObs.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const canStart = nearViewport && (state === 'idle' || state === 'loading' || state === 'ready' || forceLoad);

  useEffect(() => {
    if (!canStart) return;
    const container = mountRef.current;
    if (!container) return;

    let cancelled = false;
    let instance: ProductViewerController | null = null;

    void import('./engine/createProductViewer')
      .then(({ createProductViewer }) => {
        if (cancelled) return;
        instance = createProductViewer({
          container,
          initialProduct: initialProductRef.current,
          ariaLabel: ariaLabelRef.current,
          onLoadingChange: (loading, pct) => {
            if (cancelled) return;
            setProgress(pct);
            setState(loading ? 'loading' : 'ready');
          },
          onUnavailable: () => {
            if (!cancelled) setState('unavailable');
          },
        });
        controllerRef.current = instance;
      })
      .catch(() => {
        if (!cancelled) setState('unavailable');
      });

    return () => {
      cancelled = true;
      if (instance) {
        instance.dispose();
        instance = null;
      }
      controllerRef.current = null;
    };
  }, [canStart]);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setProduct(product, ariaLabel);
    }
    initialProductRef.current = product;
  }, [product, ariaLabel]);

  useEffect(() => {
    const ctrl = controllerRef.current;
    if (!ctrl) return;
    if (!onScreen || docHidden) ctrl.pause();
    else ctrl.resume();
  }, [onScreen, docHidden]);

  const showFallback = state === 'gated' || state === 'unavailable';

  return (
    <div>
      <div
        ref={frameRef}
        className="relative aspect-[4/3] min-h-[320px] max-h-[70svh] w-full overflow-hidden rounded-lg border border-border bg-[radial-gradient(circle_at_50%_40%,#202020,#141414)]"
      >
        <div ref={mountRef} className="absolute inset-0" />

        {showFallback ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center">
            <ProductIllustration slug={product.slug} className="h-40 w-60 text-foreground/85" />
            {state === 'gated' ? (
              <Button
                type="button"
                variant="heroOutline"
                size="default"
                onClick={() => {
                  setForceLoad(true);
                  setState('loading');
                }}
              >
                {t.productsUi.load3d}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">{t.productsUi.unavailable}</p>
            )}
          </div>
        ) : null}

        {state === 'loading' ? (
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-none absolute bottom-4 left-4 rounded-md bg-hero-bg/85 px-3 py-1.5 text-xs text-muted-foreground"
          >
            {t.productsUi.loading}
            {progress !== null ? ` ${progress}%` : ''}
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>{t.productsUi.drag}</span>
        <span>{t.productsUi.illustrative}</span>
      </div>

      {product.credit ? (
        <p className="mt-1.5 text-sm text-muted-foreground">{product.credit}</p>
      ) : null}
    </div>
  );
}
