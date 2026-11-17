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

export { gsap, ScrollTrigger, SplitText };
