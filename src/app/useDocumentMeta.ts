import { useEffect } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';

interface MetaOptions {
  readonly title: string;
  readonly description: string;
  readonly noindex?: boolean;
}

export function useDocumentMeta({ title, description, noindex = false }: MetaOptions): void {
  const { locale } = useLocale();

  useEffect(() => {
    document.title = title;
    document.documentElement.lang = locale;

    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.setAttribute('name', 'description');
      document.head.appendChild(descTag);
    }
    descTag.setAttribute('content', description);

    let robotsTag: Element | null = null;
    if (noindex) {
      robotsTag = document.querySelector('meta[name="robots"]');
      if (!robotsTag) {
        robotsTag = document.createElement('meta');
        robotsTag.setAttribute('name', 'robots');
        document.head.appendChild(robotsTag);
      }
      robotsTag.setAttribute('content', 'noindex');
    }

    return () => {
      if (noindex && robotsTag && robotsTag.parentNode) {
        robotsTag.parentNode.removeChild(robotsTag);
      }
    };
  }, [title, description, noindex, locale]);
}
