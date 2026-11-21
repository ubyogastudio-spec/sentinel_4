import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

function isProductsPath(pathname: string): boolean {
  return pathname === '/products' || pathname.startsWith('/products/');
}

export function ScrollAndFocus(): null {
  const { pathname, hash } = useLocation();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const prevPath = prevPathRef.current;
    prevPathRef.current = pathname;

    if (prevPath === null) {
      if (hash) {
        const target = document.getElementById(hash.slice(1));
        if (target) target.scrollIntoView();
      }
      return;
    }

    if (prevPath === pathname) return;
    if (isProductsPath(prevPath) && isProductsPath(pathname)) return;

    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView();
      } else {
        window.scrollTo(0, 0);
      }
    } else {
      window.scrollTo(0, 0);
    }

    const main = document.getElementById('main');
    if (main) {
      main.focus({ preventScroll: true });
    }
  }, [pathname, hash]);

  return null;
}
