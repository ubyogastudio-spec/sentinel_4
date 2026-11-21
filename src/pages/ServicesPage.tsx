import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { useDocumentMeta } from '@/app/useDocumentMeta';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/i18n/LocaleProvider';
import { SERVICES } from '../../shared/constants.js';

export function ServicesPage() {
  const { t, pages } = useLocale();

  useDocumentMeta({
    title: `${t.meta.pages.services} | SENTINEL AI`,
    description: t.meta.descriptions.services,
  });

  return (
    <>
      <PageHeader
        eyebrow={pages.services.eyebrow}
        title={pages.services.title}
        lead={pages.services.lead}
      />

      <div className="bg-background py-12 md:py-20">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16 flex flex-col gap-10">
          {pages.services.items.map((service, idx) => {
            const key = SERVICES[idx];
            return (
              <section
                key={key}
                id={key}
                aria-labelledby={`service-${key}-title`}
                className="scroll-mt-24 rounded-lg border border-border bg-card p-6 md:p-10"
              >
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
                  <div>
                    <h2
                      id={`service-${key}-title`}
                      className="text-2xl md:text-3xl font-bold tracking-tight mn-heading-track text-foreground"
                    >
                      {service.title}
                    </h2>
                    <p className="mt-3 text-lg font-medium text-foreground/90">
                      {service.summary}
                    </p>
                    <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                      {service.text}
                    </p>
                    <div className="mt-7">
                      <Button asChild variant="primary" size="default">
                        <Link to={`/quote?service=${key}`}>
                          {pages.services.quote}
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <ul className="flex flex-col gap-3 rounded-md border border-border bg-hero-bg/70 p-6">
                    {service.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm md:text-base text-foreground/90">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <section aria-labelledby="process-title" className="bg-hero-bg py-16 md:py-24">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="max-w-2xl">
            <h2
              id="process-title"
              className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.03em] mn-heading-track text-foreground"
            >
              {pages.services.process.title}
            </h2>
            <p className="mt-3 text-base md:text-lg font-light text-muted-foreground">
              {pages.services.process.lead}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pages.services.process.steps.map((step, idx) => (
              <div
                key={step.title}
                className="flex flex-col rounded-lg border border-border bg-card p-6"
              >
                <span className="text-sm font-bold tracking-widest text-primary tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-xl font-semibold tracking-tight mn-heading-track text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
