import { Link, useLocation } from 'react-router-dom';
import { useDocumentMeta } from '@/app/useDocumentMeta';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/i18n/LocaleProvider';

export function NotFoundPage() {
  const { t } = useLocale();
  const { pathname } = useLocation();

  useDocumentMeta({
    title: `${t.meta.pages.notFound} | SENTINEL AI`,
    description: t.meta.descriptions.notFound,
    noindex: true,
  });

  const truncatedPath = pathname.length > 80 ? `${pathname.slice(0, 80)}…` : pathname;

  return (
    <section className="relative min-h-[100svh] bg-hero-bg pt-32 pb-20 flex items-center overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center">
          <div className="relative z-10 max-w-xl">
            <p className="text-xs font-medium uppercase tracking-widest mn-label-track text-primary">
              {t.notFound.eyebrow}
            </p>
            <h1 className="mt-3 text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.05] tracking-[-0.03em] mn-heading-track text-foreground">
              {t.notFound.title}
            </h1>
            <p className="mt-4 text-base md:text-lg font-light leading-relaxed text-muted-foreground">
              {t.notFound.text}
            </p>

            <p className="mt-5 text-sm text-muted-foreground">
              <span>{t.notFound.requested} </span>
              <code
                title={pathname}
                className="rounded-sm border border-border bg-card px-2 py-0.5 font-mono text-xs text-foreground break-all"
              >
                {truncatedPath}
              </code>
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="primary" size="hero">
                <Link to="/">{t.notFound.home}</Link>
              </Button>
              <Button asChild variant="heroOutline" size="hero">
                <Link to="/contact">{t.notFound.contact}</Link>
              </Button>
            </div>

            <div className="mt-10 border-t border-border pt-6">
              <p className="text-xs font-medium uppercase tracking-widest mn-label-track text-muted-foreground">
                {t.notFound.quick}
              </p>
              <nav aria-label={t.notFound.quick} className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <Link to="/services" className="inline-flex min-h-11 items-center text-foreground hover:text-primary transition-colors">
                  {t.nav.services}
                </Link>
                <Link to="/products" className="inline-flex min-h-11 items-center text-foreground hover:text-primary transition-colors">
                  {t.nav.products}
                </Link>
                <Link to="/projects" className="inline-flex min-h-11 items-center text-foreground hover:text-primary transition-colors">
                  {t.nav.projects}
                </Link>
                <Link to="/contact" className="inline-flex min-h-11 items-center text-foreground hover:text-primary transition-colors">
                  {t.nav.contact}
                </Link>
              </nav>
            </div>
          </div>

          {/* Perimeter radar & corner-bracket 404 graphic */}
          <div
            aria-hidden="true"
            className="relative flex items-center justify-center min-h-[280px] sm:min-h-[340px]"
          >
            <div className="relative h-64 w-64 sm:h-80 sm:w-80 rounded-full border border-border/80 flex items-center justify-center overflow-hidden bg-background/40">
              {/* Concentric rings */}
              <div className="absolute inset-6 rounded-full border border-border/70" />
              <div className="absolute inset-14 rounded-full border border-border/60" />

              {/* Crosshair */}
              <div className="absolute inset-x-0 top-1/2 h-px bg-border/60" />
              <div className="absolute inset-y-0 left-1/2 w-px bg-border/60" />

              {/* Sweeping conic gradient */}
              <div className="radar-sweep absolute inset-0 rounded-full" />

              {/* Blips */}
              <span
                className="radar-blip absolute top-[24%] left-[64%] h-2 w-2 rounded-full bg-primary"
                style={{ animationDelay: '0s' }}
              />
              <span
                className="radar-blip absolute top-[66%] left-[32%] h-2 w-2 rounded-full bg-primary"
                style={{ animationDelay: '1.1s' }}
              />
              <span
                className="radar-blip absolute top-[44%] left-[78%] h-1.5 w-1.5 rounded-full bg-primary"
                style={{ animationDelay: '2.2s' }}
              />
            </div>

            {/* Large decorative 404 framed by green corner brackets */}
            <div className="pointer-events-none absolute z-10 px-6 py-4 select-none">
              <span className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-primary" />
              <span className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-primary" />
              <span className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-primary" />
              <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-primary" />
              <span className="block text-[clamp(5.5rem,18vw,13rem)] font-bold leading-none tracking-[-0.06em] text-foreground/15 tabular-nums">
                404
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
