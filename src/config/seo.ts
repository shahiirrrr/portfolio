import type { SeoImage } from '@/types';

import { SITE } from './site.ts';

/** Site-wide SEO defaults. Pages override these through the `seo` layout prop. */
export const SEO_DEFAULTS = {
  /** Used verbatim as the homepage <title>. */
  homeTitle: `${SITE.name} — ${SITE.jobTitle}, React & Next.js`,
  /** Appended to every other page title: `About — Shahir`. */
  titleSeparator: ' — ',
  description: SITE.description,
  /** 1200×630 social preview. PLACEHOLDER image — replace before launch. */
  image: {
    src: '/images/og-default.png',
    alt: `${SITE.name} — ${SITE.jobTitle}`,
  } satisfies SeoImage,
  robotsIndex: 'index, follow, max-image-preview:large',
  robotsNoindex: 'noindex, nofollow',
} as const;
