import { z } from 'zod';

// Single source of truth for project categories. The enum values below are the
// machine ids stored in each project's data.json; labels + icons are derived
// from this map so the Finder sidebar never hardcodes a separate filter list.
export const PROJECT_CATEGORY_IDS = ['ai-rag', 'agents', 'vision-ml', 'fullstack'] as const;

export type ProjectCategoryId = (typeof PROJECT_CATEGORY_IDS)[number];

export interface ProjectCategoryMeta {
  label: string;
  iconName: string;
  accentClass: string;
  order: number;
}

export const PROJECT_CATEGORY_META: Record<ProjectCategoryId, ProjectCategoryMeta> = {
  'ai-rag': { label: 'AI & RAG Architecture', iconName: 'Database', accentClass: 'text-blue-500', order: 0 },
  agents: { label: 'Autonomous AI Agents', iconName: 'Bot', accentClass: 'text-purple-500', order: 1 },
  'vision-ml': { label: 'Vision & Edge ML', iconName: 'Cpu', accentClass: 'text-emerald-500', order: 2 },
  fullstack: { label: 'Full-Stack AI Tools', iconName: 'Layers', accentClass: 'text-amber-500', order: 3 },
};

/**
 * data.json schema. Every field is validated at build time by
 * scripts/generate-projects.ts — a bad folder fails the build with a message
 * naming the project and the offending field.
 *
 * - The folder name IS the project slug/id; never duplicated here.
 * - `highlights` maps to metrics/impact bullets across the OS.
 * - `shortDesc`/`fullDesc`/`date`/`featured` are optional and fall back to
 *   derived values (highlights[0], README intro, folder mtime, false).
 */
export const ProjectJsonSchema = z.object({
  title: z.string().min(1),
  category: z.enum(PROJECT_CATEGORY_IDS),
  techStack: z.array(z.string()).min(1),
  githubUrl: z.url().nullable(),
  liveUrl: z.url().nullable(),
  highlights: z.array(z.string()).min(1),
  shortDesc: z.string().optional(),
  fullDesc: z.string().optional(),
  date: z.string().optional(),
  featured: z.boolean().optional(),
});

export type ProjectJson = z.infer<typeof ProjectJsonSchema>;
