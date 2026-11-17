import astroIcon from '@/assets/icons/tech/astro.svg';
import css3Icon from '@/assets/icons/tech/css3.svg';
import framerMotionIcon from '@/assets/icons/tech/framer-motion.svg';
import gsapIcon from '@/assets/icons/tech/gsap.svg';
import html5Icon from '@/assets/icons/tech/html5.svg';
import nextjsIcon from '@/assets/icons/tech/nextjs.svg';
import nodejsIcon from '@/assets/icons/tech/nodejs.svg';
import reactIcon from '@/assets/icons/tech/react.svg';
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
  { name: 'Node.js', icon: nodejsIcon },
  { name: 'Framer Motion', icon: framerMotionIcon },
  { name: 'Three.js', icon: threejsIcon },
];

/**
 * The five process steps. Only step 01 has body copy in the Figma frames (the
 * other variants live on a component page the design tools could not read) —
 * add `body` / `bodyShort` to steps 02–05 when the copy is available.
 */
export const PROCESS_STEPS: ProcessStep[] = [
  {
    title: 'Plan',
    body: 'Goals, constraints and success metrics agreed before a line of code — scope that survives contact with reality.',
    bodyShort: 'Goals, constraints and success metrics agreed before a line of code.',
  },
  { title: 'Architect', body: '' },
  { title: 'Build', body: '' },
  { title: 'Animate', body: '' },
  { title: 'Ship', body: '' },
];

export const CAPABILITIES: PanelItem[] = [
  {
    title: 'Headless commerce',
    body: 'Composable storefronts with React, Storefront APIs and micro frontends that scale.',
  },
  {
    title: 'Experience ops',
    body: 'Agile rhythms with product owners, QA and designers — shipping velocity tied to business goals.',
  },
  {
    title: 'Performance first',
    body: 'Accessibility, Core Web Vitals and pixel-crisp UI systems as the default, not an afterthought.',
  },
];

export const HOME_STATS: StatItem[] = [
  { value: '2+', label: 'Years shipping code', labelShort: 'Years shipping' },
  { value: '03', label: 'Headless stores built', labelShort: 'Headless stores' },
  { value: '04', label: 'Teams worked with' },
  { value: '03', label: 'Certifications earned', labelShort: 'Certifications' },
];
