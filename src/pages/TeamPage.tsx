import { useDocumentMeta } from '@/app/useDocumentMeta';
import { PageHeader } from '@/components/PageHeader';
import { useLocale } from '@/i18n/LocaleProvider';
import type { Locale } from '@/i18n';

function getInitials(name: string, locale: Locale): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const second = words[1]?.[0] ?? '';
  return `${first}${second}`.toLocaleUpperCase(locale);
}

export function TeamPage() {
  const { locale, t, pages } = useLocale();

  useDocumentMeta({
    title: `${t.meta.pages.team} | SENTINEL AI`,
    description: t.meta.descriptions.team,
  });

  return (
    <>
      <PageHeader
        eyebrow={pages.team.eyebrow}
        title={pages.team.title}
        lead={pages.team.lead}
      />

      <section className="bg-background py-12 md:py-20">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pages.team.members.map((member) => (
              <article
                key={member.name}
                className="flex flex-col rounded-lg border border-border bg-card p-6"
              >
                <div
                  aria-hidden="true"
                  className="flex h-24 w-24 items-center justify-center rounded-full border border-border bg-muted text-2xl font-semibold text-primary"
                >
                  {getInitials(member.name, locale)}
                </div>

                <h2 className="mt-6 text-xl font-semibold tracking-tight mn-heading-track text-foreground">
                  {member.name}
                </h2>
                <p className="mt-1 text-sm font-medium text-primary">
                  {member.role}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {member.bio}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
