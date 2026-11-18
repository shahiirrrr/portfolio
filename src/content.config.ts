import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Projects: one Markdown file per project in `src/content/projects/`.
 * The filename (without extension) is the slug: `/work/<filename>/`.
 *
 * Every project appears in the Work list. A project only gets a case-study
 * page when it has a `caseStudy` block; the case studies form a cycle ordered
 * by `caseStudy.index` ("01 / 04", next project wraps to the first).
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(70),
      /** Position in the Work list (01, 02, …). */
      order: z.number().int().positive(),
      /** Technologies, shown joined with " · ". Also drive the Work filter chips. */
      stack: z.array(z.string()).min(1),
      /** Omit while a project has no year yet (rendered as "–"). */
      year: z.number().int().optional(),
      /** Thumbnail shown on Work-row hover and in the grid view. */
      thumbnail: image().optional(),
      /** Home "Selected work" card. Present only on featured projects. */
      card: z
        .object({
          /** Position in the Home rail. */
          order: z.number().int().positive(),
          /**
           * Project category, e.g. ["BigCommerce B2B", "Storefront"]. Not shown on
           * the card; used in the case-study cover's fallback alt text.
           */
          category: z.array(z.string()).min(1),
          /** Stack shown on the card when it differs from the Work list. */
          stack: z.array(z.string()).optional(),
          image: image(),
        })
        .optional(),
      caseStudy: z
        .object({
          /** Position in the case-study cycle. */
          index: z.number().int().positive(),
          /** Doubles as the meta description when 50–160 characters. */
          subtitle: z.string().optional(),
          role: z.string().optional(),
          timeline: z.string().optional(),
          live: z.object({ label: z.string(), url: z.url() }).optional(),
          overview: z.object({ heading: z.string(), body: z.string() }).optional(),
          stats: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
          cover: z
            .object({
              src: image(),
              /** Optional tighter crop used below 768px (the mobile frame uses its own). */
              srcMobile: image().optional(),
              alt: z.string().min(1),
            })
            .optional(),
          /**
           * Product walkthrough after the stats: one row per product or surface
           * (showcase image, caption, feature tags). For multi-product projects.
           */
          showcase: z
            .object({
              heading: z.string(),
              items: z
                .array(
                  z.object({
                    title: z.string(),
                    body: z.string(),
                    tags: z.array(z.string()).default([]),
                    /** Optional live example of this product, e.g. a public profile. */
                    link: z.object({ label: z.string(), url: z.url() }).optional(),
                    image: image(),
                    alt: z.string().min(1),
                  }),
                )
                .min(1),
            })
            .optional(),
          /** Before / after pair. */
          media: z.array(z.object({ src: image(), alt: z.string().min(1) })).default([]),
          /** Image shown in the "Next project" panel when this project is the next one. */
          teaser: image().optional(),
        })
        .optional(),
      /** Drafts render in dev only. */
      draft: z.boolean().default(false),
    }),
});

export const collections = { projects };
