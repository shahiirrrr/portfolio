/**
 * Home hero "Negative" (owner-approved exception, CLAUDE.md §13). One liquid
 * ink field (ink-field.ts) on one canvas plays three connected acts:
 *
 *  1. Develop — cover mode: the canvas lies on top of the hero and paints the
 *     site's dark ground. A drop of white ink lands on the portrait, throws
 *     out a splash of droplets and soaks outward while the hero develops
 *     inside the white like a print; each letter
 *     springs up when the edge reaches it, then header, socials and role.
 *  2. Play — negative mode: the canvas inverts what it covers
 *     (`mix-blend-mode: difference`). Pointer strokes leave a curling trail
 *     that paints the hero — photo included — in negative, and push the
 *     letters on springs (home-hero-letters.ts). On touch screens a tap drops a blot of
 *     ink; drags paint until scrolling takes over.
 *  3. Flood — scrolling raises the ink from the bottom so the white hero turns
 *     into the dark site below it; the photo is shielded by its silhouette
 *     mask and never inverts; scroll speed makes the edge wave and the
 *     name stretch. Scrolling back drains it.
 *
 * Loaded on demand by home-hero.ts after the portrait and fonts are ready;
 * returns null when WebGL2 is unavailable so the classic hero takes over.
 */
import { gsap } from './core.ts';
import { createLetterSprings, type PointerSample } from './home-hero-letters.ts';
import { createInkField, MAX_DPR } from './ink-field.ts';
import { DROP_COUNT } from './ink-field-shaders.ts';
import { SMOOTH_SCROLL } from './smooth-scroll.ts';

export interface NegativeParts {
  hero: HTMLElement;
  canvas: HTMLCanvasElement;
  nameWrap: HTMLElement;
  portrait: HTMLElement;
  chars: HTMLElement[];
  /** Header, socials and role: faded in at the end of the develop act. */
  fades: HTMLElement[];
  header: HTMLElement | null;
}

/** Develop act: the drop lands after DROP_DELAY, then spreads for DEVELOP_DURATION (s). */
const DROP_DELAY = 0.35;
const DROP_RADIUS = 0.075;
const DEVELOP_DURATION = 1.8;
/** How far ahead of the edge (hero heights) a letter starts rising. */
const DEVELOP_LEAD = 0.18;
/** Origin of the develop act, as a fraction of the portrait box from its top. */
const ORIGIN_DEPTH = 0.42;
/** Flood level at the hero's first and last scroll position (see the display shader). */
const FLOOD_FROM = -0.28;
const FLOOD_TO = 1.3;
const MAX_WAVE = 0.05;
/** Pointer stroke size: base radius + growth with speed (hero heights). */
const STROKE_RADIUS = 0.03;
const STROKE_GROWTH = 0.022;
const STROKE_STRENGTH = 0.9;
/**
 * The portrait's silhouette mask box inside the portrait box — mirrors the
 * `mask-size` / `mask-position` in Hero.astro (position is in portrait widths).
 */
const MASK_LEFT = 0.06818;
const MASK_TOP = 0.03551;
const MASK_WIDTH = 0.85653;
const MASK_HEIGHT = 0.97159;
/** Stop rendering this long (s) after the last stroke once nothing else moves. */
const IDLE_AFTER = 4;

type Rgb = [number, number, number];

/**
 * Ink colours: `cover` paints the site background itself (the develop act,
 * drawn on top of everything); `negative` is white minus the background, so
 * under `difference` it turns the hero's white into the background.
 */
function inkColors(): { cover: Rgb; negative: Rgb } | null {
  const styles = getComputedStyle(document.documentElement);
  // Let the browser normalise the token: production CSS is minified (#ffffff
  // becomes #fff), and a canvas reads any CSS colour back as #rrggbb.
  const probe = document.createElement('canvas').getContext('2d');
  const rgb = (token: string): number[] | null => {
    const value = styles.getPropertyValue(token).trim();
    if (!probe || !value) return null;
    probe.fillStyle = '#010203';
    probe.fillStyle = value;
    const match = /^#([0-9a-f]{6})$/i.exec(probe.fillStyle);
    // Unparsable values leave the sentinel in place.
    if (!match?.[1] || (probe.fillStyle === '#010203' && value !== '#010203')) return null;
    const n = Number.parseInt(match[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const white = rgb('--color-bg-white');
  const ground = rgb('--color-bg');
  if (!white || !ground) return null;
  const at = (list: number[], i: number): number => (list[i] ?? 0) / 255;
  return {
    cover: [at(ground, 0), at(ground, 1), at(ground, 2)],
    negative: [
      at(white, 0) - at(ground, 0),
      at(white, 1) - at(ground, 1),
      at(white, 2) - at(ground, 2),
    ],
  };
}

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export function initNegative(parts: NegativeParts, develop: boolean): (() => void) | null {
  const inks = inkColors();
  const field = inks ? createInkField(parts.canvas, develop ? inks.cover : inks.negative) : null;
  if (!inks || !field) return null;

  const { hero, canvas, nameWrap, portrait, chars, fades, header } = parts;
  const { state } = field;
  const headerTheme = header?.dataset.theme;

  let heroW = 0;
  let heroH = 1;
  let maxRadius = 2;
  let developing = develop;
  let playing = false;
  let visible = true;

  const letters = createLetterSprings(chars, hero);

  /** Field-space point for a client-space point. */
  const toField = (x: number, y: number, rect: DOMRect): [number, number] => [
    (x - rect.left) / heroH,
    1 - (y - rect.top) / heroH,
  ];

  const placeOrigin = (): void => {
    const rect = hero.getBoundingClientRect();
    const box = portrait.getBoundingClientRect();
    [state.originX, state.originY] = toField(
      box.left + box.width / 2,
      box.top + box.height * ORIGIN_DEPTH,
      rect,
    );
    const aspect = heroW / heroH;
    maxRadius =
      Math.max(
        Math.hypot(state.originX, state.originY),
        Math.hypot(aspect - state.originX, state.originY),
        Math.hypot(state.originX, 1 - state.originY),
        Math.hypot(aspect - state.originX, 1 - state.originY),
      ) + 0.2;
    if (!developing) state.radius = maxRadius;
  };

  // The photo is shielded from the scroll flood (it never inverts), but the
  // pointer trail still paints over it. The shield is the portrait's own
  // silhouette mask, rasterised at the size it renders.
  const maskImage = canvas.dataset.heroMask ? new Image() : null;
  let maskReady = false;
  const placeShield = (): void => {
    if (!maskImage || !maskReady || developing) return;
    const rect = hero.getBoundingClientRect();
    const box = portrait.getBoundingClientRect();
    const left = box.left - rect.left + box.width * MASK_LEFT;
    const top = box.top - rect.top + box.width * MASK_TOP;
    const width = box.width * MASK_WIDTH;
    const height = box.height * MASK_HEIGHT;
    // Rasterised at the canvas' own pixel density so its anti-aliasing lines
    // up with the CSS mask's.
    const scale = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const raster = document.createElement('canvas');
    raster.width = Math.max(1, Math.round(width * scale));
    raster.height = Math.max(1, Math.round(height * scale));
    raster.getContext('2d')?.drawImage(maskImage, 0, 0, raster.width, raster.height);
    field.setShieldImage(raster);
    state.shield = [left / heroH, 1 - top / heroH, width / heroH, height / heroH];
    state.shieldOn = 1;
  };
  if (maskImage && canvas.dataset.heroMask) {
    maskImage.src = canvas.dataset.heroMask;
    maskImage
      .decode()
      .then(() => {
        maskReady = true;
        placeShield();
      })
      .catch(() => undefined);
  }

  const resize = (): void => {
    if (hero.clientWidth === heroW && hero.clientHeight === heroH) return;
    heroW = hero.clientWidth;
    heroH = Math.max(hero.clientHeight, 1);
    field.resize(heroW, heroH);
    letters.measure();
    placeOrigin();
    placeShield();
  };
  resize();

  const ctx = gsap.context(() => {});

  // ── Act 1: develop ─────────────────────────────────────────────────────
  const startPlay = (): void => {
    // The mask was only for the rise; the letters now move freely.
    ctx.add(() => gsap.set(nameWrap, { overflow: 'visible' }));
    letters.measure();
    playing = true;
  };

  if (develop) {
    ctx.add(() => {
      const rect = hero.getBoundingClientRect();
      const reach = (box: DOMRect): number => {
        const [x, y] = toField(box.left + box.width / 2, box.top + box.height / 2, rect);
        return Math.hypot(x - state.originX, y - state.originY);
      };
      let risen = 0;
      const queue = chars.map((el) => ({
        dist: reach(el.getBoundingClientRect()),
        rise: () =>
          ctx.add(() =>
            gsap.to(el, {
              yPercent: 0,
              rotation: 0,
              duration: 1.1,
              ease: 'back.out(1.4)',
              onComplete: () => {
                risen += 1;
                if (risen === chars.length) startPlay();
              },
            }),
          ),
      }));

      gsap.set(chars, { yPercent: 110, rotation: 10, transformOrigin: '50% 100%' });
      gsap.set(portrait, { y: 30, scale: 1.04 });
      gsap.set(fades, { opacity: 0, y: 12 });
      state.radius = -0.06;
      // The drop is white ink; the photo develops inside it as it spreads.
      state.milk = 1;
      // Cover mode: the canvas sits on top and paints the dark ground itself,
      // so the photo is only ever seen as the white drop uncovers it.
      canvas.dataset.cover = '';

      let fadesShown = false;
      const showFades = (): void => {
        if (fadesShown) return;
        fadesShown = true;
        // clearProps: the header's own hide/show transition uses `transform`.
        ctx.add(() =>
          gsap.to(fades, {
            opacity: 1,
            y: 0,
            stagger: 0.06,
            duration: 0.6,
            clearProps: 'transform,opacity',
          }),
        );
      };
      const release = (all: boolean): void => {
        for (let i = queue.length - 1; i >= 0; i--) {
          const item = queue[i];
          if (item && (all || state.radius + DEVELOP_LEAD >= item.dist)) {
            item.rise();
            queue.splice(i, 1);
          }
        }
      };

      // Splash: droplets thrown out around the drop as it lands; the spreading
      // drop swallows them again (they fuse through the shader's smooth min).
      const splash = Array.from({ length: DROP_COUNT }, (_, i) => ({
        angle: (i / DROP_COUNT) * Math.PI * 2 + gsap.utils.random(-0.45, 0.45),
        dist: 0,
        r: 0,
        to: gsap.utils.random(0.1, 0.3),
        size: gsap.utils.random(0.012, 0.036),
      }));
      const syncDrops = (): void => {
        splash.forEach((drop, i) => {
          state.drops[i * 3] = state.originX + Math.cos(drop.angle) * drop.dist;
          state.drops[i * 3 + 1] = state.originY + Math.sin(drop.angle) * drop.dist;
          state.drops[i * 3 + 2] = drop.r;
        });
      };

      const timeline = gsap.timeline({ delay: DROP_DELAY, onUpdate: syncDrops });
      // The drop lands…
      timeline.to(state, { radius: DROP_RADIUS, duration: 0.45, ease: 'expo.out' }, 0);
      splash.forEach((drop, i) => {
        timeline.fromTo(
          drop,
          { dist: 0.03, r: 0 },
          { dist: drop.to, r: drop.size, duration: 0.55, ease: 'power3.out' },
          0.04 + i * 0.015,
        );
      });
      timeline.to(
        portrait,
        { y: 0, scale: 1, duration: 2, ease: 'expo.out', clearProps: 'transform' },
        0,
      );
      // …then soaks outward and uncovers the hero.
      const spread: gsap.core.Tween = gsap.to(state, {
        radius: () => maxRadius,
        duration: DEVELOP_DURATION,
        ease: 'power2.inOut',
        onUpdate: () => {
          release(false);
          if (spread.progress() > 0.7) showFades();
        },
        onComplete: () => {
          release(true);
          showFades();
          state.drops.fill(0);
          state.milk = 0;
          // The ground is clear: switch to negative mode (behind the photo,
          // `difference`) for the pointer trail and the scroll flood.
          delete canvas.dataset.cover;
          field.setInk(inks.negative);
          developing = false;
          placeShield();
        },
      });
      timeline.add(spread, 0.6);
      timeline.to(state, { milk: 0, duration: 1.1, ease: 'power2.inOut' }, 0.85);
    });
  } else {
    state.radius = maxRadius;
    startPlay();
  }

  // ── Act 3: flood (scroll-linked) ──────────────────────────────────────
  const headerShare = (): number => (header ? header.offsetHeight / heroH : 0);
  const flood = ctx.add(() =>
    gsap.fromTo(
      state,
      { level: FLOOD_FROM },
      {
        level: FLOOD_TO,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: window.matchMedia(SMOOTH_SCROLL).matches ? true : 0.5,
        },
        onUpdate: () => {
          if (!header || headerTheme !== 'light') return;
          // The viewport top sits at height 1 − progress of the hero. (Read
          // from the layout: this also runs while the tween is being created.)
          const progress = gsap.utils.clamp(0, 1, -hero.getBoundingClientRect().top / heroH);
          const theme = state.level > 1 - progress - headerShare() / 2 ? 'dark' : 'light';
          if (header.dataset.theme !== theme) header.dataset.theme = theme;
        },
      },
    ),
  );

  // ── Act 2: pointer ink + letters, every frame ─────────────────────────
  let pointer: { x: number; y: number } | null = null;
  let previous: { x: number; y: number } | null = null;
  let lastStroke = Number.NEGATIVE_INFINITY;
  const velocity = { x: 0, y: 0 };
  let scrollVelocity = 0;

  const onMove = (event: PointerEvent): void => {
    pointer = { x: event.clientX, y: event.clientY };
  };
  const onDown = (event: PointerEvent): void => {
    if (event.pointerType === 'mouse') return;
    const rect = hero.getBoundingClientRect();
    const [x, y] = toField(event.clientX, event.clientY, rect);
    field.stroke(x, y, x, y, STROKE_RADIUS * 2.4, STROKE_STRENGTH);
    lastStroke = gsap.ticker.time;
  };
  const onEnd = (event: PointerEvent): void => {
    if (
      event.type === 'pointerout' ? event.relatedTarget === null : event.pointerType !== 'mouse'
    ) {
      pointer = null;
    }
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onDown, { passive: true });
  window.addEventListener('pointerup', onEnd, { passive: true });
  window.addEventListener('pointercancel', onEnd, { passive: true });
  document.addEventListener('pointerout', onEnd, { passive: true });

  const tick = (time: number, deltaMs: number): void => {
    if (!visible) return;
    const dt = Math.min(deltaMs / 1000, 1 / 30) || 1 / 60;
    const rect = hero.getBoundingClientRect();

    let sample: PointerSample | null = null;
    if (pointer) {
      const from = previous ?? pointer;
      const dx = pointer.x - from.x;
      const dy = pointer.y - from.y;
      velocity.x = lerp(velocity.x, dx / dt, 0.35);
      velocity.y = lerp(velocity.y, dy / dt, 0.35);
      sample = {
        x: pointer.x - rect.left,
        y: pointer.y - rect.top,
        vx: velocity.x,
        vy: velocity.y,
      };
      const distance = Math.hypot(dx, dy);
      if (distance > 0.5 && sample.y > -heroH * 0.1 && sample.y < heroH * 1.1) {
        const speed = distance / heroH / dt;
        const [ax, ay] = toField(from.x, from.y, rect);
        const [bx, by] = toField(pointer.x, pointer.y, rect);
        const radius = STROKE_RADIUS + Math.min(speed, 2.5) * STROKE_GROWTH;
        field.stroke(ax, ay, bx, by, radius, STROKE_STRENGTH);
        lastStroke = time;
      }
      previous = { ...pointer };
    } else {
      previous = null;
      velocity.x = 0;
      velocity.y = 0;
    }

    const scroll = flood.scrollTrigger?.getVelocity() ?? 0;
    scrollVelocity = lerp(scrollVelocity, scroll, 0.15);
    state.wave = lerp(state.wave, Math.min(Math.abs(scroll) / 6000, 1) * MAX_WAVE, 0.1);

    if (playing) letters.update(dt, sample, scrollVelocity);

    const busy = developing || state.level > FLOOD_FROM + 0.01 || time - lastStroke < IDLE_AFTER;
    if (busy) field.render(time, dt * 60);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(hero);
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
  });
  visibility.observe(hero);

  // First frame: fully inked when developing (matches the CSS start overlay).
  field.render(gsap.ticker.time, 1);
  gsap.ticker.add(tick);

  return () => {
    gsap.ticker.remove(tick);
    resizeObserver.disconnect();
    visibility.disconnect();
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointerup', onEnd);
    window.removeEventListener('pointercancel', onEnd);
    document.removeEventListener('pointerout', onEnd);
    letters.destroy();
    ctx.revert();
    field.destroy();
    if (header && headerTheme) header.dataset.theme = headerTheme;
  };
}
