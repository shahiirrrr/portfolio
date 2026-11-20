import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

import { SITE } from './src/config/site.ts';

// Static output (Astro's default) deploys to Vercel with zero config, so no
// adapter is installed. Add @astrojs/vercel only if on-demand rendering is needed.
export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
  devToolbar: { enabled: false },
  // Self-hosted, subsetted fonts with generated metric-matched fallbacks.
  // The CSS variables are consumed by the --font-* tokens in variables.css.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Manrope',
      cssVariable: '--font-manrope',
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Antonio',
      cssVariable: '--font-antonio',
      weights: [700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Impact', 'sans-serif'],
    },
    {
      // Footer wordmark only.
      provider: fontProviders.fontsource(),
      name: 'Unbounded',
      cssVariable: '--font-unbounded',
      weights: [800],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],
});
