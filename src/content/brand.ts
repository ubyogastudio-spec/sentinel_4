import { hasUrl, isEmail } from '@/lib/url';

const env = import.meta.env;

export const brand = {
  name: 'SENTINEL AI',
  phoneDisplay: '9007 0740',
  phoneHref: 'tel:+97690070740',
  email: isEmail(env.VITE_CONTACT_EMAIL) ? env.VITE_CONTACT_EMAIL.trim() : '',
  social: {
    linkedin: hasUrl(env.VITE_SOCIAL_LINKEDIN) ? env.VITE_SOCIAL_LINKEDIN.trim() : '',
    facebook: hasUrl(env.VITE_SOCIAL_FACEBOOK) ? env.VITE_SOCIAL_FACEBOOK.trim() : '',
    instagram: hasUrl(env.VITE_SOCIAL_INSTAGRAM) ? env.VITE_SOCIAL_INSTAGRAM.trim() : '',
  },
} as const;
