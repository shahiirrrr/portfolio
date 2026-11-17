/**
 * Site-wide smooth scrolling with Lenis (owner request; see CLAUDE.md §13).
 *
 *  - One instance, created only for mouse/trackpad devices with motion allowed.
 *    Phones, tablets and reduced motion keep plain native scrolling (Lenis'
 *    listeners are non-passive, so they are not attached there at all).
 *  - Lenis moves the real window scroll position, so ScrollTrigger pins, the
 *    fixed header, anchors, keyboard scrolling and find-in-page work as usual.
 *  - It runs on GSAP's ticker, so scroll-linked animations update in the same
 *    frame; Lenis eases by elapsed time, so 120/144 Hz screens glide the same.
 *
 * Other modules never scroll, lock or refresh the page directly; they use the
 * helpers below so both the Lenis and the native paths stay correct.
 */
import Lenis from 'lenis';

import { CAN_HOVER, gsap, MOTION_OK, ScrollTrigger } from './core.ts';

/** Glide strength per 60 Hz frame (Lenis default 0.1). Lower is silkier. */
const LERP = 0.075;

/** Where Lenis runs: mouse/trackpad devices with motion allowed. */
export const SMOOTH_SCROLL = `${MOTION_OK} and ${CAN_HOVER}`;

let lenis: Lenis | undefined;
let locked = false;

/** A textarea with overflowing text scrolls itself; a short one lets the page scroll. */
const isNestedScroller = (node: HTMLElement): boolean =>
  node instanceof HTMLTextAreaElement && node.scrollHeight > node.clientHeight;

// Created synchronously, so it exists before any other module's script runs.
gsap.matchMedia().add(SMOOTH_SCROLL, () => {
  const instance = new Lenis({
    lerp: LERP,
    smoothWheel: true,
    syncTouch: false,
    autoRaf: false,
    anchors: false,
    prevent: isNestedScroller,
  });
  const raf = (time: number): void => instance.raf(time * 1000);
  // ScrollTrigger refreshes can add or remove pin spacing; re-measure the
  // scroll limit after them (dimensions only, so a glide in flight continues).
  const resize = (): void => instance.dimensions.resize();

  instance.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(raf);
  ScrollTrigger.addEventListener('refresh', resize);
  if (locked) instance.stop();
  lenis = instance;

  return () => {
    gsap.ticker.remove(raf);
    ScrollTrigger.removeEventListener('refresh', resize);
    instance.destroy();
    lenis = undefined;
  };
});

/**
 * Focus moves and keyboard scrolling are native scrolls. While a wheel glide
 * is in flight Lenis ignores native scrolls and would pull the page back, so
 * drop the glide and let Lenis re-sync to wherever the browser scrolls.
 */
function yieldToNativeScroll(): void {
  if (lenis?.isScrolling !== 'smooth') return;
  lenis.stop();
  if (!locked) lenis.start();
}

const SCROLL_KEYS = new Set([' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown']);

/** Keys typed into controls edit or activate them instead of scrolling the page. */
const isControl = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || target.closest('input, textarea, select, button') !== null);

document.addEventListener('focusin', yieldToNativeScroll);
document.addEventListener('keydown', (event) => {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  if (!SCROLL_KEYS.has(event.key) || isControl(event.target)) return;
  yieldToNativeScroll();
});

/** Scroll the page to `y` px: Lenis glide, native smooth scroll, or instant with reduced motion. */
export function scrollToY(y: number): void {
  if (lenis) lenis.scrollTo(y);
  else window.scrollTo({ top: y, behavior: matchMedia(MOTION_OK).matches ? 'smooth' : 'auto' });
}

/** Freeze page scrolling (e.g. while a modal is open). */
export function lockScroll(): void {
  locked = true;
  lenis?.stop();
  document.documentElement.style.overflow = 'hidden';
}

/** Undo `lockScroll()`. */
export function unlockScroll(): void {
  locked = false;
  document.documentElement.style.overflow = '';
  lenis?.start();
}

/** Re-measure scroll positions after content changes the page height. */
export function refreshScroll(): void {
  ScrollTrigger.refresh();
}
