import { Link } from 'react-router-dom';
import { brand } from '@/content/brand';
import { format } from '@/i18n/format';
import { useLocale } from '@/i18n/LocaleProvider';
import { cn } from '@/lib/cn';
import { LanguageToggle } from './LanguageToggle';

export function SiteFooter() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  const socialLinks = [
    { label: 'LinkedIn', href: brand.social.linkedin },
    { label: 'Facebook', href: brand.social.facebook },
    { label: 'Instagram', href: brand.social.instagram },
  ].filter((item) => item.href !== '');

  return (
    <footer className="site-footer">
      <div className="footer-dots" aria-hidden="true">
        <div className="footer-dots__line" />
      </div>

      <div className="site-footer__inner">
        <div className={cn('site-footer__top', socialLinks.length === 0 && 'site-footer__top--two')}>
          <div className="site-footer__lead">
            <h2 className="site-footer__headline mn-heading-track">{t.footer.headline}</h2>
            <address className="site-footer__contact">
              <span>{t.footer.address}</span>
              <a href={brand.phoneHref}>{brand.phoneDisplay}</a>
              {brand.email ? <a href={`mailto:${brand.email}`}>{brand.email}</a> : null}
              <span>{t.footer.hours}</span>
            </address>
          </div>

          <nav className="site-footer__nav" aria-label={t.footer.explore}>
            <Link to="/services">{t.footer.links.services}</Link>
            <Link to="/products">{t.footer.links.products}</Link>
            <Link to="/projects">{t.footer.links.projects}</Link>
            <Link to="/about">{t.footer.links.about}</Link>
            <Link to="/team">{t.footer.links.team}</Link>
          </nav>

          <nav className="site-footer__nav" aria-label={t.footer.company}>
            <Link to="/contact">{t.footer.links.contact}</Link>
            <Link to="/quote">{t.footer.links.quote}</Link>
            <Link to="/contact?topic=careers">{t.footer.links.careers}</Link>
            <Link to="/contact?topic=press">{t.footer.links.press}</Link>
          </nav>

          {socialLinks.length > 0 ? (
            <nav className="site-footer__nav" aria-label={t.footer.social}>
              {socialLinks.map((item) => (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
                  {item.label}
                  <span className="sr-only"> {t.a11y.opensNewTab}</span>
                </a>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="site-footer__brand-row">
          <Link to="/" className="site-footer__brand" aria-label="SENTINEL AI, home">
            <span className="site-footer__mark" aria-hidden="true" />
            <span className="site-footer__wordmark">
              SENTINEL <span className="text-primary">AI</span>
            </span>
          </Link>
        </div>

        <div className="site-footer__legal">
          <p>{format(t.footer.rights, { year })}</p>
          <Link to="/legal/privacy">{t.footer.privacy}</Link>
          <Link to="/legal/terms">{t.footer.terms}</Link>
          <Link to="/legal/cookies">{t.footer.cookies}</Link>
          <LanguageToggle variant="compact" />
        </div>
      </div>
    </footer>
  );
}
