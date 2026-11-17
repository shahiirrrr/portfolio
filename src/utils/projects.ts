import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;
/** A project that has a case-study page. */
export type CaseStudy = Project & {
  data: { caseStudy: NonNullable<Project['data']['caseStudy']> };
};
/** A project featured in the Home rail. */
export type FeaturedProject = Project & { data: { card: NonNullable<Project['data']['card']> } };

function hasCaseStudy(project: Project): project is CaseStudy {
  return project.data.caseStudy !== undefined;
}

function hasCard(project: Project): project is FeaturedProject {
  return project.data.card !== undefined;
}

/**
 * All visible projects in Work-list order.
 * Drafts are visible in `astro dev` and excluded from production builds.
 */
export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection('projects', ({ data }) =>
    import.meta.env.PROD ? !data.draft : true,
  );
  return projects.sort((a, b) => a.data.order - b.data.order);
}

/** Projects with a case-study page, in cycle order (01 / 04 …). */
export async function getCaseStudies(): Promise<CaseStudy[]> {
  const projects = await getProjects();
  return projects
    .filter(hasCaseStudy)
    .sort((a, b) => a.data.caseStudy.index - b.data.caseStudy.index);
}

/** Projects shown in the Home "Selected work" rail, in rail order. */
export async function getFeaturedProjects(): Promise<FeaturedProject[]> {
  const projects = await getProjects();
  return projects.filter(hasCard).sort((a, b) => a.data.card.order - b.data.card.order);
}

/** Canonical path of a project's case study, or `undefined` when it has none. */
export function projectPath(project: Project): string | undefined {
  return hasCaseStudy(project) ? `/work/${project.id}/` : undefined;
}

/** "BigCommerce · React · Stencil" */
export function formatStack(stack: string[]): string {
  return stack.join(' · ');
}
