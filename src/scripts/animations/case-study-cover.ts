/** Case study cover: the image scales 1.1 → 1, scrubbed while it scrolls into view. */
import { gsap, MOTION_OK } from './core.ts';

export function initCaseStudyCover(root: HTMLElement): () => void {
  const mm = gsap.matchMedia();

  mm.add(
    MOTION_OK,
    () => {
      const image = root.querySelector('img');
      if (!image) return;
      gsap.fromTo(
        image,
        { scale: 1.1 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'top 20%', scrub: true },
        },
      );
    },
    root,
  );

  return () => mm.revert();
}
