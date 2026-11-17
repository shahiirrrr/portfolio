/**
 * Home hero intro (once, ≈1.6s): the name's letters rise out of a mask with a
 * 50ms stagger, the portrait rises in front of it, then header, socials and
 * role fade in. On scroll the name drifts up slower than the portrait.
 * Reduced motion: a plain fade.
 */
import { gsap, markMotionReady, MOTION_OK, MOTION_REDUCED, SplitText } from './core.ts';

export function initHero(hero: HTMLElement): () => void {
  const name = hero.querySelector<HTMLElement>('[data-hero-name]');
  const nameWrap = hero.querySelector<HTMLElement>('[data-hero-name-wrap]');
  const portrait = hero.querySelector<HTMLElement>('[data-hero-portrait]');
  const fades = [
    document.querySelector<HTMLElement>('[data-site-header]'),
    ...hero.querySelectorAll<HTMLElement>('[data-hero-fade]'),
  ].filter((el) => el !== null);

  const mm = gsap.matchMedia();

  mm.add(MOTION_OK, () => {
    if (!name || !nameWrap || !portrait) return;

    const split = SplitText.create(name, { type: 'chars' });

    gsap
      .timeline()
      .from(split.chars, { yPercent: 110, stagger: 0.05, duration: 0.9, ease: 'power4.out' })
      .from(
        portrait,
        {
          y: 40,
          scale: 1.04,
          opacity: 0,
          duration: 1.1,
          ease: 'expo.out',
          clearProps: 'transform',
        },
        '-=0.6',
      )
      // clearProps: the header's own hide/show transition uses `transform`.
      .from(fades, { opacity: 0, y: 12, stagger: 0.06, clearProps: 'transform' }, '-=0.5');

    // Depth parallax. Uses `translate` via y on the wrapper, which the intro never touches.
    gsap.to(nameWrap, {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });

    markMotionReady();
    return () => split.revert();
  });

  mm.add(MOTION_REDUCED, () => {
    gsap.from([nameWrap, portrait, ...fades], { opacity: 0, duration: 0.6 });
    markMotionReady();
  });

  return () => mm.revert();
}
