import bigcommerceIcon from '@/assets/icons/tech/bigcommerce.svg';
import css3Icon from '@/assets/icons/tech/css3.svg';
import djangoIcon from '@/assets/icons/tech/django.svg';
import framerMotionIcon from '@/assets/icons/tech/framer-motion.svg';
import gsapIcon from '@/assets/icons/tech/gsap.svg';
import html5Icon from '@/assets/icons/tech/html5.svg';
import nextjsIcon from '@/assets/icons/tech/nextjs.svg';
import nodejsIcon from '@/assets/icons/tech/nodejs.svg';
import pythonIcon from '@/assets/icons/tech/python.svg';
import reactIcon from '@/assets/icons/tech/react.svg';
import tailwindIcon from '@/assets/icons/tech/tailwind.svg';
import viteIcon from '@/assets/icons/tech/vite.svg';
import cloudSecurityImage from '@/assets/images/about/learning-cloud-cyber-security.png';
import computerScienceImage from '@/assets/images/about/learning-computer-science.png';
import pythonFullStackImage from '@/assets/images/about/learning-python-full-stack.png';
import type { PanelItem, TechItem } from '@/types';

/** Copy of the About hero (Figma: 01 Hero). */
export const ABOUT_HERO = {
  eyebrow: "Hey, I'm Shahir —",
  title: 'I build the web the way it should feel.',
  intro:
    "I'm a detail-oriented developer specialising in headless commerce and crafted user journeys. I balance craft and velocity — modern React architectures, API integrations and design systems that stay maintainable.",
  primaryCta: { label: 'Work with me', href: '/contact/' },
  cvCta: { label: 'Download CV' },
} as const;

export interface StackDiscipline {
  title: string;
  tools: TechItem[];
}

/** The stack index table (Figma: 03 Stack — Swiss Grid), in design order. */
export const STACK_INTRO = 'Tools I reach for first — and know deeply.';

export const STACK: StackDiscipline[] = [
  {
    title: 'Frameworks',
    tools: [
      { name: 'React', icon: reactIcon },
      { name: 'Next.js', icon: nextjsIcon },
      { name: 'Vite', icon: viteIcon },
    ],
  },
  {
    title: 'Languages',
    tools: [
      { name: 'Python', icon: pythonIcon },
      { name: 'JavaScript', tile: { text: 'JS', background: '#f7df1e', color: '#0b0b0b' } },
      { name: 'HTML5', icon: html5Icon },
      { name: 'CSS3', icon: css3Icon },
    ],
  },
  {
    title: 'Styling & Motion',
    tools: [
      { name: 'Tailwind CSS', icon: tailwindIcon },
      { name: 'GSAP', icon: gsapIcon },
      { name: 'Framer Motion', icon: framerMotionIcon },
    ],
  },
  {
    title: 'Commerce & Backend',
    tools: [
      { name: 'BigCommerce', icon: bigcommerceIcon },
      { name: 'Node.js', icon: nodejsIcon },
      { name: 'Django', icon: djangoIcon },
    ],
  },
];

/** Figma: 04 Principles. */
export const PRINCIPLES: PanelItem[] = [
  {
    title: 'Performance is a feature',
    body: 'Every kilobyte is a choice. I budget JavaScript like money and measure on real, slow devices.',
  },
  {
    title: 'Accessible by default',
    body: 'Semantic HTML first, keyboard paths always, motion that respects prefers-reduced-motion.',
  },
  {
    title: 'Motion with meaning',
    body: "Animation should explain what changed — never just decorate. 60fps or it doesn't ship.",
  },
];

export interface LearningItem {
  title: string;
  meta: string;
  image: ImageMetadata;
}

/** Figma: 05 Off the clock ("Always learning"). */
export const LEARNING_INTRO = 'Programs that keep the toolkit sharp.';

export const LEARNING: LearningItem[] = [
  {
    title: 'B.Sc. Computer Science',
    meta: 'University of Calicut · 2021 — 2023',
    image: computerScienceImage,
  },
  {
    title: 'Python Full Stack',
    meta: 'Synnefo Solutions · Dec 2023',
    image: pythonFullStackImage,
  },
  {
    title: 'Cloud & Cyber Security',
    meta: 'Jetking workshop · Jul 2023',
    image: cloudSecurityImage,
  },
];
