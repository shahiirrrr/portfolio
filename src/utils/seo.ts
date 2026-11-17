import { SEO_DEFAULTS } from '@/config/seo';
import { SITE, SOCIAL_LINKS } from '@/config/site';
import type { JsonLdSchema, ResolvedSeo, SeoProps } from '@/types';

import { absoluteUrl } from './helpers.ts';

const PERSON_ID = absoluteUrl('/#person');
const WEBSITE_ID = absoluteUrl('/#website');

/** Merge page-level SEO overrides with site defaults into render-ready metadata. */
export function resolveSeo(seo: SeoProps, pathname: string): ResolvedSeo {
  const image = seo.image ?? SEO_DEFAULTS.image;

  return {
    title: seo.title
      ? `${seo.title}${SEO_DEFAULTS.titleSeparator}${SITE.name}`
      : SEO_DEFAULTS.homeTitle,
    description: seo.description ?? SEO_DEFAULTS.description,
    canonical: absoluteUrl(seo.canonicalPath ?? pathname),
    image: { src: absoluteUrl(image.src), alt: image.alt },
    type: seo.type ?? 'website',
    robots: seo.noindex ? SEO_DEFAULTS.robotsNoindex : SEO_DEFAULTS.robotsIndex,
  };
}

/** Serialize JSON-LD for inline embedding (escapes `<` so content can't close the script tag). */
export function serializeJsonLd(schema: JsonLdSchema): string {
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}

/** The site owner. Referenced by `@id` from the other schemas. */
export function personSchema(): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: SITE.name,
    jobTitle: SITE.jobTitle,
    url: absoluteUrl('/'),
    email: `mailto:${SITE.email}`,
    telephone: SITE.phone.href.replace('tel:', ''),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Wayanad',
      addressRegion: 'Kerala',
      addressCountry: 'IN',
    },
    // Only real profile URLs belong in sameAs: placeholders (bare domains) are skipped.
    sameAs: SOCIAL_LINKS.map((link) => link.href).filter((href) => new URL(href).pathname !== '/'),
  };
}

export function websiteSchema(): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE.name,
    description: SITE.description,
    url: absoluteUrl('/'),
    inLanguage: SITE.locale,
    publisher: { '@id': PERSON_ID },
  };
}

/** For the About page: a profile page whose main entity is the site owner. */
export function profilePageSchema(pathname: string): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: absoluteUrl(pathname),
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: { '@id': PERSON_ID },
  };
}

interface ProjectSchemaInput {
  pathname: string;
  title: string;
  description: string;
  year?: number | undefined;
  stack: string[];
  imageSrc?: string | undefined;
}

/** For a project case study. Only includes fields backed by real content. */
export function projectSchema(project: ProjectSchemaInput): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    url: absoluteUrl(project.pathname),
    ...(project.year && { dateCreated: String(project.year) }),
    keywords: project.stack.join(', '),
    ...(project.imageSrc && { image: absoluteUrl(project.imageSrc) }),
    inLanguage: SITE.locale,
    author: { '@id': PERSON_ID },
    isPartOf: { '@id': WEBSITE_ID },
  };
}
