import astroIcon from '@/assets/icons/tech/astro.svg';
import claudeIcon from '@/assets/icons/tech/claude.svg';
import figmaIcon from '@/assets/icons/tech/figma.svg';
import githubIcon from '@/assets/icons/tech/github.svg';
import lighthouseIcon from '@/assets/icons/tech/lighthouse.svg';
import viteIcon from '@/assets/icons/tech/vite.svg';
import zohoIcon from '@/assets/icons/tech/zoho.svg';
import bigcommerceIcon from '@/assets/icons/tech/bigcommerce-logo.svg';
import css3Icon from '@/assets/icons/tech/css3.svg';
import framerMotionIcon from '@/assets/icons/tech/framer-motion.svg';
import graphqlIcon from '@/assets/icons/tech/graphql.svg';
import gsapIcon from '@/assets/icons/tech/gsap.svg';
import handlebarsIcon from '@/assets/icons/tech/handlebars.svg';
import html5Icon from '@/assets/icons/tech/html5.svg';
import nextjsIcon from '@/assets/icons/tech/nextjs.svg';
import reactIcon from '@/assets/icons/tech/react.svg';
import sassIcon from '@/assets/icons/tech/sass.svg';
import shopifyIcon from '@/assets/icons/tech/shopify.svg';
import tailwindIcon from '@/assets/icons/tech/tailwind.svg';
import threejsIcon from '@/assets/icons/tech/threejs.svg';
import type { PanelItem, ProcessStep, StatItem, TechItem } from '@/types';

/** Logo marquee under the Home hero, in design order. */
export const MARQUEE_TECH: TechItem[] = [
  { name: 'React', icon: reactIcon },
  { name: 'Next.js', icon: nextjsIcon },
  { name: 'TypeScript', tile: { text: 'TS', background: '#3178c6', color: '#ffffff' } },
  { name: 'JavaScript', tile: { text: 'JS', background: '#f7df1e', color: '#0b0b0b' } },
  { name: 'Tailwind CSS', icon: tailwindIcon },
  { name: 'GSAP', icon: gsapIcon },
  { name: 'Astro', icon: astroIcon },
  { name: 'HTML5', icon: html5Icon },
  { name: 'CSS3', icon: css3Icon },
  { name: 'SCSS', icon: sassIcon },
  { name: 'Shopify', icon: shopifyIcon },
  { name: 'BigCommerce', icon: bigcommerceIcon },
  { name: 'Stencil', tile: { text: 'St', background: '#f5f5f5', color: '#0b0b0b' } },
  { name: 'Handlebars', icon: handlebarsIcon },
  { name: 'GraphQL', icon: graphqlIcon },
  { name: 'Framer Motion', icon: framerMotionIcon },
  { name: 'Three.js', icon: threejsIcon },
];

/**
 * The five process steps. Step 01 copy is from Figma; steps 02–05 were written
 * with the owner for a frontend workflow. `bodyShort` is the mobile variant.
 */
export const PROCESS_STEPS: ProcessStep[] = [
  {
    title: 'Plan',
    body: 'Goals, constraints and success metrics agreed before a line of code — scope that survives contact with reality.',
    bodyShort: 'Goals, constraints and success metrics agreed before a line of code.',
  },
  {
    title: 'Architect',
    body: 'Component APIs, data flow and rendering strategy mapped out — static, server or island, chosen per page rather than by habit.',
    bodyShort: 'Component APIs, data flow and rendering strategy mapped out first.',
  },
  {
    title: 'Build',
    body: 'Typed, accessible components on a shared token system — semantic HTML first, checked at every breakpoint and in every browser.',
    bodyShort: 'Typed, accessible components on a shared token system.',
  },
  {
    title: 'Animate',
    body: 'Motion that guides attention instead of competing for it — smooth on mid-range devices, calm when reduced motion is on.',
    bodyShort: 'Motion that guides attention, calm when reduced motion is on.',
  },
  {
    title: 'Ship',
    body: 'Core Web Vitals, accessibility audits and CI checks green before every deploy — then measured and refined in production.',
    bodyShort: 'Web Vitals, audits and CI checks green before every deploy.',
  },
];

export const CAPABILITIES: PanelItem[] = [
  {
    title: 'Agentic workflow',
    body: 'AI agents in the daily build loop — scoped tasks, automated reviews and CI checks on every change.',
    tools: [
      { name: 'Claude', icon: claudeIcon },
      { name: 'Figma MCP', icon: figmaIcon },
      { name: 'GitHub', icon: githubIcon },
      { name: 'Zoho', icon: zohoIcon },
    ],
  },
  {
    title: 'Micro frontends',
    body: 'Independent apps stitched into one seamless product — integration issues untangled, not papered over.',
    // PLACEHOLDER: tool picks to be confirmed by the owner.
    tools: [
      { name: 'React', icon: reactIcon },
      { name: 'Next.js', icon: nextjsIcon },
      { name: 'Vite', icon: viteIcon },
      { name: 'TypeScript', tile: { text: 'TS', background: '#3178c6', color: '#ffffff' } },
    ],
  },
  {
    title: 'Performance first',
    body: 'Accessibility, Core Web Vitals and pixel-crisp UI systems as the default, not an afterthought.',
    // PLACEHOLDER: tool picks to be confirmed by the owner.
    tools: [
      { name: 'Lighthouse', icon: lighthouseIcon },
      { name: 'Astro', icon: astroIcon },
      { name: 'HTML5', icon: html5Icon },
    ],
  },
];

export const HOME_STATS: StatItem[] = [
  { value: '3+', label: 'Years shipping code', labelShort: 'Years shipping' },
  { value: '20+', label: 'Projects collaborated on', labelShort: 'Projects' },
  { value: '04', label: 'Teams worked with' },
  { value: '03', label: 'Certifications earned', labelShort: 'Certifications' },
];
