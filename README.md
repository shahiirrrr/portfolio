# Shahir — Portfolio

Source code for the personal portfolio of Shahir, a frontend engineer from Wayanad, Kerala. It is a
fast, statically generated, SEO-first website built with **Astro**, **TypeScript** and **GSAP**,
implemented from a Figma design.

## Features

- **Static output.** Every page is pre-rendered HTML with no server and almost no JavaScript by
  default. Each script exists for a specific interaction.
- **Pages:** Home, Work (with tag filters and a list/grid view), a case study per project, About,
  Contact and a custom 404.
- **SEO:** unique titles and descriptions, canonical URLs, Open Graph and Twitter cards, JSON-LD
  structured data (`WebSite`, `Person`, `ProfilePage`, `CreativeWork`), an automatic sitemap and
  `robots.txt`.
- **Accessibility:** semantic landmarks, a skip link, visible focus styles, keyboard-operable
  controls, a native `<dialog>` mobile menu, and a reduced-motion version of every animation.
- **Motion:** GSAP ScrollTrigger and SplitText animations, including a pinned process dial, word
  reveals, parallax and a card-to-case-study transition (the card expands to full screen and settles
  into the case study's full-screen cover hero). Every effect has a reduced-motion fallback, and all content is visible
  without JavaScript.
- **Smooth scrolling:** Lenis on mouse and trackpad devices, synced to GSAP's ticker. Touch devices
  and reduced-motion users keep native scrolling.
- **Content collections:** projects and case studies are Markdown files validated by a Zod schema.
- **Performance:** self-hosted fonts with metric-matched fallbacks, and responsive AVIF/WebP images
  through `astro:assets`.

## Tech stack

| Tool                                                                      | Purpose                                                    |
| ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| [Astro](https://astro.build) 7                                            | Framework, static site generation                          |
| TypeScript 6 (strict)                                                     | Type safety                                                |
| [GSAP](https://gsap.com) 3 (ScrollTrigger, SplitText, Flip, ScrambleText) | Animation                                                  |
| [Lenis](https://github.com/darkroomengineering/lenis) 1.3                 | Smooth scrolling                                           |
| Plain CSS with custom properties and cascade layers                       | Styling, with design tokens from Figma                     |
| Astro Fonts API (Fontsource)                                              | Self-hosted Manrope, JetBrains Mono, Antonio and Unbounded |
| `@astrojs/sitemap`                                                        | Sitemap                                                    |
| Prettier + `prettier-plugin-astro`                                        | Formatting                                                 |
| pnpm                                                                      | Package manager                                            |
| Vercel                                                                    | Hosting                                                    |

## Getting started

**Requirements:** Node.js 22.23.4 or newer (`.nvmrc` pins 26, which CI uses) and
[pnpm](https://pnpm.io/installation) 12.

```bash
pnpm install
pnpm dev          # http://localhost:4321
```

| Command             | What it does                                                |
| ------------------- | ----------------------------------------------------------- |
| `pnpm dev`          | Start the dev server (draft content visible)                |
| `pnpm build`        | Build the production site into `dist/`                      |
| `pnpm preview`      | Serve the production build locally                          |
| `pnpm check`        | Type-check and run Astro diagnostics                        |
| `pnpm format`       | Format all files with Prettier                              |
| `pnpm format:check` | Check formatting                                            |
| `pnpm validate`     | `check` + `format:check` + `build`; run before every commit |

## Project structure

```text
src/
├── config/        site identity, navigation, SEO defaults
├── content/       projects and case studies (Markdown, one file per project)
├── data/          structured page copy (experience, stack, FAQ, …)
├── assets/        images and icons exported from Figma
├── styles/        global CSS, design tokens, utilities
├── scripts/       GSAP animations, smooth scrolling
├── layouts/       document shell and page chrome
├── components/    common, layout, ui and per-page sections
└── pages/         routes
```

Site identity (name, URL, contact details, social links) lives in `src/config/site.ts`.

### Adding a project

Create `src/content/projects/<slug>.md`; the filename becomes the URL `/work/<slug>/`. A `card`
block puts the project in the Home page's "Selected work" rail, and a `caseStudy` block gives it its
own page. The schema in `src/content.config.ts` validates the fields.

## Development workflow

Development conventions (architecture, styling, SEO, accessibility, animation, branches and commits)
are documented in [`CLAUDE.md`](CLAUDE.md).

- **Branches:** `<type>/<short-description>` (e.g. `feat/contact-form`). Work for a release goes to a
  phase branch, `feat/portfolio-phase-<n>`.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/), e.g.
  `feat(home): add hero animation`.
- **CI/CD (GitHub Actions + Vercel):** every pull request runs `pnpm validate` and an automated
  review. Pushing to a phase branch opens a pull request into `main` that merges automatically once
  both checks pass, and Vercel then deploys `main` to production. Every pull request also gets a
  Vercel preview deployment.

## License

- **Code:** [MIT](LICENSE). You're welcome to learn from it and reuse it.
- **Content:** © Shahir, all rights reserved. Photographs, written copy, case studies, images, the CV
  and the personal branding are **not** covered by the MIT License. See
  [`CONTENT-LICENSE.md`](CONTENT-LICENSE.md). If you fork this project, replace them with your own.
- **Third-party:** dependencies keep their own licenses. GSAP is used under the
  [GSAP Standard License](https://gsap.com/standard-license), Astro and Lenis under MIT, and the
  fonts under the SIL Open Font License.

Security issues: please see [`SECURITY.md`](SECURITY.md).
