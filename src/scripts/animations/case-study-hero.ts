/**
 * Case study hero (full-screen cover, title over it).
 *
 *  - Load: the title rises through the shared `data-line-reveal="load"`. On a
 *    direct visit the image also eases in from 1.12. Arriving from a Home card
 *    it does not: the hero shows the card's own image, so the card's frame
 *    hands over to it in place (case-study-enter.ts) and any zoom during that
 *    hand-off would show as a double image.
 *  - Scroll: the hero recedes into a rounded panel (scales to 0.9 from its
 *    bottom edge while its corners round), the image (with its gradient)
 *    drifts down inside it and the title lifts away, scrubbed to the scroll.
 *    The drift only exposes the panel's top edge once it is above the screen.
 */
import { gsap, markMotionReady, MOTION_OK, MOTION_REDUCED, onIntroReady } from './core.ts';
import { SMOOTH_SCROLL } from './smooth-scroll.ts';

export function initCaseStudyHero(root: HTMLElement): () => void {
  const panel = root.querySelector<HTMLElement>('[data-cs-cover]');
  const media = panel?.querySelector<HTMLElement>('[data-cs-media]');
  const content = root.querySelector<HTMLElement>('[data-cs-hero-content]');
  const mm = gsap.matchMedia();

  mm.add(
    MOTION_OK,
    () => {
      const fromCard = document.documentElement.classList.contains('card-enter');
      if (media && !fromCard) {
        const zoom = gsap.from(media, {
          scale: 1.12,
          duration: 1.6,
          ease: 'power3.out',
          paused: true,
        });
        onIntroReady(() => zoom.restart());
      }
      markMotionReady();

      if (!panel) return;
      // Lenis already smooths wheel input; native (touch) scrolling keeps a little lag.
      const scrub = window.matchMedia(SMOOTH_SCROLL).matches ? true : 0.5;
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub },
      });
      // `--cs-hero-round` 0 → 1 takes the corners from square to the panel radius.
      timeline.to(panel, { scale: 0.9, '--cs-hero-round': 1 }, 0);
      if (media) timeline.to(media, { yPercent: 12 }, 0);
      if (content) timeline.to(content, { yPercent: -18, opacity: 0 }, 0);
    },
    root,
  );

  mm.add(MOTION_REDUCED, () => {
    markMotionReady();
  });

  return () => mm.revert();
}
