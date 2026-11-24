/**
 * Home hero entry. With motion allowed it loads the "Negative" ink hero
 * (home-hero-negative.ts) once the portrait and fonts are ready; without
 * WebGL2 it falls back to the classic intro (letters rise out of a mask, the
 * portrait rises in front, then header, socials and role fade in). Either way
 * the name drifts up slower than the portrait on scroll. The page can't be
 * scrolled until the intro has finished.
 * Reduced motion: a plain fade.
 */
import { gsap, markMotionReady, MOTION_OK, MOTION_REDUCED, SplitText } from './core.ts';
import { lockScroll, unlockScroll } from './smooth-scroll.ts';

/** Scroll-lock holder name for the intro (see smooth-scroll.ts). */
const INTRO_LOCK = 'home-hero-intro';
/**
 * Never keep the page frozen longer than this (ms), whatever happens to the
 * intro: the CSS start-overlay failsafe (2.5s) plus the longest intro, with margin.
 */
const LOCK_FAILSAFE = 8000;

/** True when this load came from the back/forward buttons (no bfcache). */
function isHistoryNavigation(): boolean {
  const entry = performance.getEntriesByType('navigation')[0];
  return entry instanceof PerformanceNavigationTiming && entry.type === 'back_forward';
}

function classicIntro(
  chars: Element[],
  portrait: HTMLElement,
  fades: HTMLElement[],
  onSettled: () => void,
): () => void {
  const ctx = gsap.context(() => {
    gsap
      .timeline({ onComplete: onSettled })
      .from(chars, { yPercent: 110, stagger: 0.05, duration: 0.9, ease: 'power4.out' })
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
  });
  markMotionReady();
  return () => ctx.revert();
}

export function initHero(hero: HTMLElement): () => void {
  const name = hero.querySelector<HTMLElement>('[data-hero-name]');
  const nameWrap = hero.querySelector<HTMLElement>('[data-hero-name-wrap]');
  const portrait = hero.querySelector<HTMLElement>('[data-hero-portrait]');
  const canvas = hero.querySelector<HTMLCanvasElement>('canvas[data-hero-ink]');
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  const fades = [header, ...hero.querySelectorAll<HTMLElement>('[data-hero-fade]')].filter(
    (el) => el !== null,
  );

  const mm = gsap.matchMedia();

  mm.add(MOTION_OK, () => {
    if (!name || !nameWrap || !portrait) {
      hero.dataset.heroReady = '';
      markMotionReady();
      return;
    }

    // Hold the page still until the intro has played (only when the hero is
    // in view: a reload restored further down keeps scrolling freely).
    const heroInView = (): boolean => window.scrollY < hero.offsetHeight;
    let locked = heroInView();
    const release = (): void => {
      window.clearTimeout(failsafe);
      window.removeEventListener('scroll', onRestore);
      if (!locked) return;
      locked = false;
      unlockScroll(INTRO_LOCK);
    };
    // A reload or history load restores the old position around `load`, after
    // this has run: when that lands below the hero, free the page at once.
    const onRestore = (): void => {
      if (!heroInView()) release();
    };
    const failsafe = locked ? window.setTimeout(release, LOCK_FAILSAFE) : 0;
    if (locked) {
      lockScroll(INTRO_LOCK);
      window.addEventListener('scroll', onRestore, { passive: true });
    }

    // Depth parallax on the wrapper, which no other animation touches.
    gsap.to(nameWrap, {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });

    const split = SplitText.create(name, { type: 'chars' });
    const chars = split.chars.filter((el) => el instanceof HTMLElement);
    let cancelled = false;
    let teardown: (() => void) | undefined;

    const begin = (negative: typeof import('./home-hero-negative.ts') | null): void => {
      if (cancelled) return;
      // The start overlay's CSS failsafe already showed the static hero: don't hide it again.
      const shown = getComputedStyle(hero, '::after').visibility === 'hidden';
      // No develop act off-screen (a reload restored further down).
      const develop = !shown && !isHistoryNavigation() && heroInView();
      const ink =
        negative && canvas
          ? negative.initNegative(
              { hero, canvas, nameWrap, portrait, chars, fades, header },
              develop,
              release,
            )
          : null;
      if (ink) teardown = ink;
      else if (shown) release();
      else teardown = classicIntro(chars, portrait, fades, release);
      // Start states are set: lift the start overlay (Hero.astro).
      hero.dataset.heroReady = '';
      markMotionReady();
    };

    const image = portrait.querySelector('img');
    Promise.all([
      import('./home-hero-negative.ts'),
      image?.decode().catch(() => undefined),
      document.fonts.ready,
    ]).then(
      ([negative]) => begin(negative),
      () => begin(null),
    );

    return () => {
      cancelled = true;
      release();
      teardown?.();
      split.revert();
    };
  });

  mm.add(MOTION_REDUCED, () => {
    gsap.from([nameWrap, portrait, ...fades], { opacity: 0, duration: 0.6 });
    markMotionReady();
  });

  return () => mm.revert();
}
