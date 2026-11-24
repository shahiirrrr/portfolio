# CLAUDE.md — Portfolio Development Rulebook

Primary instructions for every Claude Code session in this repo. Read it fully before editing.
If a change alters the architecture, update this file in the same change.

## Every session must

- Inspect the relevant existing code before editing; reuse what exists instead of adding parallel versions.
- Check `src/components/` before creating a component, and `src/utils/` before writing a helper.
- Add no dependency without the justification described in [Dependencies](#15-dependency-management).
- Follow the SEO, accessibility and responsive rules below for every page and component.
- Run `pnpm validate` before declaring work done, and report the real result.

## 1. Project overview

Shahir's personal portfolio (frontend engineer, Wayanad, Kerala): a fast, statically generated,
SEO-first site implemented from the Figma file **shahir-exp** (file key `ahmPUEl0mRLfkBvTQIt9qB`,
page "08 Final"). **Figma is the source of truth for every visual decision**; its "Dev Notes" frames
(above each page frame) define behaviour and animation. Read the relevant frame and its dev notes
before changing a page.

Pages: Home `/`, Work `/work/`, case studies `/work/<slug>/`, About `/about/` (Stack section is
`/about/#stack`), Contact `/contact/`, 404.

Open owner inputs (marked `PLACEHOLDER` in code — never fill them with invented values):
contact form endpoint (`SITE.contactEndpoint`), the CV PDF (`public/Shahir-CV.pdf`), Playground
repo URLs (`src/data/work.ts`) and the social preview image.

## 2. Technology stack

| Tool                                                  | Role                           | Notes                                                               |
| ----------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------- |
| Astro 7                                               | Framework, static output (SSG) | No adapter; no UI framework integration                             |
| TypeScript 6 (strict)                                 | Type safety                    | Pinned to 6.x — `@astrojs/check` does not support TS 7 yet          |
| pnpm 12                                               | Package manager                | Never use npm or yarn                                               |
| Plain CSS + custom properties                         | Styling                        | Tokens in `src/styles/variables.css`; Tailwind is not installed     |
| Astro Fonts API (Fontsource)                          | Self-hosted web fonts          | Manrope, Antonio, Unbounded — configured in astro.config            |
| Astro Content Collections                             | Projects + case studies        | Schema in `src/content.config.ts`                                   |
| GSAP 3 (ScrollTrigger, SplitText, Flip, ScrambleText) | Animation                      | Shared setup in `src/scripts/animations/core.ts`                    |
| Lenis 1.3                                             | Smooth scrolling               | One instance in `src/scripts/animations/smooth-scroll.ts` (see §13) |
| `@astrojs/sitemap`                                    | Sitemap                        | Only integration installed                                          |
| Prettier + `prettier-plugin-astro`                    | Formatting                     | No ESLint — `astro check` covers correctness                        |
| Vercel                                                | Hosting                        | Static deploy; `vercel.json` enforces trailing slashes + redirects  |
| GitHub Actions                                        | CI/CD                          | Validate, auto-PR, Claude review → auto-merge (see §18)             |

## 3. Architecture overview

```
astro.config.ts          site URL (from SITE), trailingSlash: 'always', sitemap, fonts
src/
├── content.config.ts    collection schema (projects: list row, home card, case study)
├── config/              site.ts (identity, contact, socials), navigation.ts, seo.ts
├── types/index.ts       shared TypeScript types
├── utils/               seo.ts (meta + JSON-LD), helpers.ts, projects.ts (queries)
├── data/                experience.ts, home.ts, about.ts, work.ts, contact.ts, tech.ts (stack name → icon)
├── content/projects/    one Markdown file per project (filename = slug)
├── assets/              icons/ (+ icons/tech/), images/ (portrait, experience, projects, shapes, dial, …)
├── styles/              global.css (entry, layers), variables.css (tokens), utilities.css
├── scripts/animations/  core.ts (GSAP setup), smooth-scroll.ts (Lenis + scroll helpers), reveal.ts (declarative scroll effects), ink-field.ts (WebGL2 hero ink), <page>-<effect>.ts
├── layouts/             BaseLayout (document shell, fonts) → PageLayout (header/main/footer, smooth-scroll.ts + reveal.ts)
├── components/
│   ├── common/          Seo, Button, Chip, Stat
│   ├── layout/          Header (fixed), MobileMenu (<dialog>), Footer
│   ├── ui/              FolderPanel, ExperienceCard, ProjectCard, …
│   └── sections/        home/, work/, about/, case-study/, contact/, not-found/
└── pages/               index, work/ (index + [slug]), about/, contact/, 404, robots.txt.ts
public/                  favicon.svg, images/og-default.png
.github/                 workflows/ (ci, auto-pr, claude-review), actions/setup, claude-review.md (review prompt)
```

Data flow: `config/` + `data/` + `content/` → `utils/` → pages → sections → ui/common components.
Pages pass `seo`, `jsonLd`, and optionally `headerTheme="light"` + `hero="overlay"` (Home only:
white hero under a transparent header) to `PageLayout`.

## 4. Folder responsibilities

- **`pages/`** — routing and page composition only: fetch data, set `seo`/`jsonLd`, arrange sections. No large markup blocks or page-specific CSS beyond a few lines.
- **`layouts/`** — shared document/page structure. `BaseLayout` owns `<html>`/`<head>`; `PageLayout` owns skip link, header, `<main>`, footer. Every page uses `PageLayout`.
- **`components/common/`** — small reusable primitives (buttons, links, icons, badges, section headings).
- **`components/layout/`** — site chrome (header, footer, navigation).
- **`components/sections/<page>/`** — page-level blocks, one folder per page. The contact CTA (`home/ContactCta.astro`) is Home-only (owner decision).
- **`components/ui/`** — composite pieces reused across sections (cards, panels).
- **`config/`** — constants shared across the site. `site.ts` is the single source of truth for identity and is imported by `astro.config.ts`, so it may only use relative imports.
- **`data/`** — typed structured data that isn't long-form content (page copy lists, experience, stack table, FAQ).
- **`content/`** — Markdown managed by content collections.
- **`utils/`** — reusable functions with no markup. **`types/`** — types shared by more than one file.
- **`assets/`** — images and SVGs exported from Figma, optimized by Astro. Fonts are not stored here (Fonts API).
- **`public/`** — files that must keep an exact URL (favicon, OG image). Not optimized.

Do not create empty folders or placeholder files "for later".

## 5. Astro conventions

- Static output only. Do not add an adapter, `prerender = false`, or server endpoints without the owner's approval.
- Astro components by default. Do not add React/Vue/Svelte integrations; an interactive island needs a concrete reason vanilla JS in a `<script>` can't meet.
- Client JS goes in a component `<script>` (bundled, deferred, deduped). The only `is:inline` scripts are JSON-LD and the tiny bootstrap in `BaseLayout` (`js`/`motion-ready` classes, plus the `card-enter` marker of the card transition, §13 — it must run before first paint).
- Import with the `@/` alias (`@/components/...`, `@/utils/...`). Relative imports only for siblings and inside `config/site.ts`.
- Internal links are root-relative **with a trailing slash**: `/work/`, never `/work`.
- Dynamic routes use `getStaticPaths` with `satisfies GetStaticPaths` and `InferGetStaticPropsType` (see `pages/work/[slug].astro`).
- Changing `content.config.ts` while `astro dev` runs can leave a stale content store (schema errors, empty collections): restart the dev server.
- Astro 7 is newer than most reference material: when unsure of an API, read `node_modules/astro/dist/**/*.d.ts` or the official docs rather than guessing.

## 6. Component standards

- One responsibility per component; if a file passes ~150 lines or mixes concerns, split it.
- Always declare `interface Props` (or `type Props = …`); destructure with defaults from `Astro.props`.
- Styles live in the component's scoped `<style>`, using tokens only.
- Repeated content is rendered from data (`config/`, `data/`, collections) with `.map()`, never copy-pasted.
- Do not wrap a single element in a component unless it encodes real shared behaviour or variants. Layout width is the `.container` class, not a component.
- Keep conditional rendering shallow; compute values in the frontmatter, not in nested ternaries in markup.
- Headings: components that render a heading accept the level or receive it via slot so page hierarchy stays valid.

## 7. TypeScript rules

- `astro/tsconfigs/strict` plus `noUncheckedIndexedAccess`. No `any`, no `@ts-ignore`, no non-null `!`.
- Avoid `as` assertions; prefer `satisfies`, narrowing, or fixing the type. (`as const` is fine.)
- Shared types go in `src/types/index.ts`; single-use types stay next to their use.
- Use `import type` for type-only imports (`verbatimModuleSyntax` enforces this).
- Content is validated by Zod schemas in `content.config.ts`; derive types with `CollectionEntry<'projects'>` (exported as `Project` from `utils/projects.ts`).

## 8. DRY principles

- Site name, URL, description, socials → `config/site.ts`. Navigation → `config/navigation.ts`. SEO defaults → `config/seo.ts`. Never hardcode these in components or pages.
- Project queries go through `getProjects()` / `getCaseStudies()` / `getFeaturedProjects()` and URLs through `projectPath()` (returns `undefined` for projects without a case study — never link those). Do not call `getCollection('projects')` or build `/work/...` strings elsewhere.
- Email, phone, location, availability and CV path come from `SITE`; never retype them.
- Absolute URLs come from `absoluteUrl()`; two-digit indexes from `padIndex()`; stacks from `formatStack()`.
- Extract a component/utility on the **second** real use, not speculatively. Three similar lines beat a premature abstraction.

## 9. CSS and design system

- Tokens in `variables.css` mirror the Figma variables (`bg/*`, `text/*`, `border/*`, `brand/*`, text styles). The site is dark-only (`color-scheme: dark`); Figma "brand/orange" is `--color-accent` (#f5f5f5 — the final design is monochrome).
- `variables.css` is the only place raw design values may appear. Everything else uses `var(--token)`. A genuinely one-off layout dimension copied from Figma (e.g. a fixed card height) may stay a literal px value in its component, with a comment.
- Two design frames: mobile 390 and desktop 1440 (content 1304, gutter 68). Fluid tokens (`--text-h1`, `--text-display`, `--container-gutter`, …) interpolate between them. **The design breakpoint is 48em (768px)**: mobile layout below, desktop from it; use 64em when a desktop arrangement needs more room. Other allowed breakpoints: `30em / 80em / 90em / 96em`.
- Typography: Manrope (`--font-sans`, also `.text-mono` — owner decision: no monospace web font; Figma not updated), Antonio (`--font-numeric`, big numerals), Unbounded (footer wordmark only). Use the role classes in `utilities.css` (`.text-display`, `.text-h1`–`.text-h4`, `.text-body-lg/-body/-body-sm`, `.text-label`, `.text-mono`, `.text-stat`) — no arbitrary font sizes.
- Cascade layers: `reset, tokens, base, utilities` (declared in `global.css`). Scoped component styles are unlayered and win automatically — never use `!important` (except the visibility utilities) or `:global()` to fight specificity. (`:global(html.<state>)` to react to a state class on `<html>`, as `CardStage` does, is fine.)
- Class naming: BEM-style scoped to the component (`.site-header__nav`, `.btn--ghost`); global utilities are single-purpose (`.container`, `.section`, `.flow`, `.visually-hidden`, `.mobile-only`, `.desktop-only`).
- Hover effects only inside `@media (hover: hover)`. When GSAP animates an element (it owns `transform`), hover movement uses the individual `translate`/`scale`/`rotate` properties.
- Logical properties. No horizontal page scroll at any width. Verify 390, 768, 1024, 1440 and 1920.
- Scrollbars are hidden site-wide in `global.css` (owner decision; restored under `forced-colors`). Don't re-add per-component scrollbar rules, and never set `scroll-behavior: smooth` — Lenis owns smoothing.

## 10. SEO hierarchy

- Every page passes a `seo` object to `PageLayout` with a **unique** `title` (≤ 60 chars, without the site name — the suffix is added automatically) and **unique** `description` (120–160 chars). Only the homepage omits `title`.
- Never write `<title>`, meta, canonical, OG or Twitter tags by hand — extend `SeoProps` / `resolveSeo()` in `utils/seo.ts` and `Seo.astro` instead.
- Canonicals are generated from the pathname; `trailingSlash: 'always'` in Astro and `vercel.json` must stay in agreement.
- `noindex: true` only for utility pages (404, drafts). Never add it to a real page; `robots.txt.ts` must keep `Allow: /`.
- JSON-LD is built only by helpers in `utils/seo.ts`: `websiteSchema` + `personSchema` (home), `profilePageSchema` (about), `projectSchema` → `CreativeWork` (case studies). Add new schema types as new helpers there.
- Structured data and copy must be factual. Never invent ratings, reviews, clients, metrics, credentials, awards or employment history.
- Exactly one `<h1>` per page; headings descend without skipping levels; choose heading tags by structure and style them with `.text-*` classes.
- Landmarks: one `<header>`, `<main>`, `<footer>` (from `PageLayout`); `<section>` with a heading for thematic blocks; `<article>` for self-contained items like a project.
- Internal linking: every page must be reachable through crawlable `<a href>` links (no JS-only navigation). New top-level pages go in `MAIN_NAV`; case studies are linked from `/work/` and the Home rail, and link back to `/work/` and to the next case study. Use descriptive link text, never "click here".
- The sitemap is automatic. Social image default is `public/images/og-default.png` (1200×630).

## 11. Accessibility (WCAG 2.2 AA)

- Semantic HTML first; ARIA only when no native element provides the behaviour. Interactive things are `<a>` (navigation) or `<button>` (actions) — never clickable `<div>`s.
- Everything is keyboard operable in a logical order; never remove the focus outline (global `:focus-visible` style exists — keep it visible on every background).
- Text contrast ≥ 4.5:1 (3:1 for large text and UI boundaries). `--color-text-muted` (#5c5c5c) fails AA for body text — use it only where the design does (decorative indexes, inactive labels).
- Touch targets ≥ 24×24 CSS px (aim for 44×44 on primary controls).
- Images: meaningful `alt`; decorative images use `alt=""`. Icon-only controls need an accessible name (`.visually-hidden` text or `aria-label`).
- Form fields always have a visible `<label>`; errors are announced in text, not by color alone.
- Each `<nav>` has a distinct `aria-label`; the current page link has `aria-current="page"`.
- The skip link and `<main id="main">` in `PageLayout` must be preserved.
- Menus/modals: prefer native `<dialog>` (the mobile menu is one) and the Popover API, which provide focus handling and Escape for free.
- Touch targets ≥ 44px on mobile (Figma: Filter Chip, Button min 52px tall).

## 12. Performance

- Ship zero JS by default. Every client script must justify itself; no analytics/third-party script without owner approval.
- Budget: Lighthouse ≥ 95 in all categories; LCP < 2.5s, INP < 200ms, CLS < 0.1.
- Images follow [Image rules](#17-image-optimization). Never let media load without reserved dimensions.
- Fonts: Astro Fonts API only (self-hosted, metric-matched fallbacks). Manrope 600/700 are preloaded in `BaseLayout`. No `<link>` to Google Fonts; don't add families or weights the design doesn't use.
- Only preload/`fetchpriority="high"` the single LCP element per page.
- Don't add speculative optimizations — measure first (`pnpm build && pnpm preview`, then Lighthouse).

## 13. Animation standards

Motion is specified per section in the Figma "Dev Notes" frames — implement what they say, nothing more.

- **Shared setup:** import `gsap`, `ScrollTrigger`, `SplitText` and the media-query constants (`MOTION_OK`, `MOTION_REDUCED`, `DESKTOP`, `MOBILE`, `CAN_HOVER`) from `src/scripts/animations/core.ts`, which registers the plugins. Extra plugins (Flip, ScrambleText) are registered in the module that uses them.
- **Declarative effects first** (`reveal.ts`, loaded on every page by `PageLayout`): `data-reveal`, `data-reveal-group` + `data-reveal-item` (`data-y`, `data-stagger`), `data-word-reveal` (`data-start`, `data-end`), `data-line-reveal` (`="load"` for on-load), `data-count`.
- **Bespoke effects** live in `src/scripts/animations/<page>-<effect>.ts`, export an init function scoped to a root element, and are imported from the owning component's `<script>` — never from a layout.
- **Smooth scrolling** (owner-requested, the one global exception to "implement nothing more"): `smooth-scroll.ts` is loaded by `PageLayout` and runs a single Lenis instance on GSAP's ticker, only for mouse/trackpad devices with motion allowed — touch devices and reduced motion scroll natively. Never call `window.scrollTo`/`scrollBy` on the page, set `style.overflow` or create another Lenis; use its helpers: `scrollToY()`, `lockScroll()`/`unlockScroll()` (modals; pass a holder name for an independent lock, e.g. the hero intro's, so locks don't release each other), `refreshScroll()` (after anything changes page height; never call `ScrollTrigger.refresh()` directly). Tune scroll-linked effects per input with the exported `SMOOTH_SCROLL` query (Lenis active → `scrub: true`; native/touch → keep a numeric scrub). Inner scroll areas opt out with `data-lenis-prevent` (or `-horizontal` for horizontal rails); a modal that scrolls itself must have `data-lenis-prevent`, because a stopped Lenis cancels all wheel/touch events otherwise.
- **Card → case study transition** (owner-requested, the second exception): clicking a Home rail card lifts it, fades the section, expands it to a full-screen frame (`home-card-transition.ts`), then navigates; the case study opens on the identical frame and hands it over in place to the full-screen hero, which shows the same card image (`card.image`; the dedicated `caseStudy.cover` is used for the social preview) (`case-study-enter.ts`). For this the case study hero is an owner-approved redesign of Figma "01 Hero" + "02 Cover" (Figma intentionally not updated): `CaseHero` is a full-bleed, full-screen project image with the title over it (on scroll it recedes into a rounded panel, `case-study-hero.ts`), and `CaseIntro` holds the subtitle and facts below it. Both draw in `ui/CardStage.astro` with shared geometry in `card-stage.ts` (clip-path box + uniformly scaled image — never stretch, never animate layout). The hand-off is a `sessionStorage` record read by the `BaseLayout` bootstrap, which marks `html.card-enter` before first paint; `introDelay()` in `core.ts` holds on-load intros until the frame starts settling. Always pass clip shapes as explicit from/to strings (browsers shorten computed `inset()`). The page switch itself is a cross-document view transition (`@view-transition` in `global.css`): it holds the Home frame until `case-study-enter.ts` adds `card-ready` (the frame image can paint), so a slow image never shows as a black cut; on-load intros wait for it via `onIntroReady()` in `core.ts`. The bootstrap's `pageswap`/`pagereveal` handlers skip the view transition for every other navigation — keep it that way. Reduced motion, modified clicks, direct visits and no JS get plain navigation; the back/forward cache plays the expansion in reverse.
- **Home hero "Negative"** (owner-requested, the third exception; Figma intentionally not updated): a raw WebGL2 ink field (`ink-field.ts` + `ink-field-shaders.ts`, no library) on one `<canvas data-hero-ink>`. `home-hero-negative.ts` plays three acts on it:
  - **Develop**, in cover mode (`data-cover`): the canvas sits on top and paints `--color-bg`. A white drop lands on the portrait, throws out splash droplets that fuse back in (smooth min), and spreads to uncover the hero. Each letter rises when the edge reaches it.
  - **Play**: the canvas sits above the portrait with `mix-blend-mode: difference`, and its ink colour is white minus `--color-bg`. Pointer strokes leave a curling trail that paints everything in negative, including the photo. Letters hang on springs in `home-hero-letters.ts`.
  - **Flood**: a scrubbed ScrollTrigger raises the ink so the hero hands over to the dark marquee, and it flips the header to `data-theme="dark"` once ink reaches it. **The flood never inverts the photo** (owner decision). The shader keeps it out of a shield texture rasterised from the portrait's own `portrait-mask.svg`, and the `MASK_*` constants mirror Hero.astro's `mask-size`/`mask-position`.

  Rules:
  - `home-hero.ts` dynamic-imports the module only with motion allowed, after the portrait (the LCP image, which stays a normal `<Image>`) has decoded and fonts are ready.
  - The dark start state is `Hero.astro`'s `::after`. It is gated on the hero-local `data-hero-ready`, not on the global `motion-ready`, which other sections set early, and it has a CSS-only 2.5s failsafe.
  - Without WebGL2, or with software rendering (`failIfMajorPerformanceCaveat`), the classic GSAP intro runs instead. Reduced motion gets a plain fade.
  - Back/forward loads skip the develop act. Rendering pauses off-screen and when idle.
  - The page is scroll-locked (holder `home-hero-intro`) from load until the intro has played — the develop act's ground is clear and every letter has risen, or the classic intro has ended — with an 8s failsafe. A reload or back/forward load that restores a scrolled position (Home saves `scrollY` to `sessionStorage` on `pagehide`, since the browser restores it only after the script runs) plays no intro and takes no lock.

- **Smaller owner-requested effects** (Figma intentionally not updated):
  - Home capability folders (`ui/FolderPanel.astro`, CSS only): on hover, or a tap or keyboard press on the arrow button, the flap tips forward and the `tools` logos from `data/home.ts` rise out of it.
  - Home experience cards (`ui/ExperienceCard.astro`, CSS only): on hover a glossy diagonal sheen sweeps across the card once, and the artwork zooms slightly.
  - CTA email (`sections/home/ContactCta.astro`, CSS only): on hover or focus, the letters roll up and are replaced by a `text-shadow` copy, while the underline wipes out and back in.
  - CTA "headline runner" (`sections/home/HeadlineRunner.astro` + `home-cta-runner.ts`, level from `home-cta-runner-level.ts`; canvas 2D above the headline, pointer-events none): a pixel figure auto-runs along the letter tops of the CTA headline and then the email address (glyphs scanned from an offscreen canvas). Space / ↑ / tap jumps (hold for higher); gaps between words drop him out, a line end carriage-returns to the next (after the headline, a drop onto the email), and from the email he leaps (desktop) or drops (mobile) onto the "Start a project" button, the finish, which gets a pixel selection box. Eight optional pickups; the best time is kept in `localStorage`; a finished run offers a mailto with the time in the subject. Only renders on screen; no game with reduced motion or without JS.
  - Footer wordmark (`footer-wordmark.ts` + `layout/FooterMascot.astro`): a line-drawn figure throws a rope onto the S, shoulders it and hauls the letters in, hops along their tops to the R (each letter turns white as he lands), hops back to the I (which dims as he lands) and sits on it. The figure is posed by tweening joint angles written as SVG `rotate()` attributes. Reduced motion shows him already seated; without JS there is no figure.
- Always `gsap.matchMedia()`: everything inside `MOTION_OK`; reduced motion = static or a plain fade; return cleanup (`mm.revert()`).
- **On-load intros** mark their elements `data-intro`: CSS hides them only while `html.js:not(.motion-ready)`. The script calls `markMotionReady()` after setting start states, on every code path; `BaseLayout` adds `motion-ready` after 2.5s as a failsafe.
- Progressive enhancement: without JS (or with reduced motion) everything is visible and usable — e.g. the process dial falls back to a plain step list, the marquee to wrapped rows, filters to the full list.
- Animate `transform`/`opacity`/`clip-path` only. CSS for simple hovers. Animations must not delay the LCP image.

## 14. Naming conventions

- Components/layouts: `PascalCase.astro`. Other files: `kebab-case` or single lowercase word (`helpers.ts`). Content files: `kebab-case.md` (the filename is the URL slug).
- Variables/functions: `camelCase`. Module-level config constants: `UPPER_SNAKE_CASE` (`SITE`, `MAIN_NAV`). Types/interfaces: `PascalCase`, no `I` prefix.
- CSS: BEM-style classes, `kebab-case` custom properties, `data-*` attributes for JS hooks (never style-classes as JS selectors).

## 15. Dependency management

- pnpm only; commit `pnpm-lock.yaml`. Run `pnpm peers check` after adding anything.
- Before adding a package, confirm that (1) Astro, CSS or the web platform can't already do it, (2) it's actively maintained, (3) its client-side weight is justified. State this reasoning to the owner.
- Never add: UI frameworks (React, Vue, …), state libraries (Redux, Zustand, …), CSS-in-JS, jQuery, lodash, moment, icon-font packs, or a second animation library.
- Approved exceptions: `lenis` (smooth scrolling; ~5 kB gzip; CSS can't smooth wheel input; GSAP ScrollSmoother was rejected because it fakes the scroll position and needs a wrapper). Stay on 1.3.x until 2.0 is stable.
- Icons: inline SVG files in `src/assets/icons/`, not an icon package.
- Don't upgrade TypeScript to 7 until `@astrojs/check` supports it.

## 16. Content management

- Projects: one Markdown file per project in `src/content/projects/` (filename = slug), validated by `content.config.ts`. Every project appears in the Work list (`order`, `stack`, `year`, `thumbnail`). Optional blocks:
  - `card` — puts the project in the Home "Selected work" rail (`order`, `category` (fallback cover alt text only), `image`, optional card-only `stack` and short `description`).
  - `caseStudy` — gives it a page at `/work/<slug>/` (`index` in the 01/04 cycle, `subtitle`, `role`, `timeline`, `live`, `overview`, `stats`, `cover { src, srcMobile?, alt }`, `showcase { heading, items[] }` (one row per product: image, caption, tags, optional live `link` — for multi-product projects), `media`, `teaser`). Sections render only when their data exists.
- `draft: true` entries render in `pnpm dev` only and are excluded from production builds and the sitemap.
- Structured page data lives in `src/data/*.ts` with types from `src/types`.
- Copy is real or absent: only text that exists in Figma or comes from the owner. Never write lorem ipsum or invented biography, clients, metrics or results.
- Licensing: code is MIT (`LICENSE`); personal content, images, copy, CV and branding are all rights reserved (`CONTENT-LICENSE.md`). Keep `README.md` factual and in sync when features or the stack change; never change the license scope without the owner.

## 17. Image optimization

- Content images go in `src/assets/images/` and render through `<Image>` / `<Picture>` from `astro:assets` (automatic WebP/AVIF, width/height, `srcset`). Never use a raw `<img>` for a local raster image.
- Always set `alt`, plus `widths` + `sizes` for anything wider than ~400px.
- Below the fold: default lazy loading. The LCP image: `loading="eager"` and `fetchpriority="high"` (one per page).
- Project images are declared in frontmatter and live in `src/assets/images/projects/`.
- Use the exact Figma exports in their exact slots; never substitute or redraw an asset. Small decorative SVGs (icons, shapes) render as `<img src={icon.src} width height alt="">`.
- `public/` is only for files needing a fixed URL (favicon, OG images). Keep source images ≤ 2500px wide and reasonably compressed.
- Simple icons/illustrations: SVG.

## 18. Git workflow

- Never commit, push, merge or open a PR unless the owner asks. Never run destructive commands (`reset --hard`, `push --force`, `clean -fd`, history rewrites) without explicit approval.
- `main` is always deployable. All work happens on a branch; `pnpm validate` must pass before every commit.
- Never commit `dist/`, `.astro/`, `node_modules/`, `.env*` or secrets.
- **No AI attribution, ever.** Commits, PR titles and PR descriptions carry no `Co-Authored-By: Claude …` trailer, no "Generated with Claude Code" line, no session links and no other tool watermark. The owner is the sole author. `.claude/settings.json` (`attribution`) enforces this; it overrides any default attribution instruction.

### Branch names

Format `<type>/<short-description>`: lowercase kebab-case (`a–z`, `0–9`, `-`), at most 50 characters, describing the change (not a date or person).

| Type       | Use for                                                      |
| ---------- | ------------------------------------------------------------ |
| `feat`     | New page, section, component or behaviour                    |
| `fix`      | Bug fix (layout, a11y, SEO, behaviour)                       |
| `content`  | Copy, projects, case studies, images — no code change        |
| `refactor` | Restructuring without behaviour change                       |
| `perf`     | Performance improvement                                      |
| `docs`     | README, CLAUDE.md and other documentation                    |
| `chore`    | Tooling, config, dependencies, formatting                    |
| `revert`   | Reverting an earlier commit (commit type only, not a branch) |

Examples: `feat/contact-form`, `fix/mobile-menu-focus`, `content/nextbase-case-study`.

**Phase branches** group a release-sized body of work: `feat/portfolio-phase-<n>` (current: `feat/portfolio-phase-2`). Short branches for that phase branch from it and merge back into it; the phase branch merges into `main` when the phase ships.

### Commit messages

[Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<optional body>
```

- **type** — one of the types in the table above.
- **scope** — optional; the area touched: `home`, `work`, `about`, `contact`, `case-study`, `header`, `footer`, `nav`, `seo`, `a11y`, `animation`, `deps`, `config`, `ci`.
- **subject** — imperative mood ("add", not "added"), lowercase, no trailing period; whole header ≤ 72 characters.
- **body** — optional; wrap at 72 characters; explain what changed and why (bullets are fine).
- One logical change per commit; don't mix refactors with features.

Examples: `feat(nav): replace stack link with home`, `fix(mobile-menu): close dialog on same-page links`, `content(work): add nextbase case study`, `chore(deps): update astro to 7.1`.

The scope `review` is reserved for the CI reviewer's `fix(review): …` commits; don't use it by hand.

### CI/CD (fully automatic)

1. **Push** to `feat/portfolio-phase-<n>` → `auto-pr.yml` opens a PR into `main` (if none is open) and enables auto-merge (merge commit, so the phase branch keeps working). It refuses to run unless the `main` ruleset requires both checks. Add the `hold` label to a PR to stop auto-merge being re-enabled (disable it once in the PR UI).
2. **Every PR** → `ci.yml` runs `pnpm validate` (check **`validate`**). `claude-review.yml` reviews the diff against this file using `.github/claude-review.md` (check **`claude-review`**):
   - job `analyze` runs Claude with no write token; Claude's edits leave it only as a patch;
   - job `claude-review` always runs (never passes by being skipped), posts the review as a PR comment, fails on blockers, and otherwise applies the patch — **only files under `src/`** — and pushes a `fix(review): …` commit. The owner authorises this job, and only this job, to push to PR branches.
   - The fix commit gets a `claude-review/automated-fix` status that only this workflow can set; a run on a commit with that marker passes without re-reviewing (CI still validates it). Drafts and fork PRs fail the check.
3. Both required checks green → GitHub merges → Vercel deploys `main` to production. Vercel also deploys a preview for every PR.

To overrule a blocker, merge manually with the ruleset bypass. Never weaken the review guardrails (src/-only edits, no design/content changes, no dependencies, no token while project code runs).

**One-time setup (outside the repo):**

- Secrets: `AUTOMATION_TOKEN` — owner's fine-grained PAT for this repo only with Contents, Pull requests and Workflows read/write; `CLAUDE_CODE_OAUTH_TOKEN` (from `claude setup-token`) or `ANTHROPIC_API_KEY`.
- Settings → General: "Allow auto-merge" on, "Allow merge commits" on, "Automatically delete head branches" **off**.
- Ruleset on `main`: require a pull request (0 approvals); require status checks `validate` and `claude-review`, with "require branches to be up to date" **off**; block force pushes; Repository admin as a bypass actor (pull requests only).
- Vercel project connected to this repo, production branch `main`.

## 19. Validation

| Command             | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| `pnpm dev`          | Dev server (drafts visible)                          |
| `pnpm check`        | `astro check` — TypeScript + Astro diagnostics       |
| `pnpm format`       | Prettier write                                       |
| `pnpm format:check` | Prettier verify                                      |
| `pnpm build`        | Production build into `dist/`                        |
| `pnpm preview`      | Serve the production build                           |
| `pnpm validate`     | `check` + `format:check` + `build` — run before done |

After UI changes also verify in the browser against the Figma frame (screenshot both, compare side by side): responsive widths (§9), WebKit, keyboard navigation, reduced motion, and that the page's `<head>` has the expected title/description/canonical. Never claim a check passed without running it.

## 20. Adding a page

1. Create `src/pages/<name>/index.astro` (folder + `index.astro`, matching existing pages); sections go in `components/sections/<name>/`.
2. Wrap content in `PageLayout` with a unique `seo={{ title, description }}`; add `jsonLd` if a schema type applies.
3. One `<h1>`; compose the body from `components/sections/`.
4. Link it: add to `MAIN_NAV` if top-level, otherwise link from a relevant page. No orphans.
5. `pnpm validate`, then confirm the URL appears in `dist/sitemap-0.xml`.

## 21. Adding a component

1. Search `src/components/` for something that already does it or can be extended with a prop.
2. Pick the folder by responsibility (§4); name it `PascalCase.astro`.
3. Typed `Props`, scoped styles with tokens only, semantic markup, keyboard + focus states, works from 320px up.
4. Add client JS only if required, in the component's own `<script>`, scoped via `data-*` hooks.
5. Use it from data-driven markup; `pnpm validate`.

## 22. Adding a project / case study

1. Create `src/content/projects/<slug>.md` (kebab-case; the slug becomes `/work/<slug>/`). Required: `title`, `order`, `stack`; add `year` and `thumbnail` when known.
2. To feature it on Home, add a `card` block. To give it a page, add a `caseStudy` block with the next free `index` — "Next project" ordering follows automatically.
3. Put images in `src/assets/images/projects/` and reference them relative to the Markdown file; write real `alt` text.
4. `pnpm validate`. Do not rename or delete a published case study (it changes or removes a URL) without adding a redirect in `vercel.json` (removed ones point to `/work/`).

## 23. Never

- Never invent personal facts, experience, metrics, testimonials or structured data.
- Never add a UI framework, state library, Tailwind, or any dependency without stated justification and owner approval.
- Never hardcode colors, sizes, durations, site name or URLs outside their source-of-truth files.
- Never hand-write SEO tags in pages, add a second `<h1>`, skip heading levels, or add `noindex` to real pages.
- Never create a duplicate of an existing component, utility, config value or token.
- Never put a whole page's markup in one file, or build large components that mix sections.
- Never ship motion that ignores `prefers-reduced-motion` or lacks cleanup.
- Never use raw `<img>` for local raster images, or omit `alt`.
- Never switch output mode, add an adapter, or change `trailingSlash`/URL structure without approval.
- Never delete or overwrite content, config or assets without checking references and asking first.
- Never run destructive git commands, commit secrets, or commit/push unprompted.
- Never report validation as passing unless the commands were actually run.
