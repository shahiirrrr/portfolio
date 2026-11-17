/** Case study before / after images: left-to-right clip-path wipe when scrolled into view. */
import { gsap, MOTION_OK } from './core.ts';

export function initCaseStudyMedia(root: HTMLElement): () => void {
  const mm = gsap.matchMedia();

  mm.add(
    MOTION_OK,
    () => {
      gsap.utils.toArray<HTMLElement>('[data-cs-wipe]', root).forEach((frame) => {
        gsap.fromTo(
          frame,
          { clipPath: 'inset(0% 100% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.1,
            ease: 'power3.inOut',
            clearProps: 'clipPath',
            scrollTrigger: { trigger: frame, start: 'top 85%', once: true },
          },
        );
      });
    },
    root,
  );

  return () => mm.revert();
}
