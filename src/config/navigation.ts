import type { NavItem } from '@/types';

/** Primary navigation, in design order. Rendered by the header, mobile menu and footer. */
export const MAIN_NAV: NavItem[] = [
  { label: 'Work', href: '/work/' },
  { label: 'About', href: '/about/' },
  { label: 'Stack', href: '/about/#stack' },
  { label: 'Contact', href: '/contact/' },
];
