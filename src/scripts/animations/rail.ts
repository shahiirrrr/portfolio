/**
 * Horizontal scroll rail: native scrolling + scroll-snap, enhanced with
 * prev/next buttons, a progress bar and an "01 / 04" counter.
 *
 *   [data-rail]            root
 *     [data-rail-track]    the scroll container; children are [data-rail-item]
 *     [data-rail-prev] / [data-rail-next]   optional buttons
 *     [data-rail-fill]     optional progress fill (scaled on X)
 *     [data-rail-count]    optional counter text
 */
export function initRail(root: HTMLElement): () => void {
  const track = root.querySelector<HTMLElement>('[data-rail-track]');
  if (!track) return () => {};

  const items = Array.from(track.querySelectorAll<HTMLElement>('[data-rail-item]'));
  const prev = root.querySelector<HTMLButtonElement>('[data-rail-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-rail-next]');
  const fill = root.querySelector<HTMLElement>('[data-rail-fill]');
  const count = root.querySelector<HTMLElement>('[data-rail-count]');
  const pad = (value: number) => String(value).padStart(2, '0');

  /** Distance between the left edges of two neighbouring cards. */
  const step = () => {
    const [first, second] = items;
    if (!first) return track.clientWidth;
    return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
  };

  let frame = 0;
  const update = () => {
    frame = 0;
    const max = track.scrollWidth - track.clientWidth;
    const progress = max > 0 ? Math.min(1, Math.max(0, track.scrollLeft / max)) : 0;
    const atEnd = max <= 0 || track.scrollLeft >= max - 1;
    const active = atEnd
      ? items.length - 1
      : Math.min(items.length - 1, Math.round(track.scrollLeft / step()));

    // The fill always shows at least the first card's share (25% for four cards).
    if (fill) {
      const share = 1 / items.length;
      fill.style.transform = `scaleX(${share + (1 - share) * progress})`;
    }
    if (count) count.textContent = `${pad(active + 1)} / ${pad(items.length)}`;
    if (prev) prev.disabled = track.scrollLeft <= 1;
    if (next) next.disabled = atEnd;
  };

  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const scrollByCard = (direction: 1 | -1) => () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: direction * step(), behavior: reduced ? 'auto' : 'smooth' });
  };
  const onPrev = scrollByCard(-1);
  const onNext = scrollByCard(1);

  track.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  prev?.addEventListener('click', onPrev);
  next?.addEventListener('click', onNext);
  update();

  return () => {
    cancelAnimationFrame(frame);
    track.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    prev?.removeEventListener('click', onPrev);
    next?.removeEventListener('click', onNext);
  };
}
