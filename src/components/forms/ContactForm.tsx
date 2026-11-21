import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/i18n/LocaleProvider';
import type { Messages } from '@/i18n/en';
import { CONTACT_TOPICS } from '../../../shared/constants.js';
import { contactSchema, fieldCodes } from '../../../shared/schemas.js';
import { Field } from './Field';
import { useFormSubmit } from './useFormSubmit';

type Topic = keyof Messages['form']['topics'];

function initialTopic(param: string | null): Topic {
  if (param && (CONTACT_TOPICS as readonly string[]).includes(param)) {
    return param as Topic;
  }
  return 'general';
}

export function ContactForm() {
  const { locale, t } = useLocale();
  const [searchParams] = useSearchParams();
  const successHeadingRef = useRef<HTMLHeadingElement | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState<Topic>(() => initialTopic(searchParams.get('topic')));
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [triedSubmit, setTriedSubmit] = useState(false);

  const { status, formError, fieldErrors, setFieldErrors, submit, resetForAnother } =
    useFormSubmit('/api/contact');

  useEffect(() => {
    const param = searchParams.get('topic');
    if (param && (CONTACT_TOPICS as readonly string[]).includes(param)) {
      setTopic(param as Topic);
    }
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
    email,
    phone,
    topic,
    message,
    consent,
    locale,
    website,
  });

  const validateSingle = (name: string) => {
    if (!triedSubmit) return;
    const parsed = contactSchema.safeParse(buildInput());
    if (parsed.success) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    } else {
      const codes = fieldCodes(parsed.error, buildInput()) as Record<string, string>;
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
    const parsed = contactSchema.safeParse(raw);
    if (!parsed.success) {
      const codes = fieldCodes(parsed.error, raw) as Record<string, string>;
      setFieldErrors(codes);
      const order = ['fullName', 'email', 'phone', 'topic', 'message', 'consent'];
      const first = order.find((k) => codes[k]);
      if (first) {
        document.getElementById(`contact-${first}`)?.focus();
      }
      return;
    }

    await submit({
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      topic: parsed.data.topic,
      message: parsed.data.message,
      consent: parsed.data.consent,
      locale,
      website,
    });
  };

  const handleReset = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setConsent(false);
    setWebsite('');
    setTriedSubmit(false);
    resetForAnother();
  };

  if (status === 'success') {
    return (
      <div role="status" className="rounded-lg border border-primary/50 bg-card p-8">
        <h3
          ref={successHeadingRef}
          tabIndex={-1}
          className="text-2xl font-bold text-foreground focus:outline-none"
        >
          {t.form.success.title}
        </h3>
        <p className="mt-3 text-base text-muted-foreground">{t.form.success.text}</p>
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
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <Field
        id="contact-fullName"
        label={t.form.labels.fullName}
        required
        error={mapError(fieldErrors.fullName)}
      >
        <Input
          id="contact-fullName"
          name="fullName"
          autoComplete="name"
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.fullName)}
          aria-describedby={fieldErrors.fullName ? 'contact-fullName-error' : undefined}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          onBlur={() => validateSingle('fullName')}
        />
      </Field>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field
          id="contact-email"
          label={t.form.labels.email}
          required
          error={mapError(fieldErrors.email)}
        >
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => validateSingle('email')}
          />
        </Field>

        <Field
          id="contact-phone"
          label={t.form.labels.phone}
          optionalText={t.form.optional}
          hint={t.form.phoneHint}
          error={mapError(fieldErrors.phone)}
        >
          <Input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? 'contact-phone-error' : undefined}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => validateSingle('phone')}
          />
        </Field>
      </div>

      <Field
        id="contact-topic"
        label={t.form.labels.topic}
        required
        error={mapError(fieldErrors.topic)}
      >
        <select
          id="contact-topic"
          name="topic"
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.topic)}
          aria-describedby={fieldErrors.topic ? 'contact-topic-error' : undefined}
          value={topic}
          onChange={(e) => setTopic(e.target.value as Topic)}
          onBlur={() => validateSingle('topic')}
          className="h-12 w-full rounded-md border border-field-border bg-hero-bg px-4 text-base text-foreground transition-colors hover:border-[hsl(0_0%_60%)] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ring"
        >
          {CONTACT_TOPICS.map((item) => {
            const key = item as Topic;
            return (
              <option key={item} value={item}>
                {t.form.topics[key]}
              </option>
            );
          })}
        </select>
      </Field>

      <Field
        id="contact-message"
        label={t.form.labels.message}
        required
        error={mapError(fieldErrors.message)}
      >
        <Textarea
          id="contact-message"
          name="message"
          rows={6}
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onBlur={() => validateSingle('message')}
        />
      </Field>

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <Checkbox
            id="contact-consent"
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
            aria-describedby={fieldErrors.consent ? 'contact-consent-error' : undefined}
            className="mt-0.5"
          />
          <label htmlFor="contact-consent" className="text-sm leading-relaxed text-muted-foreground cursor-pointer">
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
          <p id="contact-consent-error" className="text-sm text-destructive" role="alert">
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
            t.form.send
          )}
        </Button>
      </div>
    </form>
  );
}
