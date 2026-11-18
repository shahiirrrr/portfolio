import type { SocialLink } from '../types/index.ts';

/**
 * Single source of truth for site identity. Values come from the Figma design
 * and its dev notes unless marked PLACEHOLDER.
 *
 * Imported by `astro.config.ts`, so this file must use relative imports only
 * (no `@/` alias) and must not import from `astro:*` modules.
 */
interface SiteConfig {
  url: string;
  name: string;
  jobTitle: string;
  description: string;
  location: string;
  availability: string;
  locale: string;
  ogLocale: string;
  email: string;
  phone: { label: string; href: string };
  twitterHandle: string;
  cvPath: string;
  contactEndpoint: string;
}

export const SITE: SiteConfig = {
  /** Production origin, no trailing slash. */
  url: 'https://shahir.in',
  name: 'Shahir',
  jobTitle: 'Frontend Engineer',
  description:
    'Shahir is a frontend developer from Wayanad, Kerala, building headless storefronts, React architectures and design systems that stay maintainable as they scale.',
  location: 'Wayanad, Kerala',
  availability: 'Open to remote & full-time roles',
  locale: 'en',
  ogLocale: 'en_US',
  email: 'shahirp.official@gmail.com',
  phone: { label: '+91 88918 73321', href: 'tel:+918891873321' },
  /** No X/Twitter account in the design — leave empty to omit the meta tag. */
  twitterHandle: '',
  /** The PDF itself must be added to /public (not supplied with the design). */
  cvPath: '/Shahir-CV.pdf',
  /**
   * PLACEHOLDER — form backend URL (e.g. https://formspree.io/f/xxxxxxxx).
   * The site is static, so the contact form posts to an external endpoint.
   * While empty, the form falls back to opening the visitor's mail client.
   */
  contactEndpoint: '',
};

/** Order matches the design. Profiles supplied by the owner. */
export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/shahiirrrr' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shahiirrrr/' },
  { label: 'Instagram', href: 'https://www.instagram.com/shahiirrrr' },
  { label: 'WhatsApp', href: 'https://wa.me/918891873321' },
];
