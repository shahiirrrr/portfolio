/**
 * Declarative scroll effects shared by every page. Loaded once by PageLayout.
 * Markup opts in with data attributes:
 *
 *   data-reveal                      fade + rise 24px once when scrolled into view
 *   data-reveal-group                container: its [data-reveal-item] children rise
 *     data-reveal-item               40px with an 80ms stagger (override with
 *                                    data-y="30" data-stagger="0.1" on the group)
 *   data-word-reveal                 words brighten 16% → 100%, scrubbed to scroll
 *                                    (override with data-start / data-end)
 *   data-line-reveal                 lines rise out of a mask when scrolled into view;
 *                                    data-line-reveal="load" plays on page load
 *   data-count                       numeric text ("03", "2+") counts up from 0 once
 *
 * With prefers-reduced-motion nothing moves: content is simply visible.
 * Without JavaScript every element is visible as authored.
 */
import { gsap, markMotionReady, MOTION_OK, MOTION_REDUCED, SplitText } from './core.ts';
import { refreshScroll } from './smooth-scroll.ts';

function numberAttr(el: HTMLElement, name: string, fallback: number): number {
  const value = Number(el.dataset[name]);
  return Number.isFinite(value) && el.dataset[name] !== undefined ? value : fallback;
}

function initRises(): void {
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 24,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((group) => {
    const items = group.querySelectorAll<HTMLElement>('[data-reveal-item]');
    if (items.length === 0) return;
    gsap.from(items, {
      y: numberAttr(group, 'y', 40),
      opacity: 0,
      stagger: numberAttr(group, 'stagger', 0.08),
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: group, start: 'top 75%', once: true },
    });
  });
}

function initWordReveals(): void {
  gsap.utils.toArray<HTMLElement>('[data-word-reveal]').forEach((el) => {
    SplitText.create(el, {
      type: 'words',
      autoSplit: true,
      onSplit: (self) =>
        gsap.fromTo(
          self.words,
          { opacity: 0.16 },
          {
            opacity: 1,
            stagger: 0.1,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: el.dataset.start ?? 'top 80%',
              end: el.dataset.end ?? 'bottom 40%',
              scrub: true,
            },
          },
        ),
    });
  });
}

function initLineReveals(): void {
  gsap.utils.toArray<HTMLElement>('[data-line-reveal]').forEach((el) => {
    const onLoad = el.dataset.lineReveal === 'load';
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 110,
          duration: 0.9,
          stagger: 0.08,
          ease: 'power4.out',
          ...(onLoad ? {} : { scrollTrigger: { trigger: el, start: 'top 85%', once: true } }),
        }),
    });
  });
}

function initCounters(): void {
  gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
    const match = /^(\d+)(\D*)$/.exec(el.textContent.trim());
    if (!match?.[1]) return; // non-numeric values ("B2B", "Live") stay as they are
    const digits = match[1];
    const suffix = match[2] ?? '';
    const counter = { value: 0 };
    gsap.to(counter, {
      value: Number(digits),
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => {
        el.textContent = String(Math.round(counter.value)).padStart(digits.length, '0') + suffix;
      },
    });
  });
}

const mm = gsap.matchMedia();

mm.add(MOTION_OK, () => {
  initRises();
  initWordReveals();
  initLineReveals();
  initCounters();
  markMotionReady();
});

mm.add(MOTION_REDUCED, () => {
  markMotionReady();
});

// Web fonts and lazy images shift layout after first paint; re-measure triggers.
window.addEventListener('load', refreshScroll, { once: true });
