import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { brand } from '@/content/brand';
import { format } from '@/i18n/format';
import { useLocale } from '@/i18n/LocaleProvider';

export function CtaBand() {
  const { t } = useLocale();

  return (
    <section aria-labelledby="home-cta-title" className="bg-hero-bg py-20 md:py-28">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
        <div className="rounded-lg border border-border bg-card p-8 md:p-12 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2
              id="home-cta-title"
              className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.03em] mn-heading-track text-foreground"
            >
              {t.home.ctaTitle}
            </h2>
            <p className="mt-3 text-base md:text-lg font-light text-muted-foreground">
              {t.home.ctaText}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Button asChild variant="primary" size="hero">
              <Link to="/quote">{t.home.ctaQuote}</Link>
            </Button>
            <Button asChild variant="light" size="hero">
              <a href={brand.phoneHref}>{format(t.home.ctaCall, { phone: brand.phoneDisplay })}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
