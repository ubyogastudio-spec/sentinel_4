import { Link, NavLink, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useDocumentMeta } from '@/app/useDocumentMeta';
import { PageHeader } from '@/components/PageHeader';
import { ProductViewer } from '@/components/products/ProductViewer';
import { Button } from '@/components/ui/button';
import { products } from '@/content/products';
import { useLocale } from '@/i18n/LocaleProvider';
import { cn } from '@/lib/cn';
import { PRODUCT_SLUGS } from '../../shared/constants.js';
import { NotFoundPage } from './NotFoundPage';

export function ProductsPage() {
  const { slug } = useParams<{ slug?: string }>();
  const normalizedSlug = slug?.toLowerCase();

  if (normalizedSlug && !(PRODUCT_SLUGS as readonly string[]).includes(normalizedSlug)) {
    return <NotFoundPage />;
  }

  return <ProductsDetail activeSlug={normalizedSlug ?? products[0].slug} />;
}

function ProductsDetail({ activeSlug }: { readonly activeSlug: string }) {
  const { t, pages } = useLocale();

  const index = Math.max(
    0,
    products.findIndex((p) => p.slug === activeSlug),
  );
  const current = products[index];
  const copy = pages.products.items[index];

  useDocumentMeta({
    title: `${current.name} — ${t.meta.pages.products} | SENTINEL AI`,
    description: t.meta.descriptions.products,
  });

  return (
    <>
      <PageHeader
        eyebrow={pages.products.eyebrow}
        title={pages.products.title}
        lead={pages.products.lead}
      />

      <section aria-labelledby="product-detail-title" className="bg-background py-12 md:py-20">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
            <ProductViewer product={current} />

            <div className="flex flex-col gap-6">
              <nav aria-label={t.productsUi.switcher} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {products.map((item) => {
                  const active = item.slug === current.slug;
                  return (
                    <NavLink
                      key={item.slug}
                      to={`/products/${item.slug}`}
                      replace
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex flex-col justify-between rounded-md border px-3.5 py-3 text-left transition-colors min-h-11',
                        active
                          ? 'border-primary bg-card text-foreground'
                          : 'border-border bg-hero-bg/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground',
                      )}
                    >
                      <span className="text-sm font-semibold leading-tight">{item.name}</span>
                      <span className="mt-1 text-xs font-medium tracking-widest text-primary">
                        {item.code}
                      </span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="rounded-lg border border-border bg-card p-6 md:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2
                    id="product-detail-title"
                    className="text-2xl md:text-3xl font-bold tracking-tight text-foreground"
                  >
                    {current.name}
                  </h2>
                  <span className="text-xs font-semibold tracking-widest uppercase text-primary">
                    {current.code}
                  </span>
                </div>

                <p className="mt-2 text-base font-medium text-foreground/90">
                  {copy.tagline}
                </p>

                <p className="mt-4 text-sm md:text-base leading-relaxed text-muted-foreground">
                  {copy.text}
                </p>

                <div className="mt-6">
                  <h3 className="text-xs font-medium uppercase tracking-widest mn-label-track text-muted-foreground">
                    {t.productsUi.specs}
                  </h3>
                  <dl className="mt-3 divide-y divide-border border-t border-b border-border">
                    {copy.specs.map((spec) => (
                      <div
                        key={spec.label}
                        className="flex items-baseline justify-between gap-4 py-3 text-sm"
                      >
                        <dt className="text-muted-foreground">{spec.label}</dt>
                        <dd className="text-right font-medium text-foreground">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Button asChild variant="primary" size="default">
                    <Link to={`/quote?product=${current.slug}&service=${current.service}`}>
                      {t.productsUi.quoteCta}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button asChild variant="heroOutline" size="default">
                    <Link to="/contact">{t.productsUi.talkCta}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
