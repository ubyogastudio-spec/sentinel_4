import { useDocumentMeta } from '@/app/useDocumentMeta';
import { ContactForm } from '@/components/forms/ContactForm';
import { PageHeader } from '@/components/PageHeader';
import { brand } from '@/content/brand';
import { useLocale } from '@/i18n/LocaleProvider';

export function ContactPage() {
  const { t, pages } = useLocale();

  useDocumentMeta({
    title: `${t.meta.pages.contact} | SENTINEL AI`,
    description: t.meta.descriptions.contact,
  });

  return (
    <>
      <PageHeader
        eyebrow={pages.contact.eyebrow}
        title={pages.contact.title}
        lead={pages.contact.lead}
      />

      <section className="bg-background py-12 md:py-20">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
            <div className="rounded-lg border border-border bg-card p-6 md:p-8">
              <h2 className="mb-6 text-2xl font-bold tracking-tight mn-heading-track text-foreground">
                {pages.contact.formTitle}
              </h2>
              <ContactForm />
            </div>

            <aside className="rounded-lg border border-border bg-card p-6 md:p-8">
              <h2 className="text-2xl font-bold tracking-tight mn-heading-track text-foreground">
                {pages.contact.detailsTitle}
              </h2>

              <dl className="mt-6 flex flex-col gap-5 text-sm md:text-base">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-widest mn-label-track text-muted-foreground">
                    {pages.contact.addressLabel}
                  </dt>
                  <dd className="mt-1.5 text-foreground">{t.footer.address}</dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-widest mn-label-track text-muted-foreground">
                    {pages.contact.phoneLabel}
                  </dt>
                  <dd className="mt-1.5">
                    <a
                      href={brand.phoneHref}
                      className="inline-flex min-h-11 items-center text-foreground underline-offset-4 hover:text-primary hover:underline"
                    >
                      {brand.phoneDisplay}
                    </a>
                  </dd>
                </div>

                {brand.email ? (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-widest mn-label-track text-muted-foreground">
                      {pages.contact.emailLabel}
                    </dt>
                    <dd className="mt-1.5">
                      <a
                        href={`mailto:${brand.email}`}
                        className="inline-flex min-h-11 items-center text-foreground underline-offset-4 hover:text-primary hover:underline"
                      >
                        {brand.email}
                      </a>
                    </dd>
                  </div>
                ) : null}

                <div>
                  <dt className="text-xs font-medium uppercase tracking-widest mn-label-track text-muted-foreground">
                    {pages.contact.hoursLabel}
                  </dt>
                  <dd className="mt-1.5 text-foreground">{t.footer.hours}</dd>
                </div>
              </dl>

              <p className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
                {pages.contact.replyNote}
              </p>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
