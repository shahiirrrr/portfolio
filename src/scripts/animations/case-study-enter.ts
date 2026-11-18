/**
 * Case study entry from a Home card (owner request; see CLAUDE.md §13 and
 * home-card-transition.ts).
 *
 * When a Home card just navigated here, BaseLayout's bootstrap marks
 * `html.card-enter` before the first paint, so the page opens on the same
 * full-screen frame the card ended on (CardStage, `enter`). This settles that
 * frame into the hero panel: it eases in to the panel's inset, rounded box
 * while cross-fading to the real cover, and the title rises over it (see
 * `introDelay()`).
 * Without the marker (direct visit, reload, reduced motion) nothing happens.
 */
import { coverLayout, coverTransform, insetClip, toBox, wait } from './card-stage.ts';
import { gsap, MOTION_OK } from './core.ts';
import { lockScroll, unlockScroll } from './smooth-scroll.ts';

/** Seconds. */
const SETTLE = 1.1;
/** Moves from the first frame (the card ended on a slow stop), then glides into the cover. */
const SETTLE_EASE = 'power3.out';
/** Hand-off from the frame to the hero image (the same picture), early in the settle. */
const FADE = 0.5;
const FADE_AT = 0.2;
/**
 * Longest wait (ms) for the frame image before revealing and settling anyway.
 * Where page transitions are supported the browser keeps showing the Home
 * frame meanwhile (global.css caps that hold at 1.2s).
 */
const IMAGE_WAIT = 1000;
/** Lets the 0.1s page reveal finish before the frame starts to move. */
const SETTLE_DELAY = 0.1;

export function initCaseStudyEnter(stage: HTMLElement, target: HTMLElement): void {
  const html = document.documentElement;
  if (!html.classList.contains('card-enter')) return;
  // Tells the bootstrap failsafe that the transition has been taken over.
  html.classList.add('card-entering');

  const clip = stage.querySelector<HTMLElement>('[data-card-stage-clip]');
  const image = stage.querySelector<HTMLElement>('[data-card-stage-image]');

  const finish = (): void => {
    html.classList.remove('card-enter', 'card-entering', 'card-ready');
    if (clip && image) gsap.set([stage, clip, image], { clearProps: 'all' });
    unlockScroll();
  };

  if (!clip || !image || !window.matchMedia(MOTION_OK).matches) {
    finish();
    return;
  }

  lockScroll();
  const loader = new Image();
  const url = html.dataset.cardStage;
  if (url) loader.src = url;

  void Promise.race([loader.decode().catch(() => undefined), wait(IMAGE_WAIT)]).then(() => {
    // The frame can paint now: end the browser's hold on the Home frame (global.css).
    html.classList.add('card-ready');
    const stageBox = toBox(stage.getBoundingClientRect());
    const box = toBox(target.getBoundingClientRect());
    const radius = Number.parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0;
    const ratio = loader.naturalWidth / loader.naturalHeight || stageBox.width / stageBox.height;

    gsap.set(image, coverLayout(stageBox, ratio));
    gsap
      .timeline({ delay: SETTLE_DELAY, onComplete: finish })
      .fromTo(
        clip,
        { clipPath: insetClip(stageBox, stageBox, 0) },
        { clipPath: insetClip(box, stageBox, radius), duration: SETTLE, ease: SETTLE_EASE },
        0,
      )
      .to(
        image,
        { ...coverTransform(box, stageBox, ratio), duration: SETTLE, ease: SETTLE_EASE },
        0,
      )
      .to(stage, { autoAlpha: 0, duration: FADE, ease: 'power1.out' }, FADE_AT);
  });
}
