import { useParams } from 'react-router-dom';
import { useDocumentMeta } from '@/app/useDocumentMeta';
import { useLocale } from '@/i18n/LocaleProvider';
import { LEGAL_SLUGS } from '../../shared/constants.js';
import { NotFoundPage } from './NotFoundPage';

type LegalSlug = 'privacy' | 'terms' | 'cookies';

export function LegalPage() {
  const { slug } = useParams<{ slug?: string }>();
  const normalized = slug?.toLowerCase();

  if (!normalized || !(LEGAL_SLUGS as readonly string[]).includes(normalized)) {
    return <NotFoundPage />;
  }

  return <LegalContent slug={normalized as LegalSlug} />;
}

function LegalContent({ slug }: { readonly slug: LegalSlug }) {
  const { t, pages } = useLocale();
  const doc = pages.legal[slug];

  useDocumentMeta({
    title: `${t.meta.pages[slug]} | SENTINEL AI`,
    description: t.meta.descriptions.legal,
  });

  return (
    <>
      <header className="bg-hero-bg pt-32 pb-12 md:pb-16">
        <div className="mx-auto w-full max-w-3xl px-6 md:px-10">
          <p className="text-xs font-medium uppercase tracking-widest mn-label-track text-primary">
            {pages.legal.updated}
          </p>
          <h1 className="mt-3 text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.05] tracking-[-0.03em] mn-heading-track text-foreground">
            {doc.title}
          </h1>
        </div>
      </header>

      <article className="bg-background py-12 md:py-20">
        <div className="mx-auto w-full max-w-3xl px-6 md:px-10 flex flex-col gap-10">
          {doc.sections.map((section, idx) => (
            <section key={section.heading}>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight mn-heading-track text-foreground">
                {idx + 1}. {section.heading}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {section.text}
              </p>
            </section>
          ))}
        </div>
      </article>
    </>
  );
}
