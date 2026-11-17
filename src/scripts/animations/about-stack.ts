/**
 * About stack index table (Figma: 03 Stack — Swiss Grid).
 *
 * Desktop, on enter: the rules draw left → right (0.08s stagger), each tool
 * cell's left rule draws top → bottom, index / discipline / tool names rise out
 * of a mask, T01–T13 scramble to their number. ("13 TOOLS" counts up through
 * the shared `data-count`.) Hover effects are CSS.
 * Mobile: the same choreography runs per row as each row scrolls into view.
 * Touch devices: rows get `.is-in` on enter so their icons brighten.
 * Reduced motion: no draw or scramble, just a fade.
 *
 * Scrambling only touches an aria-hidden copy; the real number stays in a
 * visually-hidden sibling, and the copy is restored on cleanup.
 */
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

import { DESKTOP, gsap, MOBILE, MOTION_OK, MOTION_REDUCED, ScrollTrigger } from './core.ts';

gsap.registerPlugin(ScrambleTextPlugin);

const TOUCH = '(hover: none)';

function scramble(targets: HTMLElement[]): gsap.core.Timeline {
  const tl = gsap.timeline();
  targets.forEach((el, i) => {
    const text = el.dataset.toolNo || el.textContent.trim();
    el.dataset.toolNo = text;
    tl.to(
      el,
      {
        duration: 0.8,
        scrambleText: { text, chars: '0123456789ABCDEFGHJKLMNPRSTUVWXYZ', speed: 0.6 },
      },
      i * 0.04,
    );
  });
  return tl;
}

/** The draw → rise → scramble sequence for a set of rules, cells, lines and numbers. */
function sequence(scope: HTMLElement | HTMLElement[], rulesStagger: number): gsap.core.Timeline {
  const roots = Array.isArray(scope) ? scope : [scope];
  const pick = (selector: string): HTMLElement[] =>
    roots.flatMap((root) => [
      ...(root.matches(selector) ? [root] : []),
      ...root.querySelectorAll<HTMLElement>(selector),
    ]);

  return gsap
    .timeline({ paused: true })
    .from(pick('[data-rule]'), {
      scaleX: 0,
      transformOrigin: 'left',
      stagger: rulesStagger,
      duration: 0.8,
      ease: 'power3.inOut',
    })
    .from(pick('[data-tool-cell]'), { '--rule': 0, stagger: 0.03, duration: 0.5 }, '-=0.4')
    .from(
      pick('[data-line]'),
      { yPercent: 110, stagger: 0.05, duration: 0.7, ease: 'power4.out' },
      '<',
    )
    .add(scramble(pick('[data-tool-no]')), '<0.2');
}

export function initAboutStack(section: HTMLElement): () => void {
  const table = section.querySelector<HTMLElement>('[data-stack-table]');
  if (!table) return () => {};
  const rows = gsap.utils.toArray<HTMLElement>('[data-stack-row]', table);
  const numbers = gsap.utils.toArray<HTMLElement>('[data-tool-no]', table);
  const originals = numbers.map((el) => el.textContent);
  const restore = (): void =>
    numbers.forEach((el, i) => {
      el.textContent = originals[i] ?? el.textContent;
    });

  const mm = gsap.matchMedia();

  mm.add(`${MOTION_OK} and ${DESKTOP}`, () => {
    const tl = sequence(table, 0.08);
    ScrollTrigger.create({
      trigger: table,
      start: 'top 75%',
      once: true,
      onEnter: () => tl.play(),
    });
    return restore;
  });

  mm.add(`${MOTION_OK} and ${MOBILE}`, () => {
    rows.forEach((row) => {
      const tl = sequence(row, 0);
      ScrollTrigger.create({
        trigger: row,
        start: 'top 80%',
        once: true,
        onEnter: () => tl.play(),
      });
    });
    return restore;
  });

  mm.add(TOUCH, () => {
    rows.forEach((row) =>
      ScrollTrigger.create({
        trigger: row,
        start: 'top 80%',
        once: true,
        onEnter: () => row.classList.add('is-in'),
      }),
    );
    return () => rows.forEach((row) => row.classList.remove('is-in'));
  });

  mm.add(MOTION_REDUCED, () => {
    // Hide only at the moment of entering, so the table can never stay hidden.
    ScrollTrigger.create({
      trigger: table,
      start: 'top 85%',
      once: true,
      onEnter: () => gsap.fromTo(table, { opacity: 0 }, { opacity: 1, duration: 0.6 }),
    });
  });

  return () => {
    mm.revert();
    restore();
  };
}
