/**
 * Home hero entry. With motion allowed it loads the "Negative" ink hero
 * (home-hero-negative.ts) once the portrait and fonts are ready; without
 * WebGL2 it falls back to the classic intro (letters rise out of a mask, the
 * portrait rises in front, then header, socials and role fade in). Either way
 * the name drifts up slower than the portrait on scroll. The page can't be
 * scrolled until the intro has finished. A reload or history load that
 * restores a scrolled position skips the intro and never locks.
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
/** sessionStorage key: the scroll position Home was left at. */
const LEFT_AT_KEY = 'home-hero:left-at';

function navigationType(): string | undefined {
  const entry = performance.getEntriesByType('navigation')[0];
  return entry instanceof PerformanceNavigationTiming ? entry.type : undefined;
}

/** True when this load came from the back/forward buttons (no bfcache). */
const isHistoryNavigation = (): boolean => navigationType() === 'back_forward';

/**
 * True when a reload or history load will put the page back below the top.
 * The browser restores the position only around `load`, after this script
 * has run, so the position is read from where the page was left instead.
 */
function restoresScrolled(): boolean {
  const type = navigationType();
  if (type !== 'reload' && type !== 'back_forward') return false;
  try {
    return Number(sessionStorage.getItem(LEFT_AT_KEY)) > 0;
  } catch {
    return false;
  }
}

function rememberScroll(): void {
  try {
    sessionStorage.setItem(LEFT_AT_KEY, String(Math.round(window.scrollY)));
  } catch {
    // Storage unavailable: the next reload simply plays the intro.
  }
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

    // Hold the page still until the intro has played — only on a load that
    // starts at the top: a reload restored further down scrolls freely.
    window.addEventListener('pagehide', rememberScroll);
    const intro = !restoresScrolled();
    let locked = intro && window.scrollY < hero.offsetHeight;
    const release = (): void => {
      window.clearTimeout(failsafe);
      window.removeEventListener('scroll', onRestore);
      if (!locked) return;
      locked = false;
      unlockScroll(INTRO_LOCK);
    };
    // Nothing else scrolls a locked page: a scroll now is the browser
    // restoring a position the stored one missed, so free the page.
    const onRestore = (): void => {
      if (window.scrollY > 0) release();
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
      // No intro once the page has moved off the top (a restored position).
      const play = !shown && intro && window.scrollY === 0;
      const develop = play && !isHistoryNavigation();
      const ink =
        negative && canvas
          ? negative.initNegative(
              { hero, canvas, nameWrap, portrait, chars, fades, header },
              develop,
              release,
            )
          : null;
      if (ink) teardown = ink;
      else if (play) teardown = classicIntro(chars, portrait, fades, release);
      else release();
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
      window.removeEventListener('pagehide', rememberScroll);
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
