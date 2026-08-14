import {
  ARYAN_PROFILE,
  PORTFOLIO_INFO,
  NOTES_DATA,
  SKILLS_CATEGORIZED,
  RESUME_PROJECT_IDS,
  EDUCATION,
  COURSEWORK,
  ACHIEVEMENTS,
  CONTACT,
} from '@/content/aryan';
import { GENERATED_PROJECTS } from '@/lib/projects.generated';
import { ProjectItem } from '@/types/mac';

// Project data is derived from /content/projects at build time, never
// hardcoded. GENERATED_PROJECTS (ProjectFolder[]) is mapped into the richer
// ProjectItem shape used by Spotlight, Terminal, Ask-AI and ResumeApp.
export const PROJECTS_DATA: ProjectItem[] = GENERATED_PROJECTS.map((p) => ({
  id: p.id,
  title: p.name,
  category: p.category,
  shortDesc: p.shortDesc,
  fullDesc: p.fullDesc,
  techStack: p.techStack,
  metrics: p.highlights,
  githubUrl: p.githubUrl ?? '',
  liveUrl: p.liveUrl ?? undefined,
  featured: p.featured,
  date: p.date,
}));

export const RESUME_PROJECTS = PROJECTS_DATA.filter((p) =>
  RESUME_PROJECT_IDS.includes(p.id)
);

export {
  ARYAN_PROFILE,
  PORTFOLIO_INFO,
  NOTES_DATA,
  SKILLS_CATEGORIZED,
  RESUME_PROJECT_IDS,
  EDUCATION,
  COURSEWORK,
  ACHIEVEMENTS,
  CONTACT,
};
