import fs from 'fs';
import path from 'path';
import { FileItem, ResearchFolder } from '../types/mac';
import { formatBytes, formatDate } from './getProjects';

export const RESEARCH_CONTENT_DIR = path.join(process.cwd(), 'content', 'research');

const IMAGE_EXT = /\.(png|jpe?g)$/i;
const PDF_EXT = /\.pdf$/i;

function titleFromSlug(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((word) =>
      word.length <= 3 ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ');
}

function firstParagraph(markdown: string): string {
  const cleaned = markdown
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 20 && !/^#/.test(line) && !/^!\[/.test(line));
  return cleaned[0] || '';
}

/**
 * Scans /content/research at build time. Each subdirectory = one research
 * topic: README.md (notes) + optional images + optional PDFs. Folders without a
 * README still appear, using the folder name and a placeholder description.
 */
export function scanResearch(): ResearchFolder[] {
  if (!fs.existsSync(RESEARCH_CONTENT_DIR)) {
    console.warn(
      `[generate-research] Warning: content/research/ does not exist — no research topics.`
    );
    return [];
  }

  const slugs = fs
    .readdirSync(RESEARCH_CONTENT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  return slugs.map((slug) => {
    const folderPath = path.join(RESEARCH_CONTENT_DIR, slug);
    const entries = fs
      .readdirSync(folderPath)
      .filter((name) => !name.startsWith('.'))
      .sort((a, b) => a.localeCompare(b));

    const readmePath = path.join(folderPath, 'README.md');
    const hasReadme = fs.existsSync(readmePath);
    const readmeContent = hasReadme ? fs.readFileSync(readmePath, 'utf8') : '';

    const images = entries
      .filter((name) => IMAGE_EXT.test(name))
      .map((name, idx) => {
        const stat = fs.statSync(path.join(folderPath, name));
        const file: FileItem = {
          id: `${slug}-img-${String(idx + 1).padStart(2, '0')}`,
          name,
          type: /\.jpe?g$/i.test(name) ? 'jpg' : 'png',
          size: formatBytes(stat.size),
          modifiedDate: formatDate(stat.mtimeMs),
          parentFolderId: slug,
          imageUrl: `/research/${slug}/${name}`,
        };
        return file;
      });

    const pdfs = entries
      .filter((name) => PDF_EXT.test(name))
      .map((name) => {
        const stat = fs.statSync(path.join(folderPath, name));
        const file: FileItem = {
          id: `${slug}-pdf-${name.replace(/\.[^.]+$/, '').toLowerCase()}`,
          name,
          type: 'pdf',
          size: formatBytes(stat.size),
          modifiedDate: formatDate(stat.mtimeMs),
          parentFolderId: slug,
          pdfUrl: `/research/${slug}/${name}`,
        };
        return file;
      });

    const readmeFile: FileItem = {
      id: `${slug}-readme`,
      name: 'README.md',
      type: 'md',
      size: formatBytes(Buffer.byteLength(readmeContent, 'utf8')),
      modifiedDate: hasReadme ? formatDate(fs.statSync(readmePath).mtimeMs) : 'N/A',
      parentFolderId: slug,
      content: readmeContent,
    };

    const name = titleFromSlug(slug);
    const shortDesc = firstParagraph(readmeContent) || `Research notes on ${name}.`;

    return {
      id: slug,
      name,
      date: formatDate(fs.statSync(folderPath).mtimeMs),
      shortDesc,
      files: [readmeFile, ...images, ...pdfs],
    };
  });
}
