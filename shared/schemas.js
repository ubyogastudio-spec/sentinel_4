import { z } from 'zod';
import { CONTACT_TOPICS, LOCALES, PREFERRED_CONTACT, PRODUCT_SLUGS, SERVICES, SITE_TYPES } from './constants.js';

// Every message is a code. The client maps it to t.form.errors.<code>.
export const ERROR_CODES = ['required', 'tooLong', 'email', 'phone', 'invalid', 'consent'];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9][0-9 ()-]{5,38}$/;

const text = (max) => z.string().trim().min(1, 'required').max(max, 'tooLong');
const optionalText = (max) => z.string().trim().max(max, 'tooLong').default('');
const email = z.string().trim().toLowerCase().min(1, 'required').max(254, 'tooLong').regex(EMAIL_PATTERN, 'email');
const phone = z.string().trim().min(1, 'required').max(40, 'tooLong').regex(PHONE_PATTERN, 'phone');
const optionalPhone = z
  .string()
  .trim()
  .max(40, 'tooLong')
  .refine((value) => value === '' || PHONE_PATTERN.test(value), 'phone')
  .default('');

const common = {
  requestId: z.string().regex(/^[A-Za-z0-9-]{8,64}$/, 'invalid'),
  fullName: text(120),
  email,
  consent: z.boolean().refine((value) => value === true, 'consent'),
  locale: z.enum(LOCALES).default('mn'),
  website: z.string().max(200).default(''),
};

export const contactSchema = z.object({
  ...common,
  phone: optionalPhone,
  topic: z.enum(CONTACT_TOPICS),
  message: text(2000),
});

export const quoteSchema = z.object({
  ...common,
  company: optionalText(120),
  phone,
  service: z.enum(SERVICES),
  siteType: z.enum(SITE_TYPES),
  product: z.enum(['', ...PRODUCT_SLUGS]).default(''),
  preferredContact: z.enum(PREFERRED_CONTACT).default('phone'),
  details: text(2000),
});

/** Turns a zod error into `{ fieldName: code }` using only the codes above. `input` is the raw body. */
export function fieldCodes(error, input) {
  const fields = {};
  for (const issue of error.issues) {
    const name = String(issue.path[0] ?? 'form');
    if (name in fields) continue;
    if (ERROR_CODES.includes(issue.message)) fields[name] = issue.message;
    else fields[name] = input?.[name] === undefined ? 'required' : 'invalid';
  }
  return fields;
}
