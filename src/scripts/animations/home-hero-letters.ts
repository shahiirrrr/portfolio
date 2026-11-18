/**
 * Home hero name: each letter hangs on its own under-damped spring. Pointer
 * strokes near a letter push, lean and skew it along the stroke; scroll speed
 * stretches the row (springs of slightly different stiffness turn that into a
 * wave). Letters return to rest on their own, so the name feels heavy and wet.
 * Driven every frame by home-hero-negative.ts; transforms only.
 */
import { gsap } from './core.ts';

/** Pointer in hero pixels with velocity in px/s, or null when outside. */
export interface PointerSample {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface LetterSprings {
  /** Re-read the letters' resting positions (after resize). */
  measure(): void;
  update(dt: number, pointer: PointerSample | null, scrollVelocity: number): void;
  destroy(): void;
}

const DAMPING = 9;
/** Stiffness of the first letter; each next one is a little stiffer. */
const STIFFNESS = 150;
const STIFFNESS_STEP = 14;
/** Reach of a stroke, in font sizes. */
const REACH = 0.8;
/** Limits, in font sizes / degrees / scale. */
const MAX_SHIFT = 0.07;
const MAX_SKEW = 12;
const MAX_STRETCH = 0.16;

interface Spring {
  value: number;
  speed: number;
}

interface Letter {
  cx: number;
  cy: number;
  k: number;
  x: Spring;
  y: Spring;
  skew: Spring;
  stretch: Spring;
  set: {
    x: (v: number) => void;
    y: (v: number) => void;
    skew: (v: number) => void;
    scale: (v: number) => void;
  };
}

const spring = (): Spring => ({ value: 0, speed: 0 });

const step = (s: Spring, target: number, k: number, dt: number): void => {
  s.speed += (k * (target - s.value) - DAMPING * s.speed) * dt;
  s.value += s.speed * dt;
};

/** A typed `gsap.quickSetter` (GSAP types it as a bare `Function`). */
function setter(el: HTMLElement, property: string, unit?: string): (v: number) => void {
  const set = gsap.quickSetter(el, property, unit);
  return (v) => {
    set(v);
  };
}

const clamp = (v: number, limit: number): number => Math.max(-limit, Math.min(limit, v));

/** Offset of `el` inside `ancestor`, ignoring transforms. */
function offsetWithin(el: HTMLElement, ancestor: HTMLElement): { left: number; top: number } {
  let left = 0;
  let top = 0;
  let node: Element | null = el;
  while (node instanceof HTMLElement && node !== ancestor) {
    left += node.offsetLeft;
    top += node.offsetTop;
    node = node.offsetParent;
  }
  return { left, top };
}

export function createLetterSprings(chars: HTMLElement[], hero: HTMLElement): LetterSprings {
  let font = 1;
  const letters: Letter[] = chars.map((el, i) => ({
    cx: 0,
    cy: 0,
    k: STIFFNESS + i * STIFFNESS_STEP,
    x: spring(),
    y: spring(),
    skew: spring(),
    stretch: spring(),
    set: {
      x: setter(el, 'x', 'px'),
      y: setter(el, 'y', 'px'),
      skew: setter(el, 'skewX', 'deg'),
      scale: setter(el, 'scaleY'),
    },
  }));
  gsap.set(chars, { transformOrigin: '50% 100%' });

  const measure = (): void => {
    chars.forEach((el, i) => {
      const letter = letters[i];
      if (!letter) return;
      const { left, top } = offsetWithin(el, hero);
      letter.cx = left + el.offsetWidth / 2;
      letter.cy = top + el.offsetHeight / 2;
    });
    font = chars[0]?.offsetHeight ?? 1;
  };
  measure();

  let resting = true;

  return {
    measure,
    update(dt, pointer, scrollVelocity) {
      const stretch = clamp(scrollVelocity * 0.00004, MAX_STRETCH);
      if (resting && !pointer && Math.abs(stretch) < 0.002) return;

      const reach = font * REACH;
      let moving = Math.abs(stretch) >= 0.002;
      for (const letter of letters) {
        let fall = 0;
        if (pointer) {
          const dx = pointer.x - letter.cx;
          const dy = pointer.y - letter.cy;
          fall = Math.exp(-(dx * dx + dy * dy) / (reach * reach));
        }
        const vx = pointer ? pointer.vx * fall : 0;
        const vy = pointer ? pointer.vy * fall : 0;
        step(letter.x, clamp(vx * 0.02, font * MAX_SHIFT), letter.k, dt);
        step(letter.y, clamp(vy * 0.02, font * MAX_SHIFT), letter.k, dt);
        step(letter.skew, clamp(-vx * 0.006, MAX_SKEW), letter.k, dt);
        step(letter.stretch, stretch, letter.k, dt);

        letter.set.x(letter.x.value);
        letter.set.y(letter.y.value);
        letter.set.skew(letter.skew.value);
        letter.set.scale(1 + letter.stretch.value);

        moving ||=
          Math.abs(letter.x.value) + Math.abs(letter.y.value) > 0.05 ||
          Math.abs(letter.x.speed) + Math.abs(letter.y.speed) > 0.5 ||
          Math.abs(letter.skew.value) > 0.01 ||
          Math.abs(letter.stretch.value) > 0.0005;
      }
      resting = !moving;
    },
    destroy() {
      gsap.set(chars, { clearProps: 'x,y,skewX,scaleY,transformOrigin' });
    },
  };
}
