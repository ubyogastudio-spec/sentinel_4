import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { SERVICES } from '../../../shared/constants.js';

export function ServicesTeaser() {
  const { t, pages } = useLocale();

  return (
    <section aria-labelledby="home-services-title" className="bg-background py-20 md:py-28">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-widest mn-label-track text-primary">
            {t.home.servicesEyebrow}
          </p>
          <h2
            id="home-services-title"
            className="mt-3 text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.03em] mn-heading-track text-foreground"
          >
            {t.home.servicesTitle}
          </h2>
          <p className="mt-4 text-base md:text-lg font-light text-muted-foreground">
            {t.home.servicesLead}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(min(100%,17rem),1fr))] gap-6">
          {pages.services.items.map((item, idx) => {
            const key = SERVICES[idx];
            return (
              <Link
                key={key}
                to={`/services#${key}`}
                className="group flex flex-col justify-between rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/60"
              >
                <div>
                  <h3 className="text-xl font-semibold tracking-tight mn-heading-track text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground break-words">
                    {item.summary}
                  </p>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
                  {t.home.learnMore}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-10">
          <Link
            to="/services"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            {t.home.viewServices}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
