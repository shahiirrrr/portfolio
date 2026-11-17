/**
 * Work page: tag filter + LIST / GRID view toggle (Figma dev notes "FILTER —
 * Tag chips" and "TOGGLE — List / Grid view").
 *
 *  - Single-select chips; the active tag is kept in the URL (`?tag=react`)
 *    and applied on load. Hidden rows use the `hidden` attribute.
 *  - The view is remembered in localStorage (desktop only; CSS ignores the
 *    grid below 768px).
 *  - Changes animate with Flip; with reduced motion they apply instantly.
 * Without JavaScript the page shows the full list.
 */
import { Flip } from 'gsap/Flip';

import { gsap, MOTION_OK } from './core.ts';

gsap.registerPlugin(Flip);

const VIEW_KEY = 'work-view';
type View = 'list' | 'grid';

function isView(value: string | null | undefined): value is View {
  return value === 'list' || value === 'grid';
}

function readStoredView(): View | null {
  try {
    const value = localStorage.getItem(VIEW_KEY);
    return isView(value) ? value : null;
  } catch {
    return null;
  }
}

function storeView(view: View): void {
  try {
    localStorage.setItem(VIEW_KEY, view);
  } catch {
    // Storage unavailable (private mode, blocked): the choice just isn't remembered.
  }
}

export function initWorkFilter(): () => void {
  const list = document.querySelector<HTMLElement>('[data-work-list]');
  const count = document.querySelector<HTMLElement>('[data-work-count]');
  const empty = document.querySelector<HTMLElement>('[data-work-empty]');
  if (!list) return () => {};

  const items = Array.from(list.querySelectorAll<HTMLElement>('[data-work-item]'));
  const chips = Array.from(
    document.querySelectorAll<HTMLButtonElement>('[data-work-filters] button[data-value]'),
  );
  const viewButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('[data-view-option]'),
  );
  const animate = (): boolean => window.matchMedia(MOTION_OK).matches;

  function applyFilter(tag: string, withMotion: boolean): void {
    chips.forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.value === tag)));

    const state = withMotion ? Flip.getState(items) : null;
    items.forEach((item) => {
      const tags = (item.dataset.tags ?? '').split(' ');
      item.hidden = tag !== 'all' && !tags.includes(tag);
    });

    const visible = items.filter((item) => !item.hidden).length;
    if (count) count.textContent = `( ${String(visible).padStart(2, '0')} PROJECTS )`;
    if (empty) empty.hidden = visible > 0;

    if (state) {
      Flip.from(state, {
        duration: 0.5,
        ease: 'power2.inOut',
        absolute: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0 }, { opacity: 1 }),
        onLeave: (els) => gsap.to(els, { opacity: 0 }),
      });
    }
  }

  function setUrlTag(tag: string): void {
    const url = new URL(window.location.href);
    if (tag === 'all') url.searchParams.delete('tag');
    else url.searchParams.set('tag', tag);
    history.replaceState(history.state, '', url);
  }

  function setView(view: View, withMotion: boolean): void {
    viewButtons.forEach((button) =>
      button.setAttribute('aria-pressed', String(button.dataset.viewOption === view)),
    );
    if (list?.dataset.view === view) return;
    const state = withMotion ? Flip.getState(items) : null;
    if (list) list.dataset.view = view;
    if (state) Flip.from(state, { duration: 0.6, ease: 'power3.inOut', scale: true });
  }

  const onChipClick = (event: Event): void => {
    const tag =
      event.currentTarget instanceof HTMLElement ? event.currentTarget.dataset.value : undefined;
    if (!tag) return;
    applyFilter(tag, animate());
    setUrlTag(tag);
  };

  const onViewClick = (event: Event): void => {
    const view =
      event.currentTarget instanceof HTMLElement
        ? event.currentTarget.dataset.viewOption
        : undefined;
    if (!isView(view)) return;
    setView(view, animate());
    storeView(view);
  };

  const onReset = (event: Event): void => {
    event.preventDefault();
    applyFilter('all', false);
    setUrlTag('all');
    chips[0]?.focus();
  };

  chips.forEach((chip) => chip.addEventListener('click', onChipClick));
  viewButtons.forEach((button) => button.addEventListener('click', onViewClick));
  const reset = empty?.querySelector('[data-work-reset]');
  reset?.addEventListener('click', onReset);

  // Initial state from the URL and storage — applied without animation.
  const initialTag = new URLSearchParams(window.location.search).get('tag')?.toLowerCase();
  if (initialTag && initialTag !== 'all') applyFilter(initialTag, false);
  const storedView = readStoredView();
  if (storedView) setView(storedView, false);

  return () => {
    chips.forEach((chip) => chip.removeEventListener('click', onChipClick));
    viewButtons.forEach((button) => button.removeEventListener('click', onViewClick));
    reset?.removeEventListener('click', onReset);
  };
}
