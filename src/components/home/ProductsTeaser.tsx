import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductIllustration } from '@/components/products/ProductIllustration';
import { products } from '@/content/products';
import { useLocale } from '@/i18n/LocaleProvider';

export function ProductsTeaser() {
  const { t, pages } = useLocale();

  return (
    <section aria-labelledby="home-products-title" className="bg-hero-bg py-20 md:py-28">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-widest mn-label-track text-primary">
            {t.home.productsEyebrow}
          </p>
          <h2
            id="home-products-title"
            className="mt-3 text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.03em] mn-heading-track text-foreground"
          >
            {t.home.productsTitle}
          </h2>
          <p className="mt-4 text-base md:text-lg font-light text-muted-foreground">
            {t.home.productsLead}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(min(100%,17rem),1fr))] gap-6">
          {products.map((product, idx) => {
            const copy = pages.products.items[idx];
            return (
              <Link
                key={product.slug}
                to={`/products/${product.slug}`}
                className="group flex flex-col justify-between rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/60"
              >
                <div>
                  <div className="flex h-40 items-center justify-center rounded-md bg-hero-bg/80 p-4">
                    <ProductIllustration slug={product.slug} className="h-32 w-48 text-foreground/90" />
                  </div>
                  <div className="mt-5 flex items-baseline justify-between gap-3">
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">
                      {product.name}
                    </h3>
                    <span className="text-xs font-medium tracking-widest text-muted-foreground shrink-0">
                      {product.code}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {copy.tagline}
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
            to="/products"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            {t.home.viewProducts}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
