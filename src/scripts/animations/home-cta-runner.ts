/**
 * Home CTA "headline runner" (owner-requested; Figma intentionally not
 * updated). A pixel figure runs along the tops of the letters of "Let's build
 * something real.", then the email address — the CTA's own text is the level
 * (home-cta-runner-level.ts). He runs on his own; Space / ↑ / tap jumps (hold
 * for higher). Taller letters block him until he jumps, a gap between words
 * drops him out, and the end of a line returns him to the start of the next
 * like a carriage return (after the headline, a drop through the open space
 * onto the email). From the end of the email he leaps to the "Start a project"
 * button (or drops onto it, on mobile); landing there is the finish, and the
 * button gets a pixel selection box. Eight floating pixels are optional
 * pickups. A finished run offers a mailto with the time in the subject.
 *
 * Canvas 2D above the headline (pointer-events: none); HUD in the DOM.
 * Renders only while on screen. Reduced motion or no JS: no game.
 */
import { gsap, MOTION_OK } from './core.ts';
import { buildLevel, groundUnder, type Level, type Line } from './home-cta-runner-level.ts';

const SPRITES = {
  idle: [
    '..###..',
    '..###..',
    '...#...',
    '.#####.',
    '#.###.#',
    '..###..',
    '..#.#..',
    '..#.#..',
    '.##.##.',
  ],
  runA: [
    '..###..',
    '..###..',
    '...#...',
    '.####..',
    '#.###.#',
    '..###..',
    '.#..#..',
    '#....#.',
    '.....##',
  ],
  runB: [
    '..###..',
    '..###..',
    '...#...',
    '..####.',
    '#.###.#',
    '..###..',
    '..##...',
    '..#.#..',
    '.##..#.',
  ],
  jump: [
    '..###..',
    '..###..',
    '#..#..#',
    '.#####.',
    '..###..',
    '..###..',
    '.#...#.',
    '#.....#',
    '.......',
  ],
} as const;
const SPRITE_COLS = 7;
const SPRITE_ROWS = 9;

// Physics in headline ems, so the game plays the same at every width.
const SPEED = 2.4; // em/s
const GRAVITY = 10; // em/s²
const JUMP = 2.9; // em/s → peak ≈ 0.42em
const JUMP_CUT = 0.45; // velocity kept when the jump is released early
const STEP = 0.06; // em the runner climbs or drops without jumping
const FALL_LIMIT = 0.5; // em below the baseline = fell out
const COYOTE = 0.09; // s after leaving an edge that a jump still counts
const BUFFER = 0.12; // s a jump pressed just before landing is kept
const PICKUPS = 8;
const BEST_KEY = 'cta-runner-best';

type Phase = 'idle' | 'playing' | 'fell' | 'won';

interface Pickup {
  line: number;
  x: number;
  y: number;
  takenAt: number;
}

const readBest = (): number | null => {
  try {
    const value = Number(localStorage.getItem(BEST_KEY));
    return value > 0 ? value : null;
  } catch {
    return null;
  }
};
const saveBest = (time: number): void => {
  try {
    localStorage.setItem(BEST_KEY, String(time));
  } catch {
    // Storage unavailable (private mode): the best time just isn't kept.
  }
};

export function initCtaRunner(panel: HTMLElement): () => void {
  const canvas = panel.querySelector<HTMLCanvasElement>('[data-runner]');
  const headline = panel.querySelector<HTMLElement>('[data-runner-level]');
  const emailText = panel.querySelector<HTMLElement>('[data-runner-email]');
  const finishLine = panel.querySelector<HTMLElement>('[data-runner-finish]');
  const hud = panel.querySelector<HTMLElement>('[data-runner-hud]');
  const status = panel.querySelector<HTMLElement>('[data-runner-status]');
  const play = panel.querySelector<HTMLButtonElement>('[data-runner-play]');
  const playLabel = panel.querySelector<HTMLElement>('[data-runner-play-label]');
  const send = panel.querySelector<HTMLAnchorElement>('[data-runner-send]');
  const announce = panel.querySelector<HTMLElement>('[data-runner-announce]');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx || !headline || !hud || !status || !play || !send) return () => {};

  const email = panel.dataset.email ?? '';
  const styles = getComputedStyle(panel);
  const ink = styles.getPropertyValue('--color-text').trim();
  const outline = styles.getPropertyValue('--color-bg').trim();

  let level: Level | null = null;
  let unit = 4;
  let phase: Phase = 'idle';
  let clock = 0;
  let runTime = 0;
  let pickups: Pickup[] = [];
  let shownStatus = '';
  let endedAt = 0;

  const runner = {
    line: 0,
    x: 0,
    y: 0,
    vy: 0,
    grounded: true,
    airTime: 0,
    buffered: 0,
    /** Mid-leap to the finish: the arc is fixed, so releasing the key can't cut it short. */
    leaping: false,
  };
  const width = (): number => SPRITE_COLS * unit;
  const height = (): number => SPRITE_ROWS * unit;
  const feet = (x: number): [number, number] => [x + unit, x + width() - unit];

  const setStatus = (text: string): void => {
    if (text === shownStatus) return;
    shownStatus = text;
    status.textContent = text;
  };
  const say = (text: string): void => {
    if (announce) announce.textContent = text;
  };
  const idleStatus = (): void => {
    const best = readBest();
    setStatus(best ? `BEST ${best.toFixed(1)}s` : '');
  };

  /**
   * Spread the pickups a jump above the letters, only over open sky: a pickup
   * above a line that sits just under another would read as punctuation in the
   * line above ("Let's." / "something·real"), so such a line only gets the
   * stretch that reaches past the end of the line above. None on the finish.
   */
  const placePickups = (lines: Line[], em: number): Pickup[] => {
    const spans = lines.flatMap((line, index) => {
      if (line.finish) return [];
      const above = lines[index - 1];
      const close = above && above.baseline > line.top - em * 0.5;
      const from = close ? Math.max(line.left, above.right + em * 0.4) : line.left;
      return line.right - from > em * 0.5 ? [{ index, from, to: line.right }] : [];
    });
    const total = spans.reduce((sum, span) => sum + span.to - span.from, 0);
    return Array.from({ length: PICKUPS }, (_, i) => {
      let along = ((i + 0.5) / PICKUPS) * total;
      let span = spans[0];
      for (const candidate of spans) {
        span = candidate;
        const length = candidate.to - candidate.from;
        if (along <= length) break;
        along -= length;
      }
      const line = span ? lines[span.index] : undefined;
      if (!span || !line) return { line: 0, x: 0, y: 0, takenAt: -1 };
      const x = span.from + along;
      // Measured over a wide window, so a pickup over a word gap still floats at letter height.
      const ground = groundUnder(line, x - em * 0.3, x + em * 0.3);
      const base = Number.isFinite(ground) ? ground : line.top;
      return { line: span.index, x, y: base - em * (0.34 + (i % 3) * 0.06), takenAt: -1 };
    });
  };

  const placeAtStart = (): void => {
    const first = level?.lines[0];
    if (!first) return;
    runner.line = 0;
    runner.x = first.left;
    const [a, b] = feet(runner.x);
    const ground = groundUnder(first, a, b);
    runner.y = Number.isFinite(ground) ? ground : first.top;
    runner.vy = 0;
    runner.grounded = true;
    runner.airTime = 0;
    runner.buffered = 0;
    runner.leaping = false;
  };

  const layout = (): void => {
    const rect = panel.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const texts = emailText ? [headline, emailText] : [headline];
    level = buildLevel(panel, texts, finishLine);
    if (!level) return;
    unit = Math.max(2, Math.round(level.em * 0.028));
    pickups = placePickups(level.lines, level.em);
    if (phase === 'playing') stop();
    placeAtStart();
  };

  const showHud = (mode: Phase): void => {
    play.hidden = mode === 'playing';
    send.hidden = mode !== 'won';
    if (playLabel)
      playLabel.textContent = { idle: 'Play', playing: '', fell: 'Retry', won: 'Play again' }[mode];
  };

  const start = (): void => {
    // The jump key released right after a fall lands on the focused Retry button: ignore it.
    if (!level || performance.now() - endedAt < 500) return;
    phase = 'playing';
    runTime = 0;
    for (const pickup of pickups) pickup.takenAt = -1;
    placeAtStart();
    showHud('playing');
    say('Running. Press Space or tap to jump; hold for a higher jump. Escape stops.');
  };

  const finish = (result: 'fell' | 'won'): void => {
    phase = result;
    endedAt = performance.now();
    const taken = pickups.filter((pickup) => pickup.takenAt >= 0).length;
    showHud(result);
    if (result === 'fell') {
      setStatus('FELL THROUGH THE KERNING');
      say('You fell between the words. Press Retry to run again.');
    } else {
      const time = runTime.toFixed(1);
      const best = readBest();
      if (!best || runTime < best) saveBest(Number(time));
      setStatus(`${time}s · ${taken}/${PICKUPS} PIXELS`);
      const subject = `I ran your headline in ${time}s (${taken}/${PICKUPS} pixels)`;
      send.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
      say(`Finished in ${time} seconds with ${taken} of ${PICKUPS} pixels.`);
    }
    play.focus({ preventScroll: true });
  };

  function stop(): void {
    phase = 'idle';
    showHud('idle');
    idleStatus();
    placeAtStart();
  }

  const jump = (): void => {
    if (phase === 'playing') runner.buffered = BUFFER;
  };
  const release = (): void => {
    if (phase === 'playing' && runner.vy < 0 && !runner.leaping) runner.vy *= JUMP_CUT;
  };

  const step = (dt: number): void => {
    if (!level) return;
    const line = level.lines[runner.line];
    if (!line) return;
    const { em } = level;
    runTime += dt;

    // Horizontal: run right until the front edge meets a letter taller than a step.
    const front = runner.x + width() - unit;
    const target = front + SPEED * em * dt;
    let blocked = false;
    for (let x = Math.ceil(front); x <= target; x += 1) {
      if ((line.surface[x] ?? Infinity) < runner.y - STEP * em) {
        runner.x = x - (width() - unit) - 0.01;
        blocked = true;
        break;
      }
    }
    if (!blocked) runner.x += SPEED * em * dt;

    // Safety net: never end up inside a letter — step back out to its left side.
    const [a0, b0] = feet(runner.x);
    for (let x = Math.floor(a0); x < b0; x += 1) {
      if ((line.surface[x] ?? Infinity) < runner.y - STEP * em) {
        runner.x = x - (width() - unit) - 0.01;
        break;
      }
    }

    // Vertical: gravity, landing, stepping and the jump (with coyote time + buffer).
    const [a, b] = feet(runner.x);
    const ground = groundUnder(line, a, b);
    runner.buffered = Math.max(0, runner.buffered - dt);
    if (runner.grounded) {
      if (!Number.isFinite(ground) || ground > runner.y + STEP * em) runner.grounded = false;
      else runner.y = ground;
    }
    runner.airTime = runner.grounded ? 0 : runner.airTime + dt;
    if (runner.buffered > 0 && runner.airTime < COYOTE) {
      runner.vy = -JUMP * em;
      runner.grounded = false;
      runner.airTime = COYOTE;
      runner.buffered = 0;
    }
    if (!runner.grounded) {
      runner.vy += GRAVITY * em * dt;
      const next = runner.y + runner.vy * dt;
      // Land on any surface within a step of the feet: in the air he may drift into a
      // column up to a step taller, which a 1px tolerance would let him sink through.
      const reach = ground + STEP * em + 1;
      if (runner.vy >= 0 && Number.isFinite(ground) && runner.y <= reach && next >= ground) {
        runner.y = ground;
        runner.vy = 0;
        runner.grounded = true;
        runner.leaping = false;
      } else {
        runner.y = next;
      }
    }

    // Pickups.
    for (const pickup of pickups) {
      if (pickup.takenAt >= 0 || pickup.line !== runner.line) continue;
      const near =
        pickup.x > runner.x - unit &&
        pickup.x < runner.x + width() + unit &&
        pickup.y > runner.y - height() - unit &&
        pickup.y < runner.y + unit;
      if (near) pickup.takenAt = clock;
    }

    // Out of the line: fell, the finish, or on to the next line.
    if (runner.y > line.baseline + FALL_LIMIT * em) {
      finish('fell');
      return;
    }
    const next = level.lines[runner.line + 1];
    const won = line.finish
      ? runner.grounded
      : !next && runner.x + width() / 2 >= line.right - unit;
    if (won) {
      finish('won');
      return;
    }
    if (next && runner.x > line.right + unit) {
      runner.line += 1;
      runner.grounded = false;
      if (next.left > runner.x + width()) {
        // The next platform lies ahead (the button, on desktop): a fixed arc onto it.
        const time = Math.max(0.35, (next.left + unit * 2 - runner.x) / (SPEED * em));
        runner.vy = (next.top - runner.y - 0.5 * GRAVITY * em * time * time) / time;
        runner.leaping = true;
      } else {
        // Carriage return: back to the left, dropping in from just under the line above
        // (onto the email, that is a fall through the open space between them).
        runner.x = next.left - unit;
        runner.y = Math.min(next.top, line.baseline + em * 0.3);
        runner.vy = 0;
      }
    }

    const taken = pickups.filter((pickup) => pickup.takenAt >= 0).length;
    setStatus(`${runTime.toFixed(1)}s · ${taken}/${PICKUPS}`);
  };

  /** Pixels drawn in two passes, a dark outline then the ink, so they read over the letters. */
  const fillPixels = (cells: [number, number, number][]): void => {
    const edge = Math.max(1, Math.round(unit / 2));
    ctx.fillStyle = outline;
    for (const [x, y, size] of cells)
      ctx.fillRect(x - edge, y - edge, size + edge * 2, size + edge * 2);
    ctx.fillStyle = ink;
    for (const [x, y, size] of cells) ctx.fillRect(x, y, size, size);
  };

  const drawSprite = (rows: readonly string[], x: number, y: number): void => {
    const left = Math.round(x);
    const top = Math.round(y - height());
    const cells: [number, number, number][] = [];
    rows.forEach((row, r) => {
      for (let c = 0; c < row.length; c += 1) {
        if (row.charAt(c) === '#') cells.push([left + c * unit, top + r * unit, unit]);
      }
    });
    fillPixels(cells);
  };

  /** A pixel selection box (marching dashes + corner handles) round the finish button. */
  const drawSelection = (goal: Line): void => {
    const pad = unit * 2;
    const left = Math.round(goal.left - pad);
    const top = Math.round(goal.top - pad);
    const right = Math.round(goal.right + pad);
    const bottom = Math.round(goal.baseline + pad);
    const gap = unit * 3;
    const shift = Math.floor(clock * 12) % 2 === 0 ? 0 : gap / 2;
    const cells: [number, number, number][] = [];
    for (let x = left + shift; x < right; x += gap) {
      cells.push([Math.round(x), top, unit], [Math.round(x), bottom - unit, unit]);
    }
    for (let y = top + shift; y < bottom; y += gap) {
      cells.push([left, Math.round(y), unit], [right - unit, Math.round(y), unit]);
    }
    const handle = unit * 2;
    for (const [x, y] of [
      [left, top],
      [right, top],
      [left, bottom],
      [right, bottom],
    ] as const) {
      cells.push([x - handle / 2, y - handle / 2, handle]);
    }
    fillPixels(cells);
  };

  const pickSprite = (): readonly string[] => {
    if (phase === 'fell') return SPRITES.jump;
    if (phase !== 'playing') return SPRITES.idle;
    if (!runner.grounded) return SPRITES.jump;
    return Math.floor(clock / 0.09) % 2 === 0 ? SPRITES.runA : SPRITES.runB;
  };

  const draw = (): void => {
    if (!level) return;
    const { em } = level;
    ctx.clearRect(0, 0, level.width, level.height);

    pickups.forEach((pickup, i) => {
      const size = unit * 2;
      if (pickup.takenAt < 0) {
        const bob = Math.sin(clock * 3 + i) * unit;
        ctx.globalAlpha = 1;
        fillPixels([
          [Math.round(pickup.x - size / 2), Math.round(pickup.y - size / 2 + bob), size],
        ]);
        return;
      }
      // Taken: a brief burst of four pixels flying apart.
      const age = clock - pickup.takenAt;
      if (age > 0.4) return;
      const spread = age * em * 0.6;
      ctx.globalAlpha = 1 - age / 0.4;
      const corners = [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ] as const;
      fillPixels(
        corners.map(([dx, dy]) => [
          Math.round(pickup.x + dx * spread - unit / 2),
          Math.round(pickup.y + dy * spread - unit / 2),
          unit,
        ]),
      );
    });
    ctx.globalAlpha = 1;

    const goal = level.lines[level.lines.length - 1];
    if (phase === 'won' && goal?.finish) drawSelection(goal);

    const bob =
      phase === 'idle' || phase === 'won' ? Math.round(Math.sin(clock * 2) * 0.5) * unit : 0;
    drawSprite(pickSprite(), runner.x, runner.y + bob);
  };

  const tick = (_time: number, deltaMs: number): void => {
    const dt = Math.min(deltaMs / 1000, 1 / 30);
    clock += dt;
    if (phase === 'playing') step(dt);
    else if (phase === 'fell' && level) {
      // Keep falling out of view.
      runner.vy += GRAVITY * level.em * dt;
      runner.y = Math.min(runner.y + runner.vy * dt, level.height + height());
    } else if (phase === 'won' && level && !runner.grounded) {
      // A finish mid-jump: come down onto the platform below.
      const line = level.lines[runner.line];
      const [a, b] = feet(runner.x);
      const ground = line ? groundUnder(line, a, b) : Infinity;
      runner.vy = Math.max(runner.vy, 0) + GRAVITY * level.em * dt;
      runner.y += runner.vy * dt;
      if (Number.isFinite(ground) && runner.y >= ground) {
        runner.y = ground;
        runner.vy = 0;
        runner.grounded = true;
      }
    }
    draw();
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (phase !== 'playing') return;
    if (event.code === 'Escape') {
      stop();
      play.focus({ preventScroll: true });
      return;
    }
    if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
      event.preventDefault();
      if (!event.repeat) jump();
    }
  };
  const onKeyUp = (event: KeyboardEvent): void => {
    if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') release();
  };
  const onPointerDown = (event: PointerEvent): void => {
    if (phase !== 'playing') return;
    if (event.target instanceof Element && event.target.closest('a, button')) return;
    jump();
  };

  const mm = gsap.matchMedia();
  mm.add(MOTION_OK, () => {
    let running = false;
    const run = (on: boolean): void => {
      if (on === running) return;
      running = on;
      if (on) gsap.ticker.add(tick);
      else gsap.ticker.remove(tick);
    };

    const visibility = new IntersectionObserver(([entry]) => {
      const visible = entry?.isIntersecting ?? false;
      if (!visible && phase === 'playing') stop();
      run(visible);
    });
    const sizing = new ResizeObserver(() => {
      layout();
      draw();
    });

    let disposed = false;
    void document.fonts.ready.then(() => {
      if (disposed) return;
      layout();
      idleStatus();
      showHud('idle');
      hud.hidden = false;
      visibility.observe(panel);
      sizing.observe(panel);
    });

    play.addEventListener('click', start);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    panel.addEventListener('pointerdown', onPointerDown);
    panel.addEventListener('pointerup', release);
    panel.addEventListener('pointercancel', release);

    return () => {
      disposed = true;
      run(false);
      visibility.disconnect();
      sizing.disconnect();
      play.removeEventListener('click', start);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      panel.removeEventListener('pointerdown', onPointerDown);
      panel.removeEventListener('pointerup', release);
      panel.removeEventListener('pointercancel', release);
      phase = 'idle';
      hud.hidden = true;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  });

  return () => mm.revert();
}
