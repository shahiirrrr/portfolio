/**
 * Footer wordmark (owner-requested; Figma intentionally not updated). When the
 * wordmark scrolls into view the S peeks in at the right edge and a line figure
 * (FooterMascot) drops in. He winds up and throws a lasso: the loop opens in
 * flight, drops over the S, cinches and winds a second turn round it. He turns
 * his back, shoulders the rope and leans into it, trudging left step by step
 * while the chain of letters lurches in behind him. He drops the rope, hops
 * along the letter tops to the R (each letter lights up white as he lands),
 * turns, hops back to the I — which dims as he lands — and sits on its edge,
 * legs swinging and looking about while the footer is on screen.
 *
 * The figure is posed by tweening joint angles and writing SVG
 * `rotate(a cx cy)` attributes each tick (local coordinates, so nested joints
 * stay correct); facing left is a horizontal flip of the drawing, and feet are
 * kept on the surface by measuring the pose. The rope is SVG paths rebuilt each
 * tick: the line (hand → shoulder → S) and two turns round the S, whose back
 * halves sit behind the letters. Positions come from the laid-out letters and
 * the font's cap height, so it fits every width.
 * Reduced motion: the end state, without the journey.
 */
import { gsap, MOTION_OK, MOTION_REDUCED, ScrollTrigger } from './core.ts';

type Joint =
  'body' | 'head' | 'armF' | 'foreF' | 'armB' | 'foreB' | 'thighF' | 'shinF' | 'thighB' | 'shinB';

type Pose = Record<Joint, number> & {
  /** 1 = feet kept on the surface below, 0 = free (airborne, sitting). */
  ground: number;
};

type Pair = [number, number];

/**
 * Joint angles in degrees, clockwise, in the figure's own facing-right frame.
 * Body / head: + leans forward. Limbs: − swings forward. Forearm / shin are
 * relative to the upper limb (− bends the elbow forward, + bends the knee).
 */
const pose = (
  body: number,
  head: number,
  [armF, foreF]: Pair,
  [armB, foreB]: Pair,
  [thighF, shinF]: Pair,
  [thighB, shinB]: Pair,
  ground = 1,
): Pose => ({ body, head, armF, foreF, armB, foreB, thighF, shinF, thighB, shinB, ground });

const STAND = pose(0, 0, [4, -14], [-4, -10], [0, 0], [0, 0]);
const LANDED = pose(18, -8, [-40, -30], [-30, -30], [-44, 88], [-34, 80]);
const WIND_UP = pose(-14, -8, [150, -40], [-60, -20], [-26, 6], [16, 14]);
const THROW = pose(16, 6, [-95, -10], [40, -30], [-34, 18], [24, 10]);
const FOLLOW = pose(10, 0, [-70, -10], [30, -20], [-30, 14], [20, 12]);
const YANK = pose(-18, -6, [-60, -50], [-50, -60], [-30, 8], [14, 10]);
// Hauling with the rope over the shoulder: forearms folded back to grip it at
// the chest. Walk cycle: contact (A: near leg forward) → passing → contact (B).
const GRIP = { armF: -120, foreF: 105, armB: -112, foreB: 98 } as const;
const HAUL_CA = { ...pose(38, -12, [0, 0], [0, 0], [-36, 14], [30, 20]), ...GRIP };
const HAUL_PA = { ...pose(33, -6, [0, 0], [0, 0], [4, 2], [-22, 58]), ...GRIP };
const HAUL_CB = { ...pose(38, -12, [0, 0], [0, 0], [30, 20], [-36, 14]), ...GRIP };
const HAUL_PB = { ...pose(33, -6, [0, 0], [0, 0], [-22, 58], [4, 2]), ...GRIP };
const PHEW = pose(-8, -12, [30, -110], [25, -110], [-6, 4], [6, 4]);
const CROUCH = pose(22, -10, [40, -20], [30, -20], [-50, 95], [-40, 90]);
const TAKEOFF = pose(4, -4, [-150, -10], [-140, -10], [-8, 8], [18, 14], 0);
const AIR = pose(-4, 0, [-165, -20], [-155, -20], [-60, 80], [-42, 72], 0);
const REACH = pose(6, 0, [-120, -20], [-110, -20], [-24, 20], [-10, 16], 0);
const SIT = pose(-6, 4, [28, -30], [22, -26], [-88, 92], [-84, 96], 0);

// Figure geometry on its 60 × 120 grid (see FooterMascot.astro).
const HIP = { x: 30, y: 72 };
const KNEE_Y = 95;
const NECK_Y = 38;
const SHOULDER_Y = 44;
const ELBOW_Y = 58;
// Where the rope rests: on top of the shoulder, a little behind the neck (clear of the head).
const ROPE_SHOULDER = { x: 26, y: 42 };
const UPPER_ARM = ELBOW_Y - SHOULDER_Y;
const FOREARM = 13;
const THIGH = KNEE_Y - HIP.y;
const SHIN = 22;
const FOOT_Y = 117;
const STROKE = 5;
const GRID_H = 120;

const JOINT_ORIGIN: Record<Joint, string> = {
  body: `${HIP.x} ${HIP.y}`,
  head: `${HIP.x} ${NECK_Y}`,
  armF: `${HIP.x} ${SHOULDER_Y}`,
  foreF: `${HIP.x} ${ELBOW_Y}`,
  armB: `${HIP.x} ${SHOULDER_Y}`,
  foreB: `${HIP.x} ${ELBOW_Y}`,
  thighF: `${HIP.x} ${HIP.y}`,
  shinF: `${HIP.x} ${KNEE_Y}`,
  thighB: `${HIP.x} ${HIP.y}`,
  shinB: `${HIP.x} ${KNEE_Y}`,
};
const JOINTS = Object.keys(JOINT_ORIGIN) as Joint[];

const rad = (deg: number): number => (deg * Math.PI) / 180;
const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

/** Lowest foot point (grid units) for a pose, to keep feet on the surface. */
function footY(p: Pose): number {
  const leg = (thigh: number, shin: number): number =>
    HIP.y + THIGH * Math.cos(rad(thigh)) + SHIN * Math.cos(rad(thigh + shin));
  return Math.max(leg(p.thighF, p.shinF), leg(p.thighB, p.shinB));
}

interface Layout {
  /** Ink box of each letter, in px from the wordmark's left edge (untransformed). */
  ink: { left: number; right: number; center: number }[];
  baseline: number;
  capTop: number;
  capH: number;
  /** Figure box and px per grid unit. */
  w: number;
  h: number;
  u: number;
}

function measure(
  stage: HTMLElement,
  letters: HTMLElement[],
  probe: HTMLElement,
  mascot: HTMLElement,
): Layout {
  const cs = getComputedStyle(stage);
  const fontSize = parseFloat(cs.fontSize);
  const ctx = document.createElement('canvas').getContext('2d');
  if (ctx) ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const metrics = (text: string): { ascent: number; left: number; right: number } => {
    const m = ctx?.measureText(text);
    return {
      ascent: m?.actualBoundingBoxAscent || fontSize * 0.72,
      left: m?.actualBoundingBoxLeft ?? 0,
      right: m?.actualBoundingBoxRight || fontSize * 0.6,
    };
  };
  const capH = metrics('H').ascent;
  const baseline = probe.offsetTop;
  const ink = letters.map((el) => {
    const m = metrics(el.textContent ?? '');
    const left = el.offsetLeft - m.left;
    const right = el.offsetLeft + m.right;
    return { left, right, center: (left + right) / 2 };
  });
  const h = mascot.offsetHeight;
  return { ink, baseline, capTop: baseline - capH, capH, w: mascot.offsetWidth, h, u: h / GRID_H };
}

/** An ellipse (one turn of rope round the S) in wordmark px. */
interface Band {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export function initFooterWordmark(stage: HTMLElement): () => void {
  const letters = [...stage.querySelectorAll<HTMLElement>('[data-letter]')];
  const probe = stage.querySelector<HTMLElement>('[data-baseline]');
  const mascot = stage.querySelector<HTMLElement>('[data-mascot]');
  const svg = mascot?.querySelector<SVGSVGElement>('svg');
  const rope = stage.querySelector<SVGSVGElement>('[data-rope]');
  const ropeBack = stage.querySelector<SVGSVGElement>('[data-rope-back]');
  const line = rope?.querySelector<SVGPathElement>('[data-rope-line]');
  const fronts = [...(rope?.querySelectorAll<SVGPathElement>('[data-band-front]') ?? [])];
  const backs = [...(ropeBack?.querySelectorAll<SVGPathElement>('[data-band-back]') ?? [])];
  const first = letters[0];
  const seatIndex = letters.findLastIndex((el) => el.textContent === 'I');
  const seat = letters[seatIndex];
  if (!probe || !mascot || !svg || !rope || !ropeBack || !line || !first || !seat) {
    return () => {};
  }
  const ropes = [rope, ropeBack];

  const joints = Object.fromEntries(
    JOINTS.map((name) => [name, svg.querySelector<SVGGElement>(`[data-joint="${name}"]`)]),
  );
  const current: Pose = { ...STAND };
  /**
   * Rope state. `t`: flight of the lasso (0 in hand → 1 over the S). `lift`:
   * the loop's looseness (1 open above the S → 0 cinched round its middle).
   * `wraps`: turns drawn round the S (0–2). `sag`: dip as a share of length.
   */
  const rig = { on: false, t: 0, lift: 1, wraps: 1, sag: 0.12, shoulder: false };
  // Letters he lands on light up; the I goes back to the dim wordmark colour as he settles on it.
  const lit = getComputedStyle(stage).getPropertyValue('--color-text').trim() || 'currentColor';
  const dim = getComputedStyle(stage).color;
  let layout = measure(stage, letters, probe, mascot);

  /** A point on the figure (grid units) in wordmark px, honouring the flip. */
  const toStage = (gx: number, gy: number, lift: number): { x: number; y: number } => {
    const flip = Number(gsap.getProperty(svg, 'scaleX'));
    return {
      x: Number(gsap.getProperty(mascot, 'x')) + (HIP.x + (gx - HIP.x) * flip) * layout.u,
      y: Number(gsap.getProperty(mascot, 'y')) + lift + gy * layout.u,
    };
  };

  /** A turn of rope round the S at a height: follows the letter's slide and tilt. */
  const band = (heightY: number, loose: number): Band => {
    const { capH, baseline } = layout;
    const ink = layout.ink[0];
    const halfW = ink ? (ink.right - ink.left) / 2 : capH * 0.4;
    const originX = (ink?.center ?? 0) + Number(gsap.getProperty(first, 'x'));
    const originY = baseline + Number(gsap.getProperty(first, 'y'));
    const r = rad(Number(gsap.getProperty(first, 'rotation')));
    const d = originY - heightY;
    return {
      cx: originX + d * Math.sin(r),
      cy: heightY + d * (1 - Math.cos(r)),
      rx: halfW * (1.04 + 0.36 * loose),
      ry: capH * (0.06 + 0.06 * loose),
    };
  };

  const f = (n: number): string => n.toFixed(1);

  /** Draws turn `k`, `p` (0–1) of the way round from the knot: back half, then front. */
  const drawBand = (k: number, b: Band, p: number): void => {
    const left = `${f(b.cx - b.rx)} ${f(b.cy)}`;
    const right = `${f(b.cx + b.rx)} ${f(b.cy)}`;
    const arc = `A${f(b.rx)} ${f(b.ry)} 0 0 1`;
    const halves: [SVGPathElement | undefined, string, number][] = [
      [backs[k], `M${left} ${arc} ${right}`, clamp01(p * 2)],
      [fronts[k], `M${right} ${arc} ${left}`, clamp01(p * 2 - 1)],
    ];
    for (const [path, d, shown] of halves) {
      path?.setAttribute('d', shown > 0 ? d : '');
      path?.setAttribute('stroke-dashoffset', String(1 - shown));
    }
  };

  const render = (): void => {
    for (const name of JOINTS) {
      joints[name]?.setAttribute(
        'transform',
        `rotate(${current[name].toFixed(2)} ${JOINT_ORIGIN[name]})`,
      );
    }
    const { u, capH, capTop, baseline } = layout;
    const lift = current.ground * (FOOT_Y - footY(current)) * u;
    svg.style.translate = `0 ${lift.toFixed(2)}px`;
    if (!rig.on) return;

    // Hand: shoulder swung round the hip by the body, then upper arm and forearm.
    const b = rad(current.body);
    const a1 = rad(current.body + current.armF);
    const a2 = rad(current.body + current.armF + current.foreF);
    const sx = HIP.x + (HIP.y - SHOULDER_Y) * Math.sin(b);
    const sy = HIP.y - (HIP.y - SHOULDER_Y) * Math.cos(b);
    const hand = toStage(
      sx - UPPER_ARM * Math.sin(a1) - FOREARM * Math.sin(a2),
      sy + UPPER_ARM * Math.cos(a1) + FOREARM * Math.cos(a2),
      lift,
    );
    const shoulder = toStage(
      HIP.x + (ROPE_SHOULDER.x - HIP.x) * Math.cos(b) + (HIP.y - ROPE_SHOULDER.y) * Math.sin(b),
      HIP.y + (ROPE_SHOULDER.x - HIP.x) * Math.sin(b) - (HIP.y - ROPE_SHOULDER.y) * Math.cos(b),
      lift,
    );

    // The loop: open above the S while it flies, cinched round its middle after.
    const cinchY = baseline - capH * 0.45;
    const looseY = capTop - capH * 0.15;
    const loop = band(cinchY + (looseY - cinchY) * rig.lift, rig.lift);
    let main = loop;
    let knot = { x: loop.cx - loop.rx, y: loop.cy };
    if (rig.t < 1) {
      // In flight the knot arcs from the hand towards the S, the loop opening behind it.
      const arc = Math.min(capH * 0.9, Math.abs(knot.x - hand.x) * 0.35);
      knot = {
        x: hand.x + (knot.x - hand.x) * rig.t,
        y: hand.y + (knot.y - hand.y) * rig.t - arc * Math.sin(Math.PI * rig.t),
      };
      const open = 0.3 + 0.7 * rig.t;
      main = { cx: knot.x + loop.rx * open, cy: knot.y, rx: loop.rx * open, ry: loop.ry * open };
    }
    drawBand(0, main, clamp01(rig.wraps));
    drawBand(1, band(main.cy + capH * 0.1, rig.lift), clamp01(rig.wraps - 1));

    const start = rig.shoulder ? shoulder : hand;
    const len = Math.hypot(knot.x - start.x, knot.y - start.y);
    const cx = (start.x + knot.x) / 2;
    const cy = (start.y + knot.y) / 2 + rig.sag * len;
    const lead = rig.shoulder ? `M${f(hand.x)} ${f(hand.y)} L` : 'M';
    line.setAttribute(
      'd',
      `${lead}${f(start.x)} ${f(start.y)} Q${f(cx)} ${f(cy)} ${f(knot.x)} ${f(knot.y)}`,
    );
  };

  const seatX = (l: Layout): number =>
    (l.ink[seatIndex]?.right ?? 0) - (THIGH - 4) * l.u - HIP.x * l.u;
  const seatY = (l: Layout): number => l.capTop - (HIP.y + STROKE / 2) * l.u;

  /** The end state: letters lit, the I dim, him sitting on its edge facing the R. */
  const sit = (): void => {
    layout = measure(stage, letters, probe, mascot);
    Object.assign(current, SIT);
    rig.on = false;
    gsap.set(ropes, { autoAlpha: 0 });
    gsap.set(letters, { color: lit });
    gsap.set(seat, { color: dim });
    gsap.set(svg, { scaleX: 1 });
    gsap.set(mascot, { x: seatX(layout), y: seatY(layout), autoAlpha: 1 });
    render();
  };

  const mm = gsap.matchMedia();

  mm.add(MOTION_OK, (context) => {
    let tl: gsap.core.Timeline | undefined;
    const idle: gsap.core.Timeline[] = [];
    let onScreen = false;
    const tick = (): void => {
      if (onScreen) render();
    };
    gsap.ticker.add(tick);

    // Letters wait beyond the right edge of the viewport.
    gsap.set(letters, { x: () => window.innerWidth, transformOrigin: '50% 100%' });

    const build = (): void => {
      layout = measure(stage, letters, probe, mascot);
      const { ink, baseline, capTop, capH, w, h } = layout;
      const width = stage.clientWidth;
      const groundY = baseline - h;
      const topY = capTop - h;
      const s0 = ink[0]?.left ?? 0;
      // The S peeks in at the right edge; he stands well left of it.
      const peek = width * 0.86 - s0;
      const startX = width * 0.42;
      const endX = s0 - w * 0.9;
      const steps = 6;
      const step = 0.56;

      Object.assign(current, AIR);
      Object.assign(rig, { on: false, t: 0, lift: 1, wraps: 1, sag: 0.12, shoulder: false });
      gsap.set(mascot, { x: startX, y: groundY - h * 1.2, autoAlpha: 0 });
      gsap.set(svg, { scaleX: 1 });

      tl = gsap.timeline({ onComplete: () => idle.forEach((t) => t.play()) });

      // The S slides into view; he drops in, absorbs the landing and squares up.
      tl.to(letters, { x: peek, duration: 0.8, ease: 'power3.out', stagger: 0.03 })
        .to(mascot, { y: groundY, autoAlpha: 1, duration: 0.45, ease: 'power2.in' }, 0.25)
        .to(current, { ...REACH, duration: 0.3, ease: 'power1.in' }, 0.4)
        .to(current, { ...LANDED, duration: 0.12, ease: 'power2.out' }, 0.7)
        .to(current, { ...STAND, duration: 0.45, ease: 'back.out(1.8)' })

        // Wind up, step in and throw; the loop opens as it flies.
        .to(current, { ...WIND_UP, duration: 0.5, ease: 'power2.inOut' }, '+=0.15')
        .call(() => {
          rig.on = true;
        })
        .set(ropes, { autoAlpha: 1 })
        .addLabel('throw')
        .to(current, { ...THROW, duration: 0.18, ease: 'power3.out' }, 'throw')
        .to(current, { ...FOLLOW, duration: 0.4, ease: 'power2.out' }, 'throw+=0.18')
        .to(rig, { t: 1, duration: 0.6, ease: 'power1.out' }, 'throw')

        // The loop drops over the S and he yanks it tight: it cinches, the S
        // jolts, and the rope winds a second turn round it.
        .addLabel('cinch')
        .to(rig, { lift: 0, duration: 0.35, ease: 'power2.in' }, 'cinch')
        .to(current, { ...YANK, duration: 0.22, ease: 'power3.out' }, 'cinch+=0.25')
        .to(rig, { sag: 0.04, duration: 0.2, ease: 'power2.out' }, 'cinch+=0.25')
        .to(
          first,
          {
            keyframes: [
              { rotation: -8, duration: 0.1, ease: 'power2.out' },
              { rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.35)' },
            ],
          },
          'cinch+=0.3',
        )
        .to(rig, { wraps: 2, duration: 0.45, ease: 'power1.inOut' }, 'cinch+=0.45')
        .to(current, { ...STAND, duration: 0.3, ease: 'power2.out' }, 'cinch+=0.6')

        // Turn his back to it, shoulder the rope and take the strain.
        .to(svg, { scaleX: -1, duration: 0.26, ease: 'power2.inOut' }, '+=0.1')
        .call(
          () => {
            rig.shoulder = true;
          },
          undefined,
          '<+=0.13',
        )
        .to(current, { ...HAUL_CA, duration: 0.45, ease: 'power2.out' }, '<')
        .to(rig, { sag: 0.01, duration: 0.35, ease: 'power2.in' }, '<+=0.1');

      // Walk cycle: passing then contact each step; the letters surge in on the push.
      for (let k = 0; k < steps; k++) {
        const last = k === steps - 1;
        const remaining = 1 - (k + 1) / steps;
        const at = `step${k}`;
        const [passing, contact] = k % 2 ? [HAUL_PB, HAUL_CA] : [HAUL_PA, HAUL_CB];
        tl.addLabel(at, k === 0 ? '+=0.05' : '>')
          .to(current, { ...passing, duration: step / 2, ease: 'sine.out' }, at)
          .to(current, { ...contact, duration: step / 2, ease: 'sine.in' }, `${at}+=${step / 2}`)
          .to(
            mascot,
            { x: endX + (startX - endX) * remaining, duration: step, ease: 'power1.inOut' },
            at,
          )
          .to(
            letters,
            {
              x: peek * remaining,
              duration: last ? 0.9 : step,
              ease: last ? 'back.out(1.5)' : 'power2.out',
              stagger: 0.04,
            },
            `${at}+=${step * 0.2}`,
          )
          .to(
            letters,
            {
              keyframes: [
                { rotation: 5, duration: 0.14, ease: 'power2.out' },
                { rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.45)' },
              ],
              stagger: 0.04,
            },
            `${at}+=${step * 0.2}`,
          );
      }

      // Drop the rope (the loop slackens and slips), turn back round, phew.
      tl.addLabel('drop', '+=0.2')
        .to(rig, { sag: 0.4, lift: 0.3, duration: 0.4, ease: 'power2.in' }, 'drop')
        .to(ropes, { autoAlpha: 0, duration: 0.3 }, 'drop+=0.2')
        .call(
          () => {
            rig.on = false;
          },
          undefined,
          'drop+=0.5',
        )
        .to(current, { ...STAND, duration: 0.3, ease: 'power2.out' }, 'drop')
        .to(svg, { scaleX: 1, duration: 0.26, ease: 'power2.inOut' }, 'drop+=0.1')
        .to(current, { ...PHEW, duration: 0.4, ease: 'power2.out' }, 'drop+=0.4')
        .to(current, { ...STAND, duration: 0.35, ease: 'power2.inOut' }, '+=0.35');

      // Hop along the letter tops to the R, lighting each one, then turn and
      // hop back to the I, which dims as he lands on it.
      const route = [...letters.keys()];
      if (seatIndex < letters.length - 1) route.push(seatIndex);
      const air = 0.5;
      let fromY = groundY;
      let prev = -1;
      route.forEach((index, k) => {
        const letter = letters[index];
        const revisit = route.slice(0, k).includes(index);
        const toX = (ink[index]?.center ?? 0) - w / 2;
        const peak = Math.min(fromY, topY) - h * 0.35;
        const at = `hop${k}`;
        if (index < prev) tl?.to(svg, { scaleX: -1, duration: 0.2, ease: 'power2.inOut' });
        tl?.to(current, { ...CROUCH, duration: 0.18, ease: 'power2.out' })
          .addLabel(at)
          .to(current, { ...TAKEOFF, duration: 0.1, ease: 'power2.out' }, at)
          .to(current, { ...AIR, duration: 0.18, ease: 'power1.inOut' }, `${at}+=0.1`)
          .to(current, { ...REACH, duration: 0.14, ease: 'power1.in' }, `${at}+=${air - 0.16}`)
          .to(mascot, { x: toX, duration: air, ease: 'power1.inOut' }, at)
          .to(mascot, { y: peak, duration: air / 2, ease: 'power2.out' }, at)
          .to(mascot, { y: topY, duration: air / 2, ease: 'power2.in' }, `${at}+=${air / 2}`)
          .to(current, { ...LANDED, duration: 0.12, ease: 'power2.out' }, `${at}+=${air}`);
        if (letter) {
          tl?.to(
            letter,
            { color: revisit ? dim : lit, duration: 0.3, ease: 'power1.out' },
            `${at}+=${air}`,
          ).to(
            letter,
            {
              keyframes: [
                { y: capH * 0.03, duration: 0.08, ease: 'power2.out' },
                { y: 0, duration: 0.45, ease: 'elastic.out(1, 0.4)' },
              ],
            },
            `${at}+=${air}`,
          );
        }
        fromY = topY;
        prev = index;
      });

      // Face the R again and sit down on the edge of the I.
      tl.to(current, { ...STAND, duration: 0.25, ease: 'power2.out' }, '+=0.05')
        .to(svg, { scaleX: 1, duration: 0.2, ease: 'power2.inOut' }, '<')
        .to(mascot, { x: seatX(layout), y: seatY(layout), duration: 0.4, ease: 'power2.inOut' })
        .to(current, { ...SIT, duration: 0.4, ease: 'power2.inOut' }, '<')
        .to(current, { body: -12, duration: 0.15, ease: 'power2.out' })
        .to(current, { body: SIT.body, duration: 0.5, ease: 'elastic.out(1, 0.5)' });

      // Sitting: legs swing out of phase, he breathes and looks about now and then.
      const loop = { paused: true, repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } };
      idle.push(
        gsap
          .timeline(loop)
          .to(current, { shinF: SIT.shinF - 26, shinB: SIT.shinB + 14, duration: 0.9 }),
        gsap.timeline(loop).to(current, { body: SIT.body - 4, duration: 1.6 }),
        gsap
          .timeline({ paused: true, repeat: -1, repeatDelay: 2.4 })
          .to(current, { head: -16, duration: 0.5, ease: 'power2.inOut' })
          .to(current, { head: 10, duration: 0.6, ease: 'power2.inOut' }, '+=0.8')
          .to(current, { head: SIT.head, duration: 0.5, ease: 'power2.inOut' }, '+=0.6'),
      );
    };

    ScrollTrigger.create({
      trigger: stage,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        onScreen = self.isActive;
        if (tl?.progress() !== 1) return;
        for (const t of idle) {
          if (onScreen) t.play();
          else t.pause();
        }
      },
    });

    ScrollTrigger.create({
      trigger: stage,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        void document.fonts.ready.then(() => context.add(build));
      },
    });

    // Re-fit after a resize: finish the show and re-seat him on the I.
    let resizeCall: gsap.core.Tween | undefined;
    const onResize = (): void => {
      resizeCall?.kill();
      resizeCall = gsap.delayedCall(0.2, () => {
        if (!tl) return;
        tl.progress(1);
        sit();
      });
    };
    window.addEventListener('resize', onResize);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener('resize', onResize);
      resizeCall?.kill();
      rig.on = false;
      svg.style.translate = '';
    };
  });

  mm.add(MOTION_REDUCED, () => {
    void document.fonts.ready.then(sit);
    window.addEventListener('resize', sit);
    return () => window.removeEventListener('resize', sit);
  });

  return () => mm.revert();
}
