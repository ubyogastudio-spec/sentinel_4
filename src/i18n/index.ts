import { en, type Messages } from './en';
import { mn } from './mn';
import { pagesEn, type PagesMessages } from './pages.en';
import { pagesMn } from './pages.mn';

export type Locale = 'mn' | 'en';

export const messages: Record<Locale, Messages> = { mn, en };
export const pageMessages: Record<Locale, PagesMessages> = { mn: pagesMn, en: pagesEn };
export type { Messages, PagesMessages };
