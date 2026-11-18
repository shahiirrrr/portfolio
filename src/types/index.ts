/** A single entry in the primary site navigation. */
export interface NavItem {
  label: string;
  /** Root-relative path with a trailing slash, e.g. `/projects/`. */
  href: string;
}

/** A social / external profile. Also feeds the `sameAs` array in JSON-LD. */
export interface SocialLink {
  label: string;
  href: string;
}

/** Page-level SEO overrides. Anything omitted falls back to `SEO_DEFAULTS`. */
export interface SeoProps {
  /** Page title without the site suffix. Omit on the homepage. */
  title?: string;
  description?: string;
  /** Root-relative or absolute URL of the social preview image. */
  image?: SeoImage;
  type?: 'website' | 'article' | 'profile';
  /** Exclude the page from search indexes (e.g. 404). */
  noindex?: boolean;
  /** Override the canonical path. Defaults to the current pathname. */
  canonicalPath?: string;
}

export interface SeoImage {
  src: string;
  alt: string;
}

/** Fully resolved metadata, ready to be rendered into `<head>`. */
export interface ResolvedSeo {
  title: string;
  description: string;
  canonical: string;
  image: SeoImage;
  type: NonNullable<SeoProps['type']>;
  robots: string;
}

/** A JSON-LD node. Built only by the helpers in `utils/seo.ts`. */
export type JsonLdSchema = Record<string, unknown>;

/** Props shared by every layout. */
export interface LayoutProps {
  seo?: SeoProps;
  jsonLd?: JsonLdSchema[];
}

export interface ExperienceItem {
  /** Full company name, e.g. "Noviindus Technologies". */
  company: string;
  /** Short name used on small cards, e.g. "Noviindus". */
  shortName: string;
  role: string;
  location: string;
  /** Long period label for the About timeline, e.g. "DEC 2025 — NOW". */
  period: string;
  /** Compact period label for the Home cards, e.g. "2024 — 2025". */
  periodShort: string;
  /** One or two sentences for the About timeline. */
  summary: string;
  /** Shorter wording used by the mobile timeline, when the design has one. */
  summaryShort?: string;
  /** Card artwork for the Home experience cards. Omit to leave the entry off Home. */
  image?: ImageMetadata;
  /** Company website; the Home card links to it in a new tab. */
  url?: string;
  /** Set to 'light' when the card artwork is light, so the arrow button turns dark. */
  cardTheme?: 'light';
}

/** A step of the Home "process" dial. */
export interface ProcessStep {
  title: string;
  /** Desktop copy. */
  body: string;
  /** Shorter copy used on mobile, when the design provides one. */
  bodyShort?: string;
}

/** A numbered folder panel (Home capabilities, About principles). */
export interface PanelItem {
  title: string;
  body: string;
}

export interface StatItem {
  /** Display value, e.g. "2+", "03", "B2B". Numeric values count up on scroll. */
  value: string;
  label: string;
  /** Shorter label used on mobile, when the design provides one. */
  labelShort?: string;
}

export interface TechItem {
  name: string;
  /** SVG logo; omit for the drawn "TS"/"JS" tiles. */
  icon?: ImageMetadata;
  /** Two-letter tile for technologies drawn as a coloured square in the design. */
  tile?: { text: string; background: string; color: string };
}
