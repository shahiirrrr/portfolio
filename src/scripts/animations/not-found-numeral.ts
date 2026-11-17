/**
 * 404 numeral (Figma dev note "ANIMATION — 404 numeral"): the digits drop in
 * with a stagger, then loop — the 4s bob and tilt out of phase while the 0
 * pulses with a soft white glow. On hover-capable devices the numeral tilts
 * toward the pointer. Reduced motion: the static numeral.
 */
import { CAN_HOVER, gsap, markMotionReady, MOTION_OK, MOTION_REDUCED } from './core.ts';

export function initNotFoundNumeral(numeral: HTMLElement): () => void {
  const digits = numeral.querySelectorAll<HTMLElement>('[data-digit]');
  const left = numeral.querySelector<HTMLElement>('[data-digit="left"]');
  const right = numeral.querySelector<HTMLElement>('[data-digit="right"]');
  const zero = numeral.querySelector<HTMLElement>('[data-digit="zero"]');
  const glow = numeral.querySelector<HTMLElement>('[data-zero-glow]');
  const mm = gsap.matchMedia();

  mm.add(MOTION_OK, () => {
    const intro = 0.9 + 0.08 * (digits.length - 1);
    gsap.from(digits, {
      yPercent: 120,
      opacity: 0,
      stagger: 0.08,
      duration: 0.9,
      ease: 'back.out(1.6)',
    });
    markMotionReady();

    const loop = { yoyo: true, repeat: -1, delay: intro };
    if (left) gsap.to(left, { ...loop, y: -30, rotate: -6, duration: 1.6, ease: 'sine.inOut' });
    if (right) gsap.to(right, { ...loop, y: 30, rotate: 5, duration: 1.6, ease: 'sine.inOut' });
    if (zero) gsap.to(zero, { ...loop, opacity: 0.6, duration: 0.8, ease: 'power1.inOut' });
    if (glow) gsap.to(glow, { ...loop, opacity: 0.55, scale: 1.15, duration: 0.8 });
  });

  // Pointer tilt only where there is a real pointer (off on touch devices).
  mm.add(`${MOTION_OK} and ${CAN_HOVER}`, () => {
    gsap.set(numeral, { transformPerspective: 800 });
    const qx = gsap.quickTo(numeral, 'rotationY', { duration: 0.6 });
    const qy = gsap.quickTo(numeral, 'rotationX', { duration: 0.6 });
    const tilt = (e: PointerEvent): void => {
      qx((e.clientX / window.innerWidth - 0.5) * 12);
      qy((e.clientY / window.innerHeight - 0.5) * -12);
    };
    window.addEventListener('pointermove', tilt);
    return () => window.removeEventListener('pointermove', tilt);
  });

  mm.add(MOTION_REDUCED, () => {
    markMotionReady();
  });

  return () => mm.revert();
}
