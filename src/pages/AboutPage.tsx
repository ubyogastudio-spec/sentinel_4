import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useDocumentMeta } from '@/app/useDocumentMeta';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/i18n/LocaleProvider';

export function AboutPage() {
  const { t, pages } = useLocale();

  useDocumentMeta({
    title: `${t.meta.pages.about} | SENTINEL AI`,
    description: t.meta.descriptions.about,
  });

  return (
    <>
      <PageHeader
        eyebrow={pages.about.eyebrow}
        title={pages.about.title}
        lead={pages.about.lead}
      />

      <section aria-labelledby="about-story-title" className="bg-background py-12 md:py-20">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="max-w-3xl">
            <h2
              id="about-story-title"
              className="text-2xl md:text-3xl font-bold tracking-tight mn-heading-track text-foreground"
            >
              {pages.about.storyTitle}
            </h2>
            <div className="mt-5 flex flex-col gap-4 text-base md:text-lg leading-relaxed text-muted-foreground">
              {pages.about.story.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mn-heading-track text-foreground">
              {pages.about.valuesTitle}
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {pages.about.values.map((value) => (
                <div
                  key={value.title}
                  className="rounded-lg border border-border bg-card p-6"
                >
                  <h3 className="text-xl font-semibold tracking-tight mn-heading-track text-foreground">
                    {value.title}
                  </h3>
                  <p className="mt-3 text-sm md:text-base leading-relaxed text-muted-foreground">
                    {value.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-hero-bg py-16 md:py-24">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {pages.about.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-none tracking-tight text-primary tabular-nums">
                  {stat.value}
                </span>
                <span className="mt-3 text-sm md:text-base text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-lg border border-border bg-card p-8 md:p-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mn-heading-track text-foreground">
              {pages.about.ctaTitle}
            </h2>
            <Button asChild variant="primary" size="hero" className="shrink-0">
              <Link to="/contact">
                {pages.about.ctaButton}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
