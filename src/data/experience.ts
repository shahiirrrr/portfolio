import type { ExperienceItem } from '@/types';

import neopraxisImage from '@/assets/images/experience/neopraxis.png';
import noviindusImage from '@/assets/images/experience/noviindus.png';
import synnefoImage from '@/assets/images/experience/synnefo.png';

/** Professional experience, newest first. Used by the Home cards and the About timeline. */
export const EXPERIENCE: ExperienceItem[] = [
  {
    company: 'Noviindus Technologies',
    shortName: 'Noviindus',
    role: 'Frontend Developer',
    location: 'Kozhikode',
    period: 'DEC 2025 — NOW',
    periodShort: 'DEC 2025 — NOW',
    summary:
      'Building modern web apps with Next.js and Tailwind CSS — performant, scalable frontends for client projects.',
    image: noviindusImage,
  },
  {
    company: 'Neopraxis Innovations',
    shortName: 'Neopraxis',
    role: 'Software Developer',
    location: 'Wayanad',
    period: 'MAR 2024 — OCT 2025',
    periodShort: '2024 — 2025',
    summary:
      'Delivered the BigCommerce B2B storefront for Nextbase on a headless React architecture, fixed micro-frontend integration issues and wired PHF into RS Connect, Fetchify and DVLC.',
    summaryShort:
      'Delivered the BigCommerce B2B storefront for Nextbase on a headless React architecture, fixed micro-frontend issues and wired PHF into RS Connect, Fetchify and DVLC.',
    image: neopraxisImage,
  },
  {
    company: 'Synnefo Solutions',
    shortName: 'Synnefo',
    role: 'Python / Django Intern',
    location: 'Kochi',
    period: 'AUG 2023 — JAN 2024',
    periodShort: '2023 — 2024',
    summary:
      'Contributed to eCommerce web apps with Python, Django and REST APIs; worked with MySQL and tightened debugging and testing.',
    image: synnefoImage,
  },
  {
    company: 'Regional Technologies',
    shortName: 'Regional',
    role: 'Trainee',
    location: 'Kozhikode',
    period: 'DEC 2022 — JAN 2023',
    periodShort: '2022 — 2023',
    summary: 'Built a posture-recognition yoga coaching system with Android and web interfaces.',
  },
];
