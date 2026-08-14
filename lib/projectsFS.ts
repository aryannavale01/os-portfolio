import { FileItem, ProjectFolder, ResearchFolder } from '@/types/mac';
import { PROJECT_CATEGORY_META, ProjectCategoryId } from '@/content/schema';
import { GENERATED_PROJECTS } from '@/lib/projects.generated';
import { GENERATED_DOCUMENTS } from '@/lib/documents.generated';
import { GENERATED_RESEARCH } from '@/lib/research.generated';

export interface ProjectCategory {
  id: 'all' | ProjectCategoryId;
  label: string;
  iconName: string;
  accentClass: string;
}

// Documents are generated from /content/documents at build time — every PDF
// dropped into a folder there becomes a desktop icon. Never hardcode a doc
// here. See scripts/generate-documents.ts and content/documents/README.md.
export const DESKTOP_FILES: FileItem[] = GENERATED_DOCUMENTS;

// Projects are generated from /content/projects at build time — never hardcode
// a project list in component code. See scripts/generate-projects.ts.
export const PROJECTS_FS: ProjectFolder[] = GENERATED_PROJECTS;

// Research topics are generated from /content/research at build time. They are
// browsed from the desktop Research folder and Finder's Research sidebar entry.
export const RESEARCH_FS: ResearchFolder[] = GENERATED_RESEARCH;

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
