import { SITE } from '@/config/site';

/** Resolve a root-relative path (or pass through an absolute URL) against the site origin. */
export function absoluteUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, SITE.url).href;
}

/** True when `href` is the current page or, for non-root links, an ancestor of it. Hash links never match. */
export function isActivePath(href: string, pathname: string): boolean {
  if (href.includes('#')) return false;
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

/** Zero-padded two-digit index: 1 → "01". */
export function padIndex(value: number): string {
  return String(value).padStart(2, '0');
}

/** True for links that leave the site (rendered with target="_blank" rel="noopener"). */
export function isExternalUrl(href: string): boolean {
  return /^https?:\/\//.test(href);
}
