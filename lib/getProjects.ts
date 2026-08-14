import fs from 'fs';
import path from 'path';
import { FileItem, ProjectFolder } from '../types/mac';
import { PROJECT_CATEGORY_META, ProjectJsonSchema } from '../content/schema';

export const PROJECTS_CONTENT_DIR = path.join(process.cwd(), 'content', 'projects');

const IMAGE_EXT = /\.(png|jpe?g)$/i;
const PDF_EXT = /\.pdf$/i;

export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${Math.max(1, Math.round(bytes / 1_000))} KB`;
  return `${bytes} B`;
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function readJson(slug: string): unknown {
  const filePath = path.join(PROJECTS_CONTENT_DIR, slug, 'data.json');
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `[generate-projects] Missing data.json in content/projects/${slug}/ — every project folder needs a valid data.json.`
    );
  }
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    throw new Error(
      `[generate-projects] Unparseable JSON in content/projects/${slug}/data.json: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
  const parsed = ProjectJsonSchema.safeParse(raw);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(
      `[generate-projects] Invalid data.json in content/projects/${slug}/:\n${details}`
    );
  }
  return parsed.data;
}

function readReadme(slug: string, title: string): { content: string; warned: boolean } {
  const filePath = path.join(PROJECTS_CONTENT_DIR, slug, 'README.md');
  if (!fs.existsSync(filePath)) {
    console.warn(
      `[generate-projects] Warning: content/projects/${slug}/ has no README.md — rendering a placeholder write-up.`
    );
    return {
      content: `# ${title}\n\n_No write-up yet._`,
      warned: true,
    };
  }
  return { content: fs.readFileSync(filePath, 'utf8'), warned: false };
}

function firstParagraph(markdown: string): string {
  const cleaned = markdown
    .split(/\n+/)
    .map((line) => line.replace(/^#{1,6}\s*/, '').replace(/^>\s*/, '').trim())
    .filter((line) => line.length > 20 && !/^!\[/.test(line));
  return cleaned[0] || '';
}

export function scanProject(slug: string): ProjectFolder {
  const folderPath = path.join(PROJECTS_CONTENT_DIR, slug);
  const meta = readJson(slug) as ReturnType<typeof ProjectJsonSchema.parse>;
  const categoryMeta = PROJECT_CATEGORY_META[meta.category];

  const readme = readReadme(slug, meta.title);
  const entries = fs
    .readdirSync(folderPath)
    .filter((name) => !name.startsWith('.') && name !== 'data.json' && name !== 'README.md')
    .sort((a, b) => a.localeCompare(b));

  const images = entries
    .filter((name) => IMAGE_EXT.test(name))
    .sort((a, b) => a.localeCompare(b))
    .map((name, idx) => {
      const stat = fs.statSync(path.join(folderPath, name));
      const file: FileItem = {
        id: `${slug}-img-${String(idx + 1).padStart(2, '0')}`,
        name,
        type: name.toLowerCase().endsWith('.jpg') || name.toLowerCase().endsWith('.jpeg') ? 'jpg' : 'png',
        size: formatBytes(stat.size),
        modifiedDate: formatDate(stat.mtimeMs),
        parentFolderId: slug,
        imageUrl: `/projects/${slug}/${name}`,
      };
      return file;
    });

  const pdfName = entries.find((name) => PDF_EXT.test(name));
  const pdf: FileItem | null = pdfName
    ? (() => {
        const stat = fs.statSync(path.join(folderPath, pdfName));
        return {
          id: `${slug}-pdf`,
          name: pdfName,
          type: 'pdf',
          size: formatBytes(stat.size),
          modifiedDate: formatDate(stat.mtimeMs),
          parentFolderId: slug,
          pdfUrl: `/projects/${slug}/${pdfName}`,
        } as FileItem;
      })()
    : null;

  const readmeFile: FileItem = {
    id: `${slug}-readme`,
    name: 'README.md',
    type: 'md',
    size: formatBytes(Buffer.byteLength(readme.content, 'utf8')),
    modifiedDate: readme.warned
      ? 'N/A'
      : formatDate(fs.statSync(path.join(folderPath, 'README.md')).mtimeMs),
    parentFolderId: slug,
    content: readme.content,
  };

  const date =
    meta.date ||
    new Date(fs.statSync(folderPath).mtimeMs).toISOString().slice(0, 7);

  return {
    id: slug,
    name: meta.title,
    category: meta.category,
    categoryLabel: categoryMeta.label,
    icon: categoryMeta.iconName,
    date,
    shortDesc: meta.shortDesc || meta.highlights[0] || meta.title,
    fullDesc:
      meta.fullDesc ||
      firstParagraph(readme.content) ||
      meta.highlights.join(' ') ||
      meta.title,
    featured: meta.featured ?? false,
    techStack: meta.techStack,
    highlights: meta.highlights,
    githubUrl: meta.githubUrl,
    liveUrl: meta.liveUrl,
    files: [readmeFile, ...images, ...(pdf ? [pdf] : [])],
  };
}

/**
 * Scans /content/projects at build time. Each subdirectory = one project.
 * Throws on any invalid project (missing data.json, bad schema fields).
 */
export function scanProjects(): ProjectFolder[] {
  if (!fs.existsSync(PROJECTS_CONTENT_DIR)) {
    throw new Error(
      `[generate-projects] content/projects/ does not exist. Create it and add at least one project folder.`
    );
  }
  const slugs = fs
    .readdirSync(PROJECTS_CONTENT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  return slugs.map((slug) => scanProject(slug));
}
