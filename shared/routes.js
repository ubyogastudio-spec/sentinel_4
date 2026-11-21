import { LEGAL_SLUGS, PRODUCT_SLUGS } from './constants.js';

export const STATIC_ROUTES = ['/', '/services', '/products', '/projects', '/about', '/team', '/contact', '/quote'];

/** True when the client router has a real page for this path. The server uses it to choose 200 or 404. */
export function isKnownRoute(pathname) {
  const lower = pathname.toLowerCase();
  const path = lower.length > 1 ? lower.replace(/\/+$/, '') : lower;
  if (STATIC_ROUTES.includes(path)) return true;
  const [, section, slug, ...rest] = path.split('/');
  if (!slug || rest.length > 0) return false;
  if (section === 'products') return PRODUCT_SLUGS.includes(slug);
  if (section === 'legal') return LEGAL_SLUGS.includes(slug);
  return false;
}
