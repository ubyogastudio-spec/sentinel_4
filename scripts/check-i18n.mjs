// Fails when the English and Mongolian message trees disagree, or when a Mongolian value was left untranslated.
import { en } from '../src/i18n/en.ts';
import { mn } from '../src/i18n/mn.ts';
import { pagesEn } from '../src/i18n/pages.en.ts';
import { pagesMn } from '../src/i18n/pages.mn.ts';

const flatten = (value, prefix = '', out = new Map()) => {
  if (typeof value === 'string') out.set(prefix, value);
  else if (Array.isArray(value)) value.forEach((item, i) => flatten(item, `${prefix}.${i}`, out));
  else for (const [key, item] of Object.entries(value)) flatten(item, prefix ? `${prefix}.${key}` : key, out);
  return out;
};

const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
const hasCyrillic = (text) => /[Ѐ-ӿ]/.test(text);
const letterless = (text) =>
  !/\p{L}/u.test(
    text
      .replace(/\{\w+\}/g, '')
      .replace(/SENTINEL AI/g, '')
      .replace(/\b[A-Z]{2}-\d\b/g, ''),
  );
const looksLikeAddress = (text) => /^(https?:\/\/\S+|[^\s@]+@[^\s@]+\.\S+)$/.test(text);

const pairs = [
  ['en', 'mn', flatten(en), flatten(mn)],
  ['pages.en', 'pages.mn', flatten(pagesEn), flatten(pagesMn)],
];

const problems = [];
for (const [enName, mnName, a, b] of pairs) {
  for (const key of a.keys()) if (!b.has(key)) problems.push(`${mnName}: missing key ${key}`);
  for (const key of b.keys()) if (!a.has(key)) problems.push(`${mnName}: extra key ${key}`);
  for (const [key, mnValue] of b) {
    const enValue = a.get(key);
    if (enValue === undefined) continue;
    if (mnValue === '' || enValue === '') problems.push(`${key}: empty value`);
    if (!hasCyrillic(mnValue) && !letterless(mnValue) && !looksLikeAddress(mnValue)) problems.push(`${mnName}: ${key} has no Cyrillic`);
    if (placeholders(enValue) !== placeholders(mnValue)) problems.push(`${key}: placeholders differ`);
    if (mnValue.length > 60 && mnValue.length > enValue.length * 2.2) problems.push(`${mnName}: ${key} is more than 2.2x the English length`);
  }
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('i18n ok');
