import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from '@/i18n/format';
import { useLocale } from '@/i18n/LocaleProvider';
import type { GlassHeroController } from './engine/createGlassHero';
import type { GlassCopy, GlassLayout } from './engine/pageCanvas';

interface GlassStageProps {
  readonly active: boolean;
  readonly paused: boolean;
  readonly onFail: () => void;
}

export function GlassStage({ active, paused, onFail }: GlassStageProps) {
  const { locale, t } = useLocale();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelLayerRef = useRef<HTMLDivElement | null>(null);
  const navLayerRef = useRef<HTMLDivElement | null>(null);
  const readBtnRef = useRef<HTMLButtonElement | null>(null);
  const termsTitleRef = useRef<HTMLHeadingElement | null>(null);
  const controllerRef = useRef<GlassHeroController | null>(null);

  const [layout, setLayout] = useState<GlassLayout | null>(null);
  const [shattered, setShattered] = useState(false);
  const [leavingTerms, setLeavingTerms] = useState(false);

  const glassCopy: GlassCopy = useMemo(
    () => ({
      eyebrow: t.glass.eyebrow,
      line1: t.glass.line1,
      line2: t.glass.line2,
      sub: t.glass.sub,
      open: t.glass.open,
      read: t.glass.read,
      copyLeft: format(t.glass.copyLeft, { year: new Date().getFullYear() }),
      copyRight: t.glass.copyRight,
      navBrand: t.glass.navBrand,
      navServices: t.glass.navServices,
      navProducts: t.glass.navProducts,
      navProjects: t.glass.navProjects,
      navCta: t.glass.navCta,
    }),
    [t],
  );

  const copyRef = useRef(glassCopy);
  const localeRef = useRef(locale);
  copyRef.current = glassCopy;
  localeRef.current = locale;

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    const panelLayer = panelLayerRef.current;
    const navLayer = navLayerRef.current;
    if (!container || !panelLayer || !navLayer) return;

    let cancelled = false;
    let instance: GlassHeroController | null = null;

    void import('./engine/createGlassHero')
      .then(({ createGlassHero }) => {
        if (cancelled) return null;
        return createGlassHero({
          container,
          panelLayerEl: panelLayer,
          navLayerEl: navLayer,
          copy: copyRef.current,
          locale: localeRef.current,
          onLayoutChange: (nextLayout) => {
            if (!cancelled) setLayout(nextLayout);
          },
          onShatterStateChange: () => {},
          onFail: () => {
            if (!cancelled) onFail();
          },
        });
      })
      .then((ctrl) => {
        if (!ctrl) return;
        if (cancelled) {
          ctrl.dispose();
          return;
        }
        instance = ctrl;
        controllerRef.current = ctrl;
      })
      .catch(() => {
        if (!cancelled) onFail();
      });

    return () => {
      cancelled = true;
      if (instance) {
        instance.dispose();
        instance = null;
      }
      controllerRef.current = null;
    };
  }, [active, onFail]);

  useEffect(() => {
    controllerRef.current?.setCopy(glassCopy, locale);
  }, [glassCopy, locale]);

  useEffect(() => {
    const ctrl = controllerRef.current;
    if (!ctrl) return;
    if (paused) ctrl.pause();
    else ctrl.resume();
  }, [paused]);

  const handleShatter = useCallback(() => {
    setLeavingTerms(false);
    setShattered(true);
    controllerRef.current?.shatter();
    window.setTimeout(() => {
      termsTitleRef.current?.focus({ preventScroll: true });
    }, 320);
  }, []);

  const handleReassemble = useCallback(() => {
    setLeavingTerms(true);
    controllerRef.current?.reassemble();
    window.setTimeout(() => {
      setShattered(false);
      setLeavingTerms(false);
      readBtnRef.current?.focus({ preventScroll: true });
    }, 260);
  }, []);

  useEffect(() => {
    if (!shattered) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleReassemble();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [shattered, handleReassemble]);

  const hitBoxStyle = (rect: { x: number; y: number; w: number; h: number }): React.CSSProperties => {
    const w = Math.max(44, rect.w);
    const h = Math.max(44, rect.h);
    const dx = (w - rect.w) / 2;
    const dy = (h - rect.h) / 2;
    return {
      position: 'absolute',
      left: rect.x - dx,
      top: rect.y - dy,
      width: w,
      height: h,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    };
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-glass-bg">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Transparent projected DOM layer for real links, selection, and keyboard focus */}
      <div
        className="glass-stage-text"
        aria-hidden={shattered}
        style={{ visibility: shattered ? 'hidden' : 'visible' }}
      >
        <div
          ref={navLayerRef}
          className="glass-panel-layer"
          inert={shattered}
          style={
            layout
              ? { width: layout.panelW, height: layout.navH }
              : { width: 1, height: 1, opacity: 0 }
          }
        >
          {layout ? (
            <>
              <Link
                to="/"
                className="glass-dom-interactive"
                style={hitBoxStyle(layout.navBrandRect)}
                onMouseEnter={() => controllerRef.current?.setDomHover({ navHoveredIndex: 4 })}
                onMouseLeave={() => controllerRef.current?.setDomHover({ navHoveredIndex: -1 })}
              >
                {glassCopy.navBrand}
              </Link>
              {[
                { to: '/services', label: glassCopy.navServices, rect: layout.navItemRects[0], idx: 0 },
                { to: '/products', label: glassCopy.navProducts, rect: layout.navItemRects[1], idx: 1 },
                { to: '/projects', label: glassCopy.navProjects, rect: layout.navItemRects[2], idx: 2 },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="glass-dom-interactive"
                  style={hitBoxStyle(item.rect)}
                  onMouseEnter={() => controllerRef.current?.setDomHover({ navHoveredIndex: item.idx })}
                  onMouseLeave={() => controllerRef.current?.setDomHover({ navHoveredIndex: -1 })}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/quote"
                className="glass-dom-interactive"
                style={hitBoxStyle(layout.navCtaRect)}
                onMouseEnter={() => controllerRef.current?.setDomHover({ navHoveredIndex: 3 })}
                onMouseLeave={() => controllerRef.current?.setDomHover({ navHoveredIndex: -1 })}
              >
                {glassCopy.navCta}
              </Link>
            </>
          ) : null}
        </div>

        <div
          ref={panelLayerRef}
          className="glass-panel-layer"
          inert={shattered}
          style={
            layout
              ? { width: layout.panelW, height: layout.panelH }
              : { width: 1, height: 1, opacity: 0 }
          }
        >
          {layout ? (
            <>
              <p
                className="glass-dom-copy uppercase"
                style={{
                  position: 'absolute',
                  left: layout.eyebrowRect.x,
                  top: layout.eyebrowRect.y,
                  fontSize: layout.fontSizes.eyebrow,
                  margin: 0,
                }}
              >
                {glassCopy.eyebrow}
              </p>

              <h2
                id="glass-title"
                className="glass-dom-copy"
                style={{
                  position: 'absolute',
                  left: layout.headlineRect.x,
                  top: layout.headlineRect.y,
                  width: layout.headlineRect.w,
                  fontSize: layout.fontSizes.headline,
                  lineHeight: 0.97,
                  margin: 0,
                }}
              >
                {glassCopy.line1}
                <br />
                {glassCopy.line2}
              </h2>

              <p
                className="glass-dom-copy"
                style={{
                  position: 'absolute',
                  left: layout.subRect.x,
                  top: layout.subRect.y,
                  width: layout.subRect.w,
                  fontSize: layout.fontSizes.sub,
                  lineHeight: 1.48,
                  margin: 0,
                }}
              >
                {glassCopy.sub}
              </p>

              <Link
                to="/products"
                className="glass-dom-interactive"
                style={hitBoxStyle(layout.pillRect)}
                onMouseEnter={() => controllerRef.current?.setDomHover({ pillHovered: true })}
                onMouseLeave={() => controllerRef.current?.setDomHover({ pillHovered: false })}
              >
                {glassCopy.open}
              </Link>

              <button
                ref={readBtnRef}
                type="button"
                aria-expanded={shattered}
                aria-controls="glass-terms"
                className="glass-dom-interactive"
                style={hitBoxStyle(layout.readRect)}
                onClick={handleShatter}
                onMouseEnter={() => controllerRef.current?.setDomHover({ readHovered: true })}
                onMouseLeave={() => controllerRef.current?.setDomHover({ readHovered: false })}
              >
                {glassCopy.read}
              </button>

              <span
                className="glass-dom-copy"
                style={{
                  position: 'absolute',
                  left: layout.copyLeftRect.x,
                  top: layout.copyLeftRect.y,
                  fontSize: layout.fontSizes.corner,
                }}
              >
                {glassCopy.copyLeft}
              </span>
              <span
                className="glass-dom-copy"
                style={{
                  position: 'absolute',
                  left: layout.copyRightRect.x,
                  top: layout.copyRightRect.y,
                  fontSize: layout.fontSizes.corner,
                }}
              >
                {glassCopy.copyRight}
              </span>
            </>
          ) : null}
        </div>
      </div>

      {/* Definitions view revealed after shatter */}
      <section
        id="glass-terms"
        aria-labelledby="glass-terms-title"
        className="glass-defs"
        data-visible={shattered ? 'true' : 'false'}
        data-leaving={leavingTerms ? 'true' : 'false'}
        inert={!shattered}
        style={{ visibility: shattered ? 'visible' : 'hidden' }}
      >
        <button
          type="button"
          className="glass-back-btn"
          onClick={handleReassemble}
        >
          {t.glass.back}
        </button>

        <div className="glass-defs__col">
          <h3
            id="glass-terms-title"
            ref={termsTitleRef}
            tabIndex={-1}
            className="glass-defs__title focus:outline-none"
          >
            {t.glass.termsTitle}
          </h3>
          <div className="glass-defs__list">
            {t.glass.terms.map((term) => (
              <p key={term.name} className="glass-defs__item">
                <strong>{term.name}</strong> — {term.text}
              </p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
