/**
 * Contact FAQ accordion (Figma dev note "ACCORDION — FAQ"): one item open at
 * a time, the first open by default, height animates in 0.35s. The markup
 * ships with every answer open so it reads fine without JS; this collapses
 * all but the first. Reduced motion: toggles instantly.
 */
import { gsap, MOTION_REDUCED } from './core.ts';

interface FaqEntry {
  btn: HTMLButtonElement;
  panel: HTMLElement;
}

export function initContactFaq(root: HTMLElement): () => void {
  const items: FaqEntry[] = [];
  root.querySelectorAll<HTMLElement>('[data-faq-item]').forEach((item) => {
    const btn = item.querySelector<HTMLButtonElement>('[data-faq-button]');
    const panel = item.querySelector<HTMLElement>('[data-faq-panel]');
    if (btn && panel) items.push({ btn, panel });
  });

  const reduced = window.matchMedia(MOTION_REDUCED);

  function toggle({ btn, panel }: FaqEntry, open: boolean, instant = false): void {
    if ((btn.getAttribute('aria-expanded') === 'true') === open && !instant) return;
    btn.setAttribute('aria-expanded', String(open));
    // Collapsed answers are hidden from assistive tech and the tab order.
    if (open) panel.style.visibility = '';
    gsap.to(panel, {
      height: open ? 'auto' : 0,
      duration: instant || reduced.matches ? 0 : 0.35,
      ease: 'power2.inOut',
      overwrite: true,
      onComplete: () => {
        if (!open) panel.style.visibility = 'hidden';
      },
    });
  }

  items.forEach((item, i) => toggle(item, i === 0, true));

  const handlers = items.map((item) => {
    const onClick = (): void => {
      const open = item.btn.getAttribute('aria-expanded') !== 'true';
      items.forEach((other) => toggle(other, other === item && open));
    };
    item.btn.addEventListener('click', onClick);
    return onClick;
  });

  return () => {
    items.forEach(({ btn, panel }, i) => {
      const handler = handlers[i];
      if (handler) btn.removeEventListener('click', handler);
      gsap.killTweensOf(panel);
    });
  };
}
