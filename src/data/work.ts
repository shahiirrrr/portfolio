import currencyConverter from '@/assets/images/work/currency-converter.png';
import loveConfessionGame from '@/assets/images/work/love-confession-game.png';
import portfolioV1 from '@/assets/images/work/portfolio-v1.png';

/** Work-page copy from the Figma frame "Final / Work". */
export const WORK_INTRO =
  'Client builds, product work and side projects from the last two years — from headless storefronts to computer vision.';

/**
 * Filter chips, in design order. A project matches a chip when one of its
 * `stack` entries starts with the chip label. `all` is the default.
 */
export const WORK_FILTERS = [
  'React',
  'BigCommerce',
  'Python',
  'Headless',
  'Tailwind',
  'Computer Vision',
] as const;

export interface Experiment {
  name: string;
  stack: string;
  image: ImageMetadata;
  alt: string;
  /** GitHub repository, opened in a new tab. */
  href: string;
}

/**
 * Playground experiments. PLACEHOLDER — the repository URLs are not in the
 * design; replace each `href` with the real GitHub repo.
 */
export const EXPERIMENTS: Experiment[] = [
  {
    name: 'Love Confession Game',
    stack: 'Python · Interactive',
    image: loveConfessionGame,
    alt: 'Phone on a wooden desk showing a heart-themed game screen',
    href: 'https://github.com/', // PLACEHOLDER
  },
  {
    name: 'Currency Converter',
    stack: 'Python · Requests · CLI',
    image: currencyConverter,
    alt: 'Laptop with a terminal open beside coins and banknotes in several currencies',
    href: 'https://github.com/', // PLACEHOLDER
  },
  {
    name: 'Portfolio v1',
    stack: 'React · Vercel',
    image: portfolioV1,
    alt: 'Laptop on a white desk showing an earlier portfolio website',
    href: 'https://github.com/', // PLACEHOLDER
  },
];

/** "Computer Vision" → "computer-vision" (the `?tag=` value). */
export function tagSlug(label: string): string {
  return label.toLowerCase().replace(/\s+/g, '-');
}
