import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';

export function ProjectsTeaser() {
  const { t, pages } = useLocale();
  const featured = pages.projects.items.slice(0, 3);

  return (
    <section aria-labelledby="home-projects-title" className="bg-background py-20 md:py-28">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-widest mn-label-track text-primary">
            {t.home.projectsEyebrow}
          </p>
          <h2
            id="home-projects-title"
            className="mt-3 text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.03em] mn-heading-track text-foreground"
          >
            {t.home.projectsTitle}
          </h2>
          <p className="mt-4 text-base md:text-lg font-light text-muted-foreground">
            {t.home.projectsLead}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(min(100%,17rem),1fr))] gap-6">
          {featured.map((project) => (
            <article
              key={project.name}
              className="flex flex-col justify-between rounded-lg border border-border bg-card p-6"
            >
              <div>
                <div className="inline-flex items-center gap-2 rounded-sm border border-border px-2.5 py-1 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                  <span>{project.sector}</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold tracking-tight mn-heading-track text-foreground">
                  {project.name}
                </h3>
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

        <div className="mt-10">
          <Link
            to="/projects"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            {t.home.viewProjects}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
