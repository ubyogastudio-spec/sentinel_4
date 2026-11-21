import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { products } from '@/content/products';
import { useLocale } from '@/i18n/LocaleProvider';
import type { Messages } from '@/i18n/en';
import { PREFERRED_CONTACT, PRODUCT_SLUGS, SERVICES, SITE_TYPES } from '../../../shared/constants.js';
import { fieldCodes, quoteSchema } from '../../../shared/schemas.js';
import { Field } from './Field';
import { useFormSubmit } from './useFormSubmit';

type Service = keyof Messages['form']['services'];
type SiteType = keyof Messages['form']['siteTypes'];
type ProductSlug = '' | 'camera' | 'reader' | 'hub';
type Preferred = keyof Messages['form']['preferred'];

function initialService(param: string | null): Service {
  if (param && (SERVICES as readonly string[]).includes(param)) return param as Service;
  return 'surveillance';
}

function initialProduct(param: string | null): ProductSlug {
  if (param && (PRODUCT_SLUGS as readonly string[]).includes(param)) return param as ProductSlug;
  return '';
}

export function QuoteForm() {
  const { locale, t } = useLocale();
  const [searchParams] = useSearchParams();
  const successHeadingRef = useRef<HTMLHeadingElement | null>(null);

  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState<Service>(() => initialService(searchParams.get('service')));
  const [siteType, setSiteType] = useState<SiteType>('office');
  const [product, setProduct] = useState<ProductSlug>(() => initialProduct(searchParams.get('product')));
  const [preferredContact, setPreferredContact] = useState<Preferred>('phone');
  const [details, setDetails] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [triedSubmit, setTriedSubmit] = useState(false);

  const { status, formError, fieldErrors, setFieldErrors, submit, resetForAnother } =
    useFormSubmit('/api/quote');

  useEffect(() => {
    const svc = searchParams.get('service');
    if (svc && (SERVICES as readonly string[]).includes(svc)) setService(svc as Service);
    const prod = searchParams.get('product');
    if (prod && (PRODUCT_SLUGS as readonly string[]).includes(prod)) setProduct(prod as ProductSlug);
  }, [searchParams]);

  useEffect(() => {
    if (status === 'success') {
      successHeadingRef.current?.focus({ preventScroll: true });
    }
  }, [status]);

  const mapError = (code?: string): string | undefined => {
    if (!code) return undefined;
    return t.form.errors[code as keyof typeof t.form.errors] ?? t.form.errors.invalid;
  };

  const buildInput = () => ({
    requestId: 'client-check-0001',
    fullName,
    company,
    email,
    phone,
    service,
    siteType,
    product,
    preferredContact,
    details,
    consent,
    locale,
    website,
  });

  const validateSingle = (name: string) => {
    if (!triedSubmit) return;
    const raw = buildInput();
    const parsed = quoteSchema.safeParse(raw);
    if (parsed.success) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    } else {
      const codes = fieldCodes(parsed.error, raw) as Record<string, string>;
      setFieldErrors((prev) => {
        const next = { ...prev };
        if (codes[name]) next[name] = codes[name];
        else delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTriedSubmit(true);

    const raw = buildInput();
    const parsed = quoteSchema.safeParse(raw);
    if (!parsed.success) {
      const codes = fieldCodes(parsed.error, raw) as Record<string, string>;
      setFieldErrors(codes);
      const order = ['fullName', 'company', 'email', 'phone', 'service', 'siteType', 'product', 'preferredContact', 'details', 'consent'];
      const first = order.find((k) => codes[k]);
      if (first) {
        document.getElementById(`quote-${first}`)?.focus();
      }
      return;
    }

    await submit({
      fullName: parsed.data.fullName,
      company: parsed.data.company,
      email: parsed.data.email,
      phone: parsed.data.phone,
      service: parsed.data.service,
      siteType: parsed.data.siteType,
      product: parsed.data.product,
      preferredContact: parsed.data.preferredContact,
      details: parsed.data.details,
      consent: parsed.data.consent,
      locale,
      website,
    });
  };

  const handleReset = () => {
    setFullName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setDetails('');
    setConsent(false);
    setWebsite('');
    setTriedSubmit(false);
    resetForAnother();
  };

  if (status === 'success') {
    return (
      <div role="status" className="rounded-lg border border-primary/50 bg-card p-8">
        <h2
          ref={successHeadingRef}
          tabIndex={-1}
          className="text-2xl font-bold text-foreground focus:outline-none"
        >
          {t.form.successQuote.title}
        </h2>
        <p className="mt-3 text-base text-muted-foreground">{t.form.successQuote.text}</p>
        <Button type="button" variant="outline" className="mt-6" onClick={handleReset}>
          {t.form.sendAnother}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">{t.form.requiredNote}</p>

      {/* Honeypot */}
      <div aria-hidden="true" className="fixed -left-[9999px] top-0 h-px w-px overflow-hidden">
        <label htmlFor="quote-website">Website</label>
        <input
          id="quote-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field
          id="quote-fullName"
          label={t.form.labels.fullName}
          required
          error={mapError(fieldErrors.fullName)}
        >
          <Input
            id="quote-fullName"
            name="fullName"
            autoComplete="name"
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.fullName)}
            aria-describedby={fieldErrors.fullName ? 'quote-fullName-error' : undefined}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onBlur={() => validateSingle('fullName')}
          />
        </Field>

        <Field
          id="quote-company"
          label={t.form.labels.company}
          optionalText={t.form.optional}
          error={mapError(fieldErrors.company)}
        >
          <Input
            id="quote-company"
            name="company"
            autoComplete="organization"
            aria-invalid={Boolean(fieldErrors.company)}
            aria-describedby={fieldErrors.company ? 'quote-company-error' : undefined}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            onBlur={() => validateSingle('company')}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field
          id="quote-email"
          label={t.form.labels.email}
          required
          error={mapError(fieldErrors.email)}
        >
          <Input
            id="quote-email"
            name="email"
            type="email"
            autoComplete="email"
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'quote-email-error' : undefined}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => validateSingle('email')}
          />
        </Field>

        <Field
          id="quote-phone"
          label={t.form.labels.phone}
          required
          hint={t.form.phoneHint}
          error={mapError(fieldErrors.phone)}
        >
          <Input
            id="quote-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? 'quote-phone-error' : undefined}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => validateSingle('phone')}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field
          id="quote-service"
          label={t.form.labels.service}
          required
          error={mapError(fieldErrors.service)}
        >
          <select
            id="quote-service"
            name="service"
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.service)}
            aria-describedby={fieldErrors.service ? 'quote-service-error' : undefined}
            value={service}
            onChange={(e) => setService(e.target.value as Service)}
            onBlur={() => validateSingle('service')}
            className="h-12 w-full rounded-md border border-field-border bg-hero-bg px-4 text-base text-foreground transition-colors hover:border-[hsl(0_0%_60%)] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ring"
          >
            {SERVICES.map((item) => {
              const key = item as Service;
              return (
                <option key={item} value={item}>
                  {t.form.services[key]}
                </option>
              );
            })}
          </select>
        </Field>

        <Field
          id="quote-siteType"
          label={t.form.labels.siteType}
          required
          error={mapError(fieldErrors.siteType)}
        >
          <select
            id="quote-siteType"
            name="siteType"
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.siteType)}
            aria-describedby={fieldErrors.siteType ? 'quote-siteType-error' : undefined}
            value={siteType}
            onChange={(e) => setSiteType(e.target.value as SiteType)}
            onBlur={() => validateSingle('siteType')}
            className="h-12 w-full rounded-md border border-field-border bg-hero-bg px-4 text-base text-foreground transition-colors hover:border-[hsl(0_0%_60%)] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ring"
          >
            {SITE_TYPES.map((item) => {
              const key = item as SiteType;
              return (
                <option key={item} value={item}>
                  {t.form.siteTypes[key]}
                </option>
              );
            })}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field
          id="quote-product"
          label={t.form.labels.product}
          optionalText={t.form.optional}
          error={mapError(fieldErrors.product)}
        >
          <select
            id="quote-product"
            name="product"
            aria-invalid={Boolean(fieldErrors.product)}
            aria-describedby={fieldErrors.product ? 'quote-product-error' : undefined}
            value={product}
            onChange={(e) => setProduct(e.target.value as ProductSlug)}
            onBlur={() => validateSingle('product')}
            className="h-12 w-full rounded-md border border-field-border bg-hero-bg px-4 text-base text-foreground transition-colors hover:border-[hsl(0_0%_60%)] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ring"
          >
            <option value="">{t.form.productNone}</option>
            {products.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name} ({item.code})
              </option>
            ))}
          </select>
        </Field>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium leading-snug text-foreground">
            {t.form.labels.preferred}{' '}
            <span className="text-primary" aria-hidden="true">
              *
            </span>
          </legend>
          <div className="flex h-12 items-center gap-6">
            {PREFERRED_CONTACT.map((method) => {
              const key = method as Preferred;
              return (
                <Label
                  key={method}
                  htmlFor={`quote-preferred-${method}`}
                  className="inline-flex min-h-11 items-center gap-2.5 font-normal cursor-pointer"
                >
                  <input
                    id={`quote-preferred-${method}`}
                    type="radio"
                    name="preferredContact"
                    value={method}
                    checked={preferredContact === method}
                    onChange={() => setPreferredContact(key)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span>{t.form.preferred[key]}</span>
                </Label>
              );
            })}
          </div>
        </fieldset>
      </div>

      <Field
        id="quote-details"
        label={t.form.labels.details}
        required
        error={mapError(fieldErrors.details)}
      >
        <Textarea
          id="quote-details"
          name="details"
          rows={6}
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.details)}
          aria-describedby={fieldErrors.details ? 'quote-details-error' : undefined}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          onBlur={() => validateSingle('details')}
        />
      </Field>

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <Checkbox
            id="quote-consent"
            checked={consent}
            onCheckedChange={(checked) => {
              const next = checked === true;
              setConsent(next);
              if (triedSubmit) {
                setFieldErrors((prev) => {
                  const copy = { ...prev };
                  if (next) delete copy.consent;
                  else copy.consent = 'consent';
                  return copy;
                });
              }
            }}
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.consent)}
            aria-describedby={fieldErrors.consent ? 'quote-consent-error' : undefined}
            className="mt-0.5"
          />
          <label htmlFor="quote-consent" className="text-sm leading-relaxed text-muted-foreground cursor-pointer">
            {t.form.consent.before}
            <Link to="/legal/privacy" className="text-foreground underline underline-offset-4 hover:text-primary">
              {t.form.consent.link}
            </Link>
            {t.form.consent.after}
            <span className="text-primary ml-1" aria-hidden="true">
              *
            </span>
          </label>
        </div>
        {fieldErrors.consent ? (
          <p id="quote-consent-error" className="text-sm text-destructive" role="alert">
            {mapError(fieldErrors.consent)}
          </p>
        ) : null}
      </div>

      <div aria-live="polite" className="min-h-6">
        {formError ? (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        ) : null}
      </div>

      <div>
        <Button type="submit" variant="primary" size="hero" disabled={status === 'submitting'}>
          {status === 'submitting' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {t.form.sending}
            </>
          ) : (
            t.form.sendQuote
          )}
        </Button>
      </div>
    </form>
  );
}
