import { useLocale } from '@/i18n/LocaleProvider';

export function SkipLink() {
  const { t } = useLocale();
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-70 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-full focus:bg-primary focus:px-5 focus:py-2 focus:text-sm focus:font-bold focus:text-primary-foreground focus:shadow-lg"
    >
      {t.a11y.skip}
    </a>
  );
}
