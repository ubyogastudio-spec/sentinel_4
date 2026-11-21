import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/i18n/LocaleProvider';
import { cn } from '@/lib/cn';
import { LanguageToggle } from './LanguageToggle';
import { MobileMenu } from './MobileMenu';

export function Navbar() {
  const { t } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { to: '/services', label: t.nav.services },
    { to: '/products', label: t.nav.products },
    { to: '/projects', label: t.nav.projects },
    { to: '/about', label: t.nav.about },
    { to: '/team', label: t.nav.team },
    { to: '/contact', label: t.nav.contact },
  ];

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-6 px-8 lg:px-16 py-5 transition-colors duration-200',
          scrolled
            ? 'bg-hero-bg/85 backdrop-blur-md border-b border-border/60'
            : 'bg-transparent before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:-z-10 before:h-[120px] before:bg-gradient-to-b before:from-black/60 before:to-transparent',
        )}
      >
        <Link
          to="/"
          aria-label="SENTINEL AI, home"
          className="inline-flex min-h-11 items-center text-foreground text-xl font-semibold tracking-tight whitespace-nowrap shrink-0"
        >
          SENTINEL
        </Link>

        <nav aria-label={t.a11y.mainNav} className="hidden nav:flex items-center gap-6">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'inline-flex min-h-11 items-center whitespace-nowrap shrink-0 text-[13px] uppercase tracking-[0.1em] mn-label-track transition-colors',
                  isActive
                    ? 'text-foreground underline decoration-primary decoration-2 underline-offset-[10px]'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden nav:flex items-center gap-3 shrink-0">
          <LanguageToggle />
          <Button asChild variant="navCta" size="lg" className="rounded-lg px-6">
            <Link to="/quote">{t.nav.getQuote}</Link>
          </Button>
        </div>

        <div className="flex nav:hidden items-center gap-2 shrink-0">
          <LanguageToggle />
          <Button
            type="button"
            variant="navCta"
            size="icon"
            className="rounded-lg bg-nav-button"
            aria-label={t.a11y.openMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
