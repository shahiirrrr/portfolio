/**
 * Level builder for the Home CTA runner (home-cta-runner.ts): turns laid-out
 * text into ground. Each character is redrawn on an offscreen canvas at its
 * exact on-screen position and font, then every column of each line is scanned
 * for its first inked pixel — so the L's tall stem, the humps of the m and the
 * dot of the i are all real, walkable surfaces. The level is the headline's
 * lines, then the email address, then a flat finish platform (the CTA button).
 */

export interface Line {
  /** Left / right edge of the line's ink, in panel px. */
  left: number;
  right: number;
  top: number;
  baseline: number;
  /** Surface height per panel column (px); `Infinity` where there is no ink. */
  surface: Float32Array;
  /** The finish platform: landing on it ends the run. */
  finish: boolean;
}

export interface Level {
  width: number;
  height: number;
  /** Font size of the headline: physics and sprite scale with it. */
  em: number;
  lines: Line[];
}

interface Glyph {
  char: string;
  font: string;
  size: number;
  left: number;
  baseline: number;
  top: number;
}

interface TextLine {
  top: number;
  baseline: number;
  left: number;
  right: number;
  size: number;
}

/** Every visible character of `root` with its font and box, relative to `origin`. */
function glyphs(root: HTMLElement, origin: DOMRect, ctx: CanvasRenderingContext2D): Glyph[] {
  const found: Glyph[] = [];
  const ascentShares = new Map<string, number>();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!parent) continue;
    const style = getComputedStyle(parent);
    const size = parseFloat(style.fontSize);
    const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    // A text box spans the font's ascent + descent, so the baseline sits at
    // the ascent's share of its height.
    let share = ascentShares.get(font);
    if (share === undefined) {
      ctx.font = font;
      const metrics = ctx.measureText('H');
      const ascent = metrics.fontBoundingBoxAscent || size * 0.8;
      const descent = metrics.fontBoundingBoxDescent || size * 0.2;
      share = ascent / (ascent + descent);
      ascentShares.set(font, share);
    }
    const text = node.textContent ?? '';
    for (let i = 0; i < text.length; i += 1) {
      const char = text.charAt(i);
      if (!char.trim()) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const rect = [...range.getClientRects()].find((box) => box.width > 0);
      if (!rect) continue;
      found.push({
        char,
        font,
        size,
        left: rect.left - origin.left,
        top: rect.top - origin.top,
        baseline: rect.top - origin.top + rect.height * share,
      });
    }
  }
  return found;
}

/** Draws the glyphs and groups them into lines by baseline. */
function drawLines(ctx: CanvasRenderingContext2D, chars: Glyph[]): TextLine[] {
  const lines: TextLine[] = [];
  for (const glyph of chars) {
    ctx.font = glyph.font;
    ctx.fillText(glyph.char, glyph.left, glyph.baseline);
    const right = glyph.left + ctx.measureText(glyph.char).width;
    const line = lines.find(
      (entry) =>
        entry.size === glyph.size && Math.abs(entry.baseline - glyph.baseline) < glyph.size * 0.3,
    );
    if (line) {
      line.left = Math.min(line.left, glyph.left);
      line.right = Math.max(line.right, right);
      line.top = Math.min(line.top, glyph.top);
    } else {
      lines.push({
        top: glyph.top,
        baseline: glyph.baseline,
        left: glyph.left,
        right,
        size: glyph.size,
      });
    }
  }
  return lines;
}

/**
 * @param texts  Elements whose text forms the level, in play order.
 * @param finish The finish platform (its top edge is the ground), or null.
 */
export function buildLevel(
  panel: HTMLElement,
  texts: HTMLElement[],
  finish: HTMLElement | null,
): Level | null {
  const origin = panel.getBoundingClientRect();
  const width = Math.ceil(origin.width);
  const height = Math.ceil(origin.height);
  const first = texts[0];
  const em = first ? parseFloat(getComputedStyle(first).fontSize) : 0;
  if (!em || width === 0) return null;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#000';

  const textLines = texts.flatMap((element) =>
    drawLines(ctx, glyphs(element, origin, ctx)).sort((a, b) => a.baseline - b.baseline),
  );
  if (textLines.length === 0) return null;

  const pixels = ctx.getImageData(0, 0, width, height).data;
  const lines: Line[] = textLines.map((line, index) => {
    const surface = new Float32Array(width).fill(Infinity);
    // Skip the line above's descenders (the g of "something"), which reach into this band.
    const above = textLines[index - 1];
    const clear = above ? above.baseline + above.size * 0.3 : 0;
    const from = Math.max(0, Math.floor(Math.max(line.top, clear)));
    const to = Math.min(height, Math.ceil(line.baseline + 1));
    let left = Infinity;
    let right = -Infinity;
    for (let x = 0; x < width; x += 1) {
      for (let y = from; y < to; y += 1) {
        if ((pixels[(y * width + x) * 4 + 3] ?? 0) > 127) {
          surface[x] = y;
          left = Math.min(left, x);
          right = Math.max(right, x);
          break;
        }
      }
    }
    return { left, right, top: line.top, baseline: line.baseline, surface, finish: false };
  });

  if (finish) {
    const box = finish.getBoundingClientRect();
    const left = Math.max(0, Math.round(box.left - origin.left));
    const right = Math.min(width - 1, Math.round(box.right - origin.left));
    const top = box.top - origin.top;
    const surface = new Float32Array(width).fill(Infinity);
    surface.fill(top, left, right + 1);
    lines.push({ left, right, top, baseline: box.bottom - origin.top, surface, finish: true });
  }

  return { width, height, em, lines };
}

/** Highest surface (smallest y) under the span [x0, x1), or `Infinity` over a gap. */
export function groundUnder(line: Line, x0: number, x1: number): number {
  let ground = Infinity;
  const start = Math.max(0, Math.floor(x0));
  const end = Math.min(line.surface.length, Math.ceil(x1));
  for (let x = start; x < end; x += 1) ground = Math.min(ground, line.surface[x] ?? Infinity);
  return ground;
}
