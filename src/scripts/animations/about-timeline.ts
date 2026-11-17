/**
 * About timeline: the closing rule draws left → right when it scrolls into
 * view. (The rows use the shared `data-reveal-group` rise.)
 */
import { gsap, MOTION_OK } from './core.ts';

export function initAboutTimeline(endRule: HTMLElement): () => void {
  const mm = gsap.matchMedia();

  mm.add(MOTION_OK, () => {
    gsap.from(endRule, {
      scaleX: 0,
      transformOrigin: 'left',
      duration: 1,
      scrollTrigger: { trigger: endRule, once: true },
    });
  });

  return () => mm.revert();
}
