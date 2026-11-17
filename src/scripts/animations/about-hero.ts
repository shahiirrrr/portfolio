/**
 * About hero intro (once, on load): the eyebrow and title fade up 24px and the
 * portrait fades in from 1.05 scale. The intro paragraph's word-by-word reveal
 * is the shared `data-word-reveal` effect. Reduced motion: a plain fade.
 */
import { gsap, markMotionReady, MOTION_OK, MOTION_REDUCED } from './core.ts';

export function initAboutHero(hero: HTMLElement): () => void {
  const rises = hero.querySelectorAll<HTMLElement>('[data-about-rise]');
  const portrait = hero.querySelector<HTMLElement>('[data-about-portrait]');

  const mm = gsap.matchMedia();

  mm.add(MOTION_OK, () => {
    gsap.from(rises, { y: 24, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' });
    if (portrait) {
      gsap.from(portrait, { opacity: 0, scale: 1.05, duration: 1.2, ease: 'power3.out' });
    }
    markMotionReady();
  });

  mm.add(MOTION_REDUCED, () => {
    gsap.from([...rises, portrait], { opacity: 0, duration: 0.6 });
    markMotionReady();
  });

  return () => mm.revert();
}
