import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { safeGetStorage, safeSetStorage } from '@/lib/storage';
import { messages, pageMessages, type Locale, type Messages, type PagesMessages } from './index';

const STORAGE_KEY = 'sentinel.lang';

function resolveInitialLocale(): Locale {
  if (typeof window !== 'undefined') {
    const query = new URLSearchParams(window.location.search).get('lang');
    if (query === 'en' || query === 'mn') return query;
    const saved = safeGetStorage(STORAGE_KEY);
    if (saved === 'en' || saved === 'mn') return saved;
  }
  return 'mn';
}

interface LocaleContextValue {
  readonly locale: Locale;
  readonly t: Messages;
  readonly pages: PagesMessages;
  readonly setLocale: (next: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(resolveInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.documentElement.lang = next;
    safeSetStorage(STORAGE_KEY, next);
  }, []);

  return (
    <LocaleContext.Provider
      value={{
        locale,
        t: messages[locale],
        pages: pageMessages[locale],
        setLocale,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used inside LocaleProvider');
  return ctx;
}
