# Content Placeholders to Replace Before Launch

The following items are fictional placeholders written in the tone of SENTINEL AI. Replace them before launch:

| Placeholder | File(s) |
|---|---|
| Team member names, roles, and bios (4 people) | `src/i18n/pages.en.ts`, `src/i18n/pages.mn.ts` (`team.members`) |
| Case studies (6 projects, figures, and results) | `src/i18n/pages.en.ts`, `src/i18n/pages.mn.ts` (`projects.items`) |
| Company stats on `/about` (4 numbers) | `src/i18n/pages.en.ts`, `src/i18n/pages.mn.ts` (`about.stats`) and `hero.trust` |
| Product specifications and descriptions | `src/i18n/pages.en.ts`, `src/i18n/pages.mn.ts` (`products.items`), `src/content/products.ts` |
| Opening hours | `src/i18n/en.ts`, `src/i18n/mn.ts` (`footer.hours`) |
| Legal texts (Privacy, Terms, Cookies) — **requires a lawyer's review** | `src/i18n/pages.en.ts`, `src/i18n/pages.mn.ts` (`legal`) |
| Optional contact e-mail and social links | Environment variables `VITE_CONTACT_EMAIL`, `VITE_SOCIAL_LINKEDIN`, `VITE_SOCIAL_FACEBOOK`, `VITE_SOCIAL_INSTAGRAM` |

Fixed real contact details (do not remove):
- Address: `Улаанбаатар хот, Хан-Уул дүүрэг` / `Khan-Uul District, Ulaanbaatar`
- Phone: `9007 0740` (`tel:+97690070740`)
