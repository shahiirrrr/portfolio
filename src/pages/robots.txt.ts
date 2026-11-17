import type { APIRoute } from 'astro';

import { absoluteUrl } from '@/utils/helpers';

// Generated at build time (instead of a static public/robots.txt) so the
// sitemap URL always follows `SITE.url`.
export const GET: APIRoute = () => {
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${absoluteUrl('/sitemap-index.xml')}`];

  return new Response(`${body.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
