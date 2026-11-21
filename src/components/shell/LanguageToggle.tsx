import { useLocale } from '@/i18n/LocaleProvider';
import { cn } from '@/lib/cn';

interface LanguageToggleProps {
  readonly variant?: 'default' | 'compact' | 'full';
}

const LANGUAGES = [
  { code: 'en' as const, short: 'EN', label: 'English' },
  { code: 'mn' as const, short: 'MN', label: 'Монгол' },
];

export function LanguageToggle({ variant = 'default' }: LanguageToggleProps) {
  const { locale, t, setLocale } = useLocale();

  return (
    <div
      role="group"
      aria-label={t.a11y.language}
      className={cn(
        'inline-flex items-center rounded-full border border-border bg-hero-bg/90 p-0.5',
        variant === 'full' && 'w-full',
        variant === 'compact' && 'border-white/20 bg-black',
      )}
    >
      {LANGUAGES.map((item) => {
        const active = locale === item.code;
        return (
          <button
            key={item.code}
            type="button"
            lang={item.code}
            aria-pressed={active}
            aria-label={item.label}
            onClick={() => setLocale(item.code)}
            className={cn(
              'relative inline-flex h-8 items-center justify-center rounded-full px-3 text-xs font-semibold tracking-widest transition-colors cursor-pointer whitespace-nowrap after:absolute after:inset-y-[-6px] after:inset-x-0 after:content-[""]',
              variant === 'full' && 'flex-1 h-10 after:inset-y-0',
              variant === 'compact' && 'h-7 px-2.5 text-[11px] after:inset-y-[-8px]',
              active
                ? 'bg-nav-button text-foreground shadow-[inset_0_-2px_0_0_hsl(var(--primary))]'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {variant === 'full' ? item.label : item.short}
          </button>
        );
      })}
    </div>
  );
}
