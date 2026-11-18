/**
 * Shared GSAP setup. Every animation module imports gsap and its plugins from
 * here so plugins are registered exactly once.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Media queries for `gsap.matchMedia()`. */
export const MOTION_OK = '(prefers-reduced-motion: no-preference)';
export const MOTION_REDUCED = '(prefers-reduced-motion: reduce)';
/** The design breakpoint: mobile frames below, desktop frames from 768px. */
export const DESKTOP = '(min-width: 768px)';
export const MOBILE = '(max-width: 767px)';
export const CAN_HOVER = '(hover: hover) and (pointer: fine)';

/**
 * Reveal `[data-intro]` elements (hidden by global.css until now). Call after
 * an intro animation has set its start state, and from every code path that
 * skips the animation.
 */
export function markMotionReady(): void {
  document.documentElement.classList.add('motion-ready');
}

/**
 * Extra delay (s) for on-load intros while a Home card transition is still
 * settling into the page (`html.card-enter`, see case-study-enter.ts), so the
 * hero rises as the frame shrinks instead of underneath it.
 */
export function introDelay(): number {
  return document.documentElement.classList.contains('card-enter') ? 0.25 : 0;
}

/**
 * Runs `start` now, or — while a Home card transition is still holding the
 * previous page's frame (`html.card-enter`) — once this page can paint its
 * frame (`card-ready`, set by case-study-enter.ts) or the transition is
 * dropped. Keeps on-load intros from playing unseen under the held frame.
 */
export function onIntroReady(start: () => void): void {
  const html = document.documentElement;
  const ready = (): boolean =>
    !html.classList.contains('card-enter') || html.classList.contains('card-ready');
  if (ready()) {
    start();
    return;
  }
  const observer = new MutationObserver(() => {
    if (!ready()) return;
    observer.disconnect();
    start();
  });
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
}

export { gsap, ScrollTrigger, SplitText };
