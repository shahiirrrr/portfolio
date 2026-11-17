/**
 * Home process dial. The section pins while the user scrolls (~5 screens on
 * desktop, shorter on mobile); scroll progress rotates the dial one notch per
 * step, snaps to each step and swaps the active numeral / copy / index item.
 * Scrolling up reverses it. Reduced motion: no pin — the plain step list stays.
 */
import { gsap } from './core.ts';
import { refreshScroll, scrollToY, SMOOTH_SCROLL } from './smooth-scroll.ts';

interface DialOptions {
  /** ScrollTrigger end, e.g. "+=400%". */
  end: string;
  /** Rest angle of the dial at step 1; it scrubs to the mirror angle. */
  angle: number;
}

export function initProcessDial(root: HTMLElement): () => void {
  const dial = root.querySelector<HTMLElement>('[data-process-dial]');
  const groups = ['[data-process-step]', '[data-process-numeral]', '[data-process-notch]'].map(
    (selector) => Array.from(root.querySelectorAll<HTMLElement>(selector)),
  );
  const jumps = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-process-jump]'));
  const lastStep = (groups[0]?.length ?? 1) - 1;
  if (!dial || lastStep < 1) return () => {};

  let active = -1;
  const setActive = (index: number) => {
    if (index === active) return;
    active = index;
    groups.forEach((items) =>
      items.forEach((el, i) => el.classList.toggle('is-active', i === index)),
    );
    jumps.forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  };

  const buildDial = ({ end, angle }: DialOptions) => {
    root.classList.add('is-enhanced');
    setActive(0);

    // Lenis already smooths wheel input, so scrub directly and wait for its
    // glide tail before snapping. Native (touch) scrolling keeps the scrub lag.
    const lenis = window.matchMedia(SMOOTH_SCROLL).matches;
    const snap = { snapTo: 1 / lastStep, ease: 'power2.inOut' };

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        pin: true,
        start: 'top top',
        end,
        scrub: lenis ? true : 0.6,
        snap: lenis ? { ...snap, delay: 0.3, duration: { min: 0.2, max: 0.5 } } : snap,
        onUpdate: (self) => setActive(Math.round(self.progress * lastStep)),
      },
    });
    timeline.fromTo(dial, { rotate: angle }, { rotate: -angle, ease: 'none' });

    const trigger = timeline.scrollTrigger;
    const listeners = jumps.map((button, i) => {
      const onClick = () => {
        if (!trigger) return;
        const target = trigger.start + ((trigger.end - trigger.start) * i) / lastStep;
        scrollToY(target);
      };
      button.addEventListener('click', onClick);
      return () => button.removeEventListener('click', onClick);
    });

    return () => {
      listeners.forEach((remove) => remove());
      root.classList.remove('is-enhanced');
      active = -1;
    };
  };

  const mm = gsap.matchMedia();
  const motion = '(prefers-reduced-motion: no-preference)';
  mm.add(`(max-width: 767px) and ${motion}`, () => buildDial({ end: '+=300%', angle: 40 }));
  mm.add(`(min-width: 768px) and ${motion}`, () => buildDial({ end: '+=400%', angle: 50 }));

  // The pin changes page height; keep later triggers accurate.
  refreshScroll();

  return () => mm.revert();
}
