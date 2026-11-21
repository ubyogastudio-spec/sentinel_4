import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from '@/i18n/format';
import { useLocale } from '@/i18n/LocaleProvider';
import { cn } from '@/lib/cn';
import { buildCells, type CellName } from './engine/cutPattern';

const CELL_NAMES: readonly CellName[] = ['A', 'B', 'C', 'D', 'E'];

export function StaticGlass() {
  const { locale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const readBtnRef = useRef<HTMLButtonElement | null>(null);
  const termsTitleRef = useRef<HTMLHeadingElement | null>(null);
  const gradId = useId();

  useEffect(() => {
    const check = () => setIsPortrait(window.innerHeight > window.innerWidth);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const cells = useMemo(() => buildCells(0, null, isPortrait), [isPortrait]);
  const year = new Date().getFullYear();

  const openTerms = () => {
    setOpen(true);
    window.setTimeout(() => {
      termsTitleRef.current?.focus({ preventScroll: true });
    }, 30);
  };

  const closeTerms = () => {
    setOpen(false);
    window.setTimeout(() => {
      readBtnRef.current?.focus({ preventScroll: true });
    }, 30);
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeTerms();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const toPoints = (pts: readonly (readonly [number, number])[]) =>
    pts.map(([x, y]) => `${(x * 100).toFixed(2)},${(y * 100).toFixed(2)}`).join(' ');

  return (
    <div className="relative flex min-h-[100svh] items-center justify-center bg-glass-bg px-4 py-24 sm:px-8">
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d10]">
        {/* Static SVG glass shards from the same cutPattern */}
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className={cn(
            'pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-250',
            open ? 'opacity-25' : 'opacity-100',
          )}
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1C1C21" />
              <stop offset="100%" stopColor="#121215" />
            </linearGradient>
          </defs>
          {CELL_NAMES.map((name) => (
            <polygon
              key={name}
              points={toPoints(cells[name])}
              fill={`url(#${gradId})`}
              stroke="#050507"
              strokeWidth={10}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {CELL_NAMES.map((name) => (
            <polygon
              key={`${name}-rim`}
              points={toPoints(cells[name])}
              fill="none"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {/* Main copy view */}
        <div
          className={cn(
            'relative z-10 flex flex-col justify-between p-6 sm:p-10 md:p-14 transition-opacity duration-250',
            open ? 'pointer-events-none opacity-0' : 'opacity-100',
          )}
          aria-hidden={open}
          inert={open}
        >
          <div>
            <p className="font-glass text-[11px] font-medium uppercase tracking-[0.2em] mn-label-track text-white/55">
              {t.glass.eyebrow}
            </p>

            <h2
              id="glass-title"
              className={cn(
                'mt-4 font-glass text-[clamp(2.75rem,9vw,6rem)] font-medium leading-[0.97] bg-gradient-to-b from-[#dcdce0] to-[#bdbdc3] bg-clip-text text-transparent',
                locale === 'mn' ? 'tracking-[-0.02em]' : 'tracking-[-0.045em]',
              )}
            >
              {t.glass.line1}
              <br />
              {t.glass.line2}
            </h2>

            <p className="mt-5 max-w-xl font-glass text-sm sm:text-base leading-relaxed text-white/55">
              {t.glass.sub}
            </p>

            <div className="mt-8 flex flex-col items-start gap-4">
              <Link
                to="/products"
                className="inline-flex min-h-11 items-center justify-center rounded-[6px] bg-[#E8E8EC] px-6 py-2.5 font-glass text-sm font-medium text-[#0A0A0A] transition-colors hover:bg-primary"
              >
                {t.glass.open}
              </Link>

              <button
                ref={readBtnRef}
                type="button"
                aria-expanded={open}
                aria-controls="glass-terms"
                onClick={openTerms}
                className="inline-flex min-h-11 items-center font-glass text-sm font-medium text-white underline-offset-4 hover:underline cursor-pointer"
              >
                {t.glass.read}
              </button>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 font-glass text-xs text-white/55">
            <span>{format(t.glass.copyLeft, { year })}</span>
            <span>{t.glass.copyRight}</span>
          </div>
        </div>

        {/* Five terms view toggled in place */}
        {open ? (
          <section
            id="glass-terms"
            aria-labelledby="glass-terms-title-static"
            className="absolute inset-0 z-20 flex flex-col justify-between overflow-y-auto p-6 sm:p-10 md:p-14"
          >
            <div>
              <button
                type="button"
                onClick={closeTerms}
                className="inline-flex min-h-11 items-center font-glass text-sm font-medium text-white transition-colors hover:text-primary cursor-pointer"
              >
                {t.glass.back}
              </button>

              <h3
                id="glass-terms-title-static"
                ref={termsTitleRef}
                tabIndex={-1}
                className="mt-4 font-glass text-lg sm:text-2xl font-semibold tracking-tight text-white focus:outline-none"
              >
                {t.glass.termsTitle}
              </h3>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {t.glass.terms.map((term) => (
                  <p key={term.name} className="font-glass text-sm leading-[1.72] text-white/60">
                    <strong className="font-semibold text-white">{term.name}</strong> — {term.text}
                  </p>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
