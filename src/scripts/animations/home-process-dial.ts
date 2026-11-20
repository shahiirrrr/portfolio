/**
 * Home process dial. The section pins while the user scrolls (~5 screens on
 * desktop, shorter on mobile); scroll progress rotates the dial one notch per
 * step, snaps to each step and swaps the active step:
 * - the big numeral rolls like an odometer (each digit reel slides to the new
 *   step, passing through the ones in between on a jump);
 * - the step title rises in letter by letter from a mask, the body follows,
 *   and the outgoing step drifts away — both following the scroll direction;
 * - the dial's own notch number and the right-hand index swap via classes,
 *   and the notches already passed stay lit;
 * - the progress arc along the ring grows with the scroll, its end on the
 *   active dot (owner-requested, like the bezel ticks that turn with the dial);
 * - the step's line drawing (ProcessArt) draws itself in while the outgoing
 *   one is erased in the scroll direction (owner-requested).
 * Scrolling up reverses it. Reduced motion: no pin — the plain step list stays.
 */
import { gsap, SplitText } from './core.ts';
import { refreshScroll, scrollToY, SMOOTH_SCROLL } from './smooth-scroll.ts';

interface DialOptions {
  /** ScrollTrigger end, e.g. "+=400%". */
  end: string;
  /** Rest angle of the dial at step 1; it scrubs to the mirror angle. */
  angle: number;
}

const ROLL = { duration: 0.9, ease: 'expo.out' } as const;
const STEP_IN = { duration: 0.8, ease: 'expo.out' } as const;
const STEP_OUT = { duration: 0.3, ease: 'power3.in' } as const;
/** When an outgoing step's title and body have fully cleared. */
const LEAVE_TIME = 0.45;
const ART_IN = { duration: 1.4, ease: 'expo.out', stagger: 0.035, delay: 0.2 } as const;
const ART_OUT = { duration: 0.4, ease: 'power3.in', stagger: 0.008 } as const;

export function initProcessDial(root: HTMLElement): () => void {
  const dial = root.querySelector<HTMLElement>('[data-process-dial]');
  const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-process-step]'));
  const reels = Array.from(root.querySelectorAll<HTMLElement>('[data-process-reel]'));
  const notches = Array.from(root.querySelectorAll<HTMLElement>('[data-process-notch]'));
  const jumps = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-process-jump]'));
  const arcs = Array.from(root.querySelectorAll<SVGPathElement>('[data-process-arc]'));
  const arts = Array.from(root.querySelectorAll<SVGSVGElement>('[data-process-art]'));
  const artStrokes = arts.map((art) => Array.from(art.querySelectorAll('path')));
  const lastStep = steps.length - 1;
  if (!dial || lastStep < 1) return () => {};

  const buildDial = ({ end, angle }: DialOptions) => {
    root.classList.add('is-enhanced');

    const titles = steps.map((step) => {
      const title = step.querySelector<HTMLElement>('[data-process-title]');
      return title ? SplitText.create(title, { type: 'chars', mask: 'chars' }) : undefined;
    });
    const bodies = steps.map((step) => step.querySelector<HTMLElement>('[data-process-body]'));

    const charsOf = (i: number) => titles[i]?.chars ?? [];
    const strokesOf = (i: number) => artStrokes[i] ?? [];

    // Strokes have pathLength 1 and dasharray 1: dashoffset 0 shows the line,
    // 1 hides it ahead of the pen, -1 hides it behind. So a drawing is drawn
    // from its start and erased from its start, read in the scroll direction.
    const drawArt = (i: number, direction: number) => {
      const art = arts[i];
      if (!art) return;
      gsap.set(art, { autoAlpha: 1, overwrite: true });
      gsap.fromTo(
        strokesOf(i),
        { strokeDashoffset: direction },
        { strokeDashoffset: 0, overwrite: true, ...ART_IN },
      );
    };
    const eraseArt = (i: number, direction: number) => {
      const art = arts[i];
      if (!art) return;
      gsap.to(strokesOf(i), { strokeDashoffset: -direction, overwrite: true, ...ART_OUT });
      gsap.to(art, { autoAlpha: 0, duration: 0.01, delay: LEAVE_TIME + 0.1, overwrite: true });
    };

    // The outgoing title rolls out through its masks and its body fades; the
    // step hides once both are gone.
    const leave = (i: number, direction: number) => {
      const step = steps[i];
      const body = bodies[i];
      if (!step) return;
      gsap.to(charsOf(i), {
        yPercent: -110 * direction,
        stagger: 0.015,
        overwrite: true,
        ...STEP_OUT,
      });
      if (body) gsap.to(body, { autoAlpha: 0, y: -16 * direction, overwrite: true, ...STEP_OUT });
      gsap.to(step, { autoAlpha: 0, duration: 0.01, delay: LEAVE_TIME, overwrite: true });
    };

    // The incoming title rises letter by letter from below its masks (above,
    // when scrolling back), just as the outgoing one clears.
    const enter = (i: number, direction: number) => {
      const step = steps[i];
      const body = bodies[i];
      if (!step) return;
      gsap.set(step, { autoAlpha: 1, overwrite: true });
      gsap.fromTo(
        charsOf(i),
        { yPercent: 110 * direction },
        { yPercent: 0, stagger: 0.025, delay: 0.15, overwrite: true, ...STEP_IN },
      );
      if (body) {
        gsap.fromTo(
          body,
          { autoAlpha: 0, y: 20 * direction },
          { autoAlpha: 1, y: 0, delay: 0.3, overwrite: true, ...STEP_IN },
        );
      }
    };

    let active = -1;
    const setActive = (index: number) => {
      if (index === active) return;
      const previous = active;
      const direction = index > previous ? 1 : -1;
      active = index;

      notches.forEach((el, i) => {
        el.classList.toggle('is-active', i === index);
        el.classList.toggle('is-passed', i < index);
      });
      jumps.forEach((button, i) => {
        if (i === index) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      });

      // Odometer: each reel stacks one digit per step, so step i sits at -i/n.
      const yPercent = (-100 * index) / steps.length;

      if (previous === -1) {
        gsap.set(reels, { yPercent });
        steps.forEach((step, i) => gsap.set(step, { autoAlpha: i === index ? 1 : 0 }));
        arts.forEach((art, i) => gsap.set(art, { autoAlpha: i === index ? 1 : 0 }));
        gsap.set(strokesOf(index), { strokeDashoffset: 0 });
        return;
      }

      gsap.to(reels, { yPercent, stagger: 0.06, overwrite: true, ...ROLL });
      // Anything still mid-exit from a fast scroll is cut immediately.
      steps.forEach((step, i) => {
        if (i !== index && i !== previous) gsap.set(step, { autoAlpha: 0, overwrite: true });
      });
      arts.forEach((art, i) => {
        if (i === index || i === previous) return;
        gsap.killTweensOf(strokesOf(i));
        gsap.set(art, { autoAlpha: 0, overwrite: true });
      });
      leave(previous, direction);
      enter(index, direction);
      eraseArt(previous, direction);
      drawArt(index, direction);
    };
    setActive(0);

    // Lenis already smooths wheel input, so scrub directly and wait for its
    // glide tail before snapping. Native (touch) scrolling keeps the scrub lag.
    const lenis = window.matchMedia(SMOOTH_SCROLL).matches;
    const snap = { snapTo: 1 / lastStep, ease: 'power2.inOut' };

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        pin: true,
        start: 'top top',
        end,
        scrub: lenis ? true : 0.6,
        snap: lenis ? { ...snap, delay: 0.3, duration: { min: 0.2, max: 0.5 } } : snap,
        onUpdate: (self) => setActive(Math.round(self.progress * lastStep)),
      },
    });
    timeline.fromTo(dial, { rotate: angle }, { rotate: -angle, ease: 'none' });
    // The arc spans the dial's full sweep (2 × angle, in its 360-unit path),
    // so its end stays on the active dot while the dial turns.
    timeline.fromTo(
      arcs,
      { strokeDasharray: '0 360' },
      { strokeDasharray: `${2 * angle} 360`, ease: 'none' },
      0,
    );

    const trigger = timeline.scrollTrigger;
    const listeners = jumps.map((button, i) => {
      const onClick = () => {
        if (!trigger) return;
        const target = trigger.start + ((trigger.end - trigger.start) * i) / lastStep;
        scrollToY(target);
      };
      button.addEventListener('click', onClick);
      return () => button.removeEventListener('click', onClick);
    });

    return () => {
      listeners.forEach((remove) => remove());
      // Tweens started from scroll callbacks aren't recorded by matchMedia.
      const animated = [
        ...reels,
        ...steps,
        ...bodies.filter((body) => body !== null),
        ...arts,
        ...artStrokes.flat(),
      ];
      gsap.killTweensOf(animated);
      gsap.set(animated, { clearProps: 'all' });
      titles.forEach((split) => {
        if (!split) return;
        gsap.killTweensOf(split.chars);
        split.revert();
      });
      notches.forEach((el) => el.classList.remove('is-active', 'is-passed'));
      jumps.forEach((button) => button.removeAttribute('aria-current'));
      root.classList.remove('is-enhanced');
    };
  };

  const mm = gsap.matchMedia();
  const motion = '(prefers-reduced-motion: no-preference)';
  mm.add(`(max-width: 767px) and ${motion}`, () => buildDial({ end: '+=300%', angle: 40 }));
  mm.add(`(min-width: 768px) and ${motion}`, () => buildDial({ end: '+=400%', angle: 50 }));

  // The pin changes page height; keep later triggers accurate.
  refreshScroll();

  return () => mm.revert();
}
