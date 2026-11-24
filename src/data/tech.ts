import bigcommerceIcon from '@/assets/icons/tech/bigcommerce-logo.svg';
import nextjsIcon from '@/assets/icons/tech/nextjs.svg';
import pythonIcon from '@/assets/icons/tech/python.svg';
import reactIcon from '@/assets/icons/tech/react.svg';
import tailwindIcon from '@/assets/icons/tech/tailwind.svg';
import type { TechItem } from '@/types';

/**
 * Icons for project `stack` entries, keyed by the name exactly as written in
 * the project frontmatter. A name without an icon here renders as text.
 */
const TECH_ICONS: Readonly<Record<string, ImageMetadata>> = {
  BigCommerce: bigcommerceIcon,
  'Next.js': nextjsIcon,
  Python: pythonIcon,
  React: reactIcon,
  'Tailwind CSS': tailwindIcon,
};

/** A project stack as tech items: each with its icon when one exists. */
export function stackItems(stack: readonly string[]): TechItem[] {
  return stack.map((name) => {
    const icon = TECH_ICONS[name];
    return icon ? { name, icon } : { name };
  });
}
