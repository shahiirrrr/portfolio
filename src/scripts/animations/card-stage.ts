/**
 * Shared pieces of the Home card → case study transition (owner request; see
 * CLAUDE.md §13): `home-card-transition.ts` expands a card into a full-screen
 * frame, `case-study-enter.ts` settles that frame into the case study cover.
 *
 * Both sides draw the frame in a fixed, full-viewport CardStage and animate it
 * with `clip-path` (the visible box) plus a uniform transform on the image, so
 * the picture is always cover-fitted and never stretched.
 */

/** sessionStorage key; also read by the inline bootstrap in BaseLayout.astro. */
export const CARD_TRANSITION_KEY = 'card-transition';

/** Widths of the full-screen frame image (ProjectCard renders both). */
export const CARD_STAGE_WIDTHS = { sm: 1280, lg: 2400 } as const;

export interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function toBox(rect: DOMRect): Box {
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
}

/** `clip-path` showing `box` inside the stage. Always the same shape, so GSAP can tween it. */
export function insetClip(box: Box, stage: Box, radius: number): string {
  const top = box.top - stage.top;
  const left = box.left - stage.left;
  const right = stage.width - left - box.width;
  const bottom = stage.height - top - box.height;
  return `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`;
}

/** Width of an image with aspect `ratio` cover-fitted into a `width` × `height` box. */
const coverWidth = (width: number, height: number, ratio: number): number =>
  Math.max(width, height * ratio);

/**
 * Layout for the stage image element: the whole picture, cover-fitted to the
 * stage and centred (identical on screen to `background-size: cover`). The
 * element must hold the whole picture, not just the stage-sized crop, or a
 * wide image on a tall phone screen would shrink to a narrow strip.
 * Applied once, before animating; only `coverTransform` moves it afterwards.
 */
export function coverLayout(stage: Box, ratio: number): Record<string, string> {
  const width = coverWidth(stage.width, stage.height, ratio);
  const height = width / ratio;
  // Longhands only: an `inset` shorthand applied after `left`/`top` would reset them.
  return {
    right: 'auto',
    bottom: 'auto',
    left: `${(stage.width - width) / 2}px`,
    top: `${(stage.height - height) / 2}px`,
    width: `${width}px`,
    height: `${height}px`,
    backgroundSize: '100% 100%',
  };
}

/**
 * Transform for the `coverLayout` image so it looks cover-fitted into `box`.
 * The scale is uniform, so the image never stretches; tweening it alongside
 * `insetClip` keeps the box covered at every frame.
 */
export function coverTransform(
  box: Box,
  stage: Box,
  ratio: number,
): { x: number; y: number; scale: number } {
  return {
    x: box.left + box.width / 2 - (stage.left + stage.width / 2),
    y: box.top + box.height / 2 - (stage.top + stage.height / 2),
    scale: coverWidth(box.width, box.height, ratio) / coverWidth(stage.width, stage.height, ratio),
  };
}

/** Resolves after `ms`, for capping waits on images. */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
