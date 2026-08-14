import fs from 'fs';
import path from 'path';
import { FileItem } from '../types/mac';
import { formatBytes, formatDate } from './getProjects';

export const DOCUMENTS_CONTENT_DIR = path.join(process.cwd(), 'content', 'documents');

const PDF_EXT = /\.pdf$/i;

/**
 * Scans /content/documents at build time. Each subdirectory = one document;
 * the first `*.pdf` inside becomes an openable/downloadable desktop document.
 * Folders without a PDF are skipped. The PDF filename is the display name.
 */
export function scanDocuments(): FileItem[] {
  if (!fs.existsSync(DOCUMENTS_CONTENT_DIR)) {
    console.warn(
      `[generate-documents] Warning: content/documents/ does not exist — no desktop documents.`
    );
    return [];
  }

  const slugs = fs
    .readdirSync(DOCUMENTS_CONTENT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const documents: FileItem[] = [];
  for (const slug of slugs) {
    const folderPath = path.join(DOCUMENTS_CONTENT_DIR, slug);
    const pdfName = fs
      .readdirSync(folderPath)
      .filter((name) => PDF_EXT.test(name))
      .sort((a, b) => a.localeCompare(b))[0];

    if (!pdfName) continue;

    const stat = fs.statSync(path.join(folderPath, pdfName));
    documents.push({
      id: `${slug}-pdf`,
      name: pdfName,
      type: 'pdf',
      size: formatBytes(stat.size),
      modifiedDate: formatDate(stat.mtimeMs),
      parentFolderId: slug,
      pdfUrl: `/documents/${slug}/${pdfName}`,
    });
  }

  return documents;
}
