import { useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { brand } from '@/content/brand';
import { useLocale } from '@/i18n/LocaleProvider';
import { cn } from '@/lib/cn';
import { LanguageToggle } from './LanguageToggle';

interface MobileMenuProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const { pathname } = useLocation();
  const { t } = useLocale();

  useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  const links = [
    { to: '/services', label: t.nav.services },
    { to: '/products', label: t.nav.products },
    { to: '/projects', label: t.nav.projects },
    { to: '/about', label: t.nav.about },
    { to: '/team', label: t.nav.team },
    { to: '/contact', label: t.nav.contact },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent id="mobile-menu" className="overflow-y-auto">
        <SheetTitle className="sr-only">{t.a11y.menuTitle}</SheetTitle>
        <SheetDescription className="sr-only">{t.a11y.menuDescription}</SheetDescription>

        <div className="flex items-center justify-between pb-4 border-b border-border">
          <span className="text-foreground text-xl font-semibold tracking-tight">SENTINEL</span>
          <Button
            type="button"
            variant="navCta"
            size="icon"
            className="rounded-lg bg-nav-button"
            aria-label={t.a11y.closeMenu}
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        <nav aria-label={t.a11y.mobileNav} className="mt-4 flex flex-col">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => onOpenChange(false)}
              className={({ isActive }) =>
                cn(
                  'py-3 text-2xl font-light border-b border-border transition-colors whitespace-normal',
                  isActive ? 'text-primary font-normal' : 'text-foreground hover:text-primary',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 flex flex-col gap-5">
          <Button asChild variant="primary" size="lg" className="w-full rounded-sm">
            <Link to="/quote" onClick={() => onOpenChange(false)}>
              {t.nav.getQuote}
            </Link>
          </Button>

          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest mn-label-track text-muted-foreground">
              {t.a11y.language}
            </span>
            <LanguageToggle variant="full" />
          </div>

          <a
            href={brand.phoneHref}
            className="inline-flex min-h-11 items-center text-base font-medium text-foreground hover:text-primary transition-colors"
          >
            {brand.phoneDisplay}
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
