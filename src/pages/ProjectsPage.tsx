import { useDocumentMeta } from '@/app/useDocumentMeta';
import { PageHeader } from '@/components/PageHeader';
import { useLocale } from '@/i18n/LocaleProvider';

export function ProjectsPage() {
  const { t, pages } = useLocale();

  useDocumentMeta({
    title: `${t.meta.pages.projects} | SENTINEL AI`,
    description: t.meta.descriptions.projects,
  });

  return (
    <>
      <PageHeader
        eyebrow={pages.projects.eyebrow}
        title={pages.projects.title}
        lead={pages.projects.lead}
      />

      <section className="bg-background py-12 md:py-20">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,17rem),1fr))] gap-6">
            {pages.projects.items.map((project) => (
              <article
                key={project.name}
                className="flex flex-col justify-between rounded-lg border border-border bg-card p-6"
              >
                <div>
                  <div className="inline-flex items-center gap-2 rounded-sm border border-border px-2.5 py-1 text-xs text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                    <span>{project.sector}</span>
                  </div>
                  <h2 className="mt-4 text-xl font-semibold tracking-tight mn-heading-track text-foreground">
                    {project.name}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {project.text}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-baseline gap-2.5">
                  <span className="text-2xl font-bold tabular-nums text-primary shrink-0">
                    {project.figure}
                  </span>
                  <span className="text-sm text-muted-foreground">{project.result}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
