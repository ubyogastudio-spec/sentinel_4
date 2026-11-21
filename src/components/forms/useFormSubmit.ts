import { useCallback, useRef, useState } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';

function makeRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

export function useFormSubmit(endpoint: string) {
  const { t } = useLocale();
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [formError, setFormError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const requestIdRef = useRef<string>(makeRequestId());
  const inFlightRef = useRef(false);

  const resetForAnother = useCallback(() => {
    requestIdRef.current = makeRequestId();
    setStatus('idle');
    setFormError('');
    setFieldErrors({});
  }, []);

  const submit = useCallback(
    async (payload: Record<string, unknown>): Promise<boolean> => {
      if (inFlightRef.current) return false;
      inFlightRef.current = true;
      setStatus('submitting');
      setFormError('');
      setFieldErrors({});

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 15000);

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ...payload, requestId: requestIdRef.current }),
          signal: controller.signal,
        });

        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          code?: string;
          fields?: Record<string, string>;
        };

        if (res.ok && data.ok) {
          requestIdRef.current = makeRequestId();
          setStatus('success');
          return true;
        }

        setStatus('error');
        if (res.status === 400 && data.fields) {
          setFieldErrors(data.fields);
        } else if (res.status === 429) {
          setFormError(t.form.rateLimited);
        } else if (res.status === 503) {
          setFormError(t.form.unavailable);
        } else {
          setFormError(t.form.network);
        }
        return false;
      } catch {
        setStatus('error');
        setFormError(t.form.network);
        return false;
      } finally {
        window.clearTimeout(timeoutId);
        inFlightRef.current = false;
      }
    },
    [endpoint, t],
  );

  return {
    status,
    formError,
    fieldErrors,
    setFieldErrors,
    submit,
    resetForAnother,
  };
}
