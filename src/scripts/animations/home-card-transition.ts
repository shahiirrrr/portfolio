/**
 * Home rail → case study transition (owner request; see CLAUDE.md §13).
 *
 *  1. Lift: the clicked card rises (scale + a subtle 3D tilt) while the rest
 *     of the section fades back.
 *  2. Expand: a full-viewport CardStage takes over from a copy of the card —
 *     the dark card body and the cover image grow from the card to the whole
 *     screen while the card's text falls away.
 *  3. The browser navigates. The case study opens on the same full-screen
 *     frame and settles it into its cover (case-study-enter.ts), so the page
 *     change is invisible.
 *
 * Only clip-path, transform and opacity animate; everything is measured once,
 * before the first frame. Returning via the back/forward cache plays the
 * expansion in reverse. Reduced motion, modified clicks and no JS: plain links.
 */
import {
  type Box,
  CARD_STAGE_WIDTHS,
  CARD_TRANSITION_KEY,
  coverLayout,
  coverTransform,
  insetClip,
  toBox,
  wait,
} from './card-stage.ts';
import { gsap, MOTION_OK } from './core.ts';
import { lockScroll, unlockScroll } from './smooth-scroll.ts';

const LIFT_SCALE = 1.03;
const LIFT_Y = -12;
const LIFT_TILT = 5;
/** Stage opacity before the hand-off: drawn by the browser, invisible to the eye. */
const PREPAINT = 0.001;
/** Seconds. */
const LIFT = 0.3;
const EXPAND = 0.85;
/** Soft ends, so the hand-off to the case study doesn't stall on a long ease tail. */
const EXPAND_EASE = 'power1.inOut';
/** Longest wait (ms) for the full-size image before navigating anyway. */
const IMAGE_WAIT = 300;

const decoded = new Map<string, Promise<void>>();

/** Start loading + decoding an image once; resolves when it can paint (or failed). */
function preload(url: string): Promise<void> {
  let ready = decoded.get(url);
  if (!ready) {
    const image = new Image();
    image.src = url;
    ready = image.decode().catch(() => undefined);
    decoded.set(url, ready);
  }
  return ready;
}

const prefetched = new Set<string>();

/** Fetch the case study HTML ahead of the click (ignored where unsupported). */
function prefetch(href: string): void {
  if (prefetched.has(href)) return;
  prefetched.add(href);
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.append(link);
}

/** The full-screen rendition that suits this screen. */
function stageImage(card: HTMLElement): string | undefined {
  const { stageSm, stageLg } = card.dataset;
  const large = window.innerWidth * window.devicePixelRatio > CARD_STAGE_WIDTHS.sm;
  return large ? (stageLg ?? stageSm) : (stageSm ?? stageLg);
}

/** Vertical part of a computed `translate` ("0px -8px" → -8). */
function translateY(value: string): number {
  const [, y = '0'] = value.split(' ');
  return Number.parseFloat(y) || 0;
}

function cardFrom(target: EventTarget | null): HTMLAnchorElement | null {
  return target instanceof Element
    ? target.closest<HTMLAnchorElement>('a[data-card-transition]')
    : null;
}

export function initCardTransition(root: HTMLElement, stage: HTMLElement): () => void {
  const frame = stage.querySelector<HTMLElement>('[data-card-stage-frame]');
  const clip = stage.querySelector<HTMLElement>('[data-card-stage-clip]');
  const image = stage.querySelector<HTMLElement>('[data-card-stage-image]');
  if (!frame || !clip || !image) return () => {};

  let timeline: gsap.core.Timeline | undefined;
  let holder: HTMLElement | undefined;

  const reset = (): void => {
    timeline?.kill();
    timeline = undefined;
    holder?.remove();
    holder = undefined;
    gsap.set([frame, clip, image], { clearProps: 'all' });
    stage.removeAttribute('data-active');
    stage.style.removeProperty('--card-stage-image');
    unlockScroll();
  };

  const leave = async (href: string, imageUrl: string, fallbackUrl: string): Promise<void> => {
    await Promise.race([preload(imageUrl), wait(IMAGE_WAIT)]);
    try {
      sessionStorage.setItem(
        CARD_TRANSITION_KEY,
        JSON.stringify({
          path: new URL(href).pathname,
          t: Date.now(),
          img: new URL(imageUrl, window.location.href).pathname,
          fallback: new URL(fallbackUrl, window.location.href).pathname,
        }),
      );
    } catch {
      // Storage blocked: the case study simply opens with its normal intro.
    }
    window.location.assign(href);
  };

  const play = (card: HTMLAnchorElement): void => {
    const href = card.href;
    const cover = card.querySelector<HTMLElement>('[data-card-cover]');
    const folder = card.querySelector<HTMLElement>('[data-card-folder]');
    const coverImage = cover?.querySelector('img');
    const copy = card.cloneNode(true);
    if (!cover || !folder || !coverImage || !(copy instanceof HTMLElement)) {
      window.location.assign(href);
      return;
    }
    const copyCover = copy.querySelector<HTMLElement>('[data-card-cover]');
    const copyFolder = copy.querySelector<HTMLElement>('[data-card-folder]');
    const copyImage = copyCover?.querySelector('img');
    if (!copyCover || !copyFolder || !copyImage) {
      window.location.assign(href);
      return;
    }

    const fallbackUrl = coverImage.currentSrc || coverImage.src;
    const imageUrl = stageImage(card) ?? fallbackUrl;
    void preload(imageUrl);

    // Measure everything once, before anything moves.
    lockScroll();
    stage.setAttribute('data-active', '');
    stage.style.setProperty('--card-stage-image', `url("${imageUrl}"), url("${fallbackUrl}")`);
    const stageBox = toBox(stage.getBoundingClientRect());
    const cardBox = toBox(card.getBoundingClientRect());
    const coverBox = toBox(cover.getBoundingClientRect());
    const cardRadius = Number.parseFloat(getComputedStyle(card).borderTopLeftRadius) || 0;
    const coverRadius = Number.parseFloat(getComputedStyle(cover).borderTopLeftRadius) || 0;
    const ratio = coverImage.naturalWidth / coverImage.naturalHeight || 1.6;
    const hoverLift = translateY(getComputedStyle(folder).translate);
    const hoverZoom = Number.parseFloat(getComputedStyle(coverImage).scale) || 1;

    // The lifted card, as boxes: scaled about its centre, then raised.
    const centreX = cardBox.left + cardBox.width / 2;
    const centreY = cardBox.top + cardBox.height / 2;
    const lift = (box: Box): Box => ({
      left: centreX + (box.left - centreX) * LIFT_SCALE,
      top: centreY + (box.top - centreY) * LIFT_SCALE + LIFT_Y,
      width: box.width * LIFT_SCALE,
      height: box.height * LIFT_SCALE,
    });
    const liftedCard = lift(cardBox);
    const liftedCover = lift(coverBox);

    // A copy of the card above the stage. Its size container gives the copy
    // the same design unit (`--u`) the rail gives the card.
    holder = document.createElement('div');
    holder.style.cssText = `position:absolute;top:${cardBox.top}px;left:${cardBox.left}px;width:${cardBox.width}px;height:${cardBox.height}px;container-type:size;`;
    for (const name of ['href', 'style', 'data-card-transition', 'data-rail-item']) {
      copy.removeAttribute(name);
    }
    copy.setAttribute('tabindex', '-1');
    copy.style.margin = '0';
    copyFolder.style.transition = 'none';
    copyImage.style.transition = 'none';
    holder.append(copy);
    stage.append(holder);

    const others = [
      ...root.querySelectorAll<HTMLElement>('[data-card-fade]'),
      ...Array.from(root.querySelectorAll<HTMLElement>('[data-rail-item]')).filter(
        (item) => item !== card,
      ),
    ];
    // Clip shapes are always passed as explicit from/to strings: browsers
    // shorten a computed `inset()` whose sides match (a centred card on a
    // phone), and GSAP would pair the numbers up wrongly if it read one back.
    const full = insetClip(stageBox, stageBox, 0);
    const frameStart = insetClip(liftedCard, stageBox, cardRadius * LIFT_SCALE);
    const clipStart = insetClip(liftedCover, stageBox, coverRadius * LIFT_SCALE);

    timeline = gsap
      .timeline({ onComplete: () => void leave(href, imageUrl, fallbackUrl) })
      // Start states (all reversible for the back/forward cache).
      .set(card, { visibility: 'hidden' }, 0)
      .set(holder, { transformPerspective: 1200 }, 0)
      .set(copyFolder, { y: hoverLift }, 0)
      .set(copyImage, { scale: hoverZoom }, 0)
      // Painted but imperceptible during the lift, so the large image is
      // rasterised before the hand-off instead of on its first visible frame.
      .set([frame, clip], { opacity: PREPAINT }, 0)
      .set(
        image,
        { ...coverLayout(stageBox, ratio), ...coverTransform(liftedCover, stageBox, ratio) },
        0,
      )
      // 1. Lift; any hover offset eases out at the same time.
      .to(holder, { scale: LIFT_SCALE, y: LIFT_Y, duration: LIFT, ease: 'power2.out' }, 0)
      .to(
        holder,
        { keyframes: { rotationX: [0, LIFT_TILT, 0] }, duration: LIFT, ease: 'sine.inOut' },
        0,
      )
      .to(copyFolder, { y: 0, duration: LIFT, ease: 'power2.out' }, 0)
      .to(copyImage, { scale: 1, duration: LIFT, ease: 'power2.out' }, 0)
      .to(others, { autoAlpha: 0, y: 16, duration: 0.4, ease: 'power2.out' }, 0.05)
      // 2. Expand: the stage (identical at this moment) takes over from the copy.
      .set([frame, clip], { opacity: 1 }, LIFT)
      .set(copyCover, { autoAlpha: 0 }, LIFT)
      .set(copy, { backgroundColor: 'transparent' }, LIFT)
      .to(copyFolder, { autoAlpha: 0, y: 48, duration: 0.4, ease: 'power2.in' }, LIFT)
      .fromTo(
        frame,
        { clipPath: frameStart },
        { clipPath: full, duration: EXPAND, ease: EXPAND_EASE },
        LIFT,
      )
      .fromTo(
        clip,
        { clipPath: clipStart },
        { clipPath: full, duration: EXPAND, ease: EXPAND_EASE },
        LIFT,
      )
      .to(image, { x: 0, y: 0, scale: 1, duration: EXPAND, ease: EXPAND_EASE }, LIFT);
  };

  const onPointerOver = (event: PointerEvent): void => {
    const card = cardFrom(event.target);
    if (card) prefetch(card.href);
  };

  const onPointerDown = (event: PointerEvent): void => {
    const card = cardFrom(event.target);
    const url = card && stageImage(card);
    if (url) void preload(url);
  };

  const onClick = (event: MouseEvent): void => {
    const card = cardFrom(event.target);
    if (!card || event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!window.matchMedia(MOTION_OK).matches) return;
    event.preventDefault();
    if (timeline) return; // a transition is already running
    play(card);
  };

  // Back/forward cache: the page comes back exactly as it was left (full-screen
  // frame), so play the expansion in reverse and hand the rail back.
  const onPageShow = (event: PageTransitionEvent): void => {
    if (!event.persisted || !timeline) return;
    timeline.eventCallback('onReverseComplete', reset);
    timeline.timeScale(1.6).reverse();
  };

  root.addEventListener('pointerover', onPointerOver);
  root.addEventListener('pointerdown', onPointerDown);
  root.addEventListener('click', onClick);
  window.addEventListener('pageshow', onPageShow);

  return () => {
    reset();
    root.removeEventListener('pointerover', onPointerOver);
    root.removeEventListener('pointerdown', onPointerDown);
    root.removeEventListener('click', onClick);
    window.removeEventListener('pageshow', onPageShow);
  };
}
