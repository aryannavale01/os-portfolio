import { FileItem, ProjectFolder } from '@/types/mac';
import { PROJECT_CATEGORY_META, ProjectCategoryId } from '@/content/schema';
import { GENERATED_PROJECTS } from '@/lib/projects.generated';
import {
  ARYAN_PROFILE,
  SKILLS_CATEGORIZED,
  EDUCATION,
  COURSEWORK,
  ACHIEVEMENTS,
} from '@/content/aryan';
import { RESUME_PROJECTS } from '@/lib/data';

export interface ProjectCategory {
  id: 'all' | ProjectCategoryId;
  label: string;
  iconName: string;
  accentClass: string;
}

const resumeContact = `${ARYAN_PROFILE.location} • ${ARYAN_PROFILE.email} • github.com/aryannavale01 • linkedin.com/in/aryan-navale-207961291`;

export const DESKTOP_FILES: FileItem[] = [
  {
    id: 'desktop-resume-pdf',
    name: 'Resume.pdf',
    type: 'pdf',
    size: '1.2 MB',
    modifiedDate: 'Today at 8:30 AM',
    pdfData: {
      totalPages: 2,
      title: 'Aryan_Navale_Resume.pdf',
      subtitle: 'Aspiring AI Engineer — Full-Stack Developer',
      pages: [
        {
          pageNumber: 1,
          title: 'Professional Summary & Technical Skills',
          sections: [
            {
              heading: 'Aryan Navale',
              text: resumeContact,
            },
            {
              heading: 'Executive Summary',
              text: ARYAN_PROFILE.summary,
            },
            {
              heading: 'Technical Skills',
              metrics: SKILLS_CATEGORIZED.map((cat) => ({
                label: cat.category,
                value: cat.skills.join(', '),
              })),
            },
          ],
        },
        {
          pageNumber: 2,
          title: 'Projects, Education & Achievements',
          sections: [
            {
              heading: 'Key Projects',
              bullets: RESUME_PROJECTS.map(
                (p) => `${p.title} — ${p.shortDesc} ${p.metrics.join(' | ')}`
              ),
            },
            {
              heading: 'Education',
              text: `${EDUCATION.degree} — ${EDUCATION.college} (${EDUCATION.years})\nRelevant coursework: ${COURSEWORK.join(', ')}`,
            },
            {
              heading: 'Achievements',
              bullets: ACHIEVEMENTS,
            },
          ],
        },
      ],
    },
  },
];

// Projects are generated from /content/projects at build time — never hardcode
// a project list in component code. See scripts/generate-projects.ts.
export const PROJECTS_FS: ProjectFolder[] = GENERATED_PROJECTS;

const PROJECT_CATEGORY_IDS_PRESENT: ProjectCategoryId[] = Array.from(
  new Set(PROJECTS_FS.map((p) => p.category))
).sort((a, b) => PROJECT_CATEGORY_META[a].order - PROJECT_CATEGORY_META[b].order);

// Sidebar category filters are derived from the categories actually present
// across projects (ordered by the taxonomy in content/schema.ts), so the filter
// list can never drift from the real data.
export const PROJECT_CATEGORIES: ProjectCategory[] = [
  { id: 'all', label: 'All Projects', iconName: 'Folder', accentClass: 'text-blue-400' },
  ...PROJECT_CATEGORY_IDS_PRESENT.map((id) => ({
    id,
    label: PROJECT_CATEGORY_META[id].label,
    iconName: PROJECT_CATEGORY_META[id].iconName,
    accentClass: PROJECT_CATEGORY_META[id].accentClass,
  })),
];
