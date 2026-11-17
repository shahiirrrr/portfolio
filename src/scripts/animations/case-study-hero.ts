/**
 * Case study hero intro: the subtitle and the meta items fade up with a 60ms
 * stagger after the title has started rising out of its mask (the title uses
 * the shared `data-line-reveal="load"`).
 */
import { gsap, markMotionReady, MOTION_OK, MOTION_REDUCED } from './core.ts';

export function initCaseStudyHero(root: HTMLElement): () => void {
  const mm = gsap.matchMedia();

  mm.add(
    MOTION_OK,
    () => {
      gsap.from(root.querySelectorAll('[data-cs-fade]'), {
        y: 20,
        opacity: 0,
        stagger: 0.06,
        delay: 0.3,
      });
      markMotionReady();
    },
    root,
  );

  mm.add(MOTION_REDUCED, () => {
    markMotionReady();
  });

  return () => mm.revert();
}
