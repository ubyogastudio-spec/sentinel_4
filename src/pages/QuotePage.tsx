import { useDocumentMeta } from '@/app/useDocumentMeta';
import { QuoteForm } from '@/components/forms/QuoteForm';
import { PageHeader } from '@/components/PageHeader';
import { useLocale } from '@/i18n/LocaleProvider';

export function QuotePage() {
  const { t, pages } = useLocale();

  useDocumentMeta({
    title: `${t.meta.pages.quote} | SENTINEL AI`,
    description: t.meta.descriptions.quote,
  });

  return (
    <>
      <PageHeader
        eyebrow={pages.quote.eyebrow}
        title={pages.quote.title}
        lead={pages.quote.lead}
      />

      <section className="bg-background py-12 md:py-20">
        <div className="mx-auto w-full max-w-3xl px-6 md:px-10">
          <div className="rounded-lg border border-border bg-card p-6 md:p-10">
            <QuoteForm />
          </div>
        </div>
      </section>
    </>
  );
}
