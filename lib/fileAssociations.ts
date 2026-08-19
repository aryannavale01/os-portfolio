import type { FileItem } from '@/types/mac';

export function getFileTypeLabel(file: FileItem): string {
  if (file.type === 'folder') return 'Folder';
  const ext = file.name.split('.').pop()?.toUpperCase() || '';
  if (ext === 'PDF') return 'PDF Document';
  if (ext === 'MD') return 'Markdown Document';
  if (ext === 'PNG') return 'PNG Image';
  if (ext === 'JPG' || ext === 'JPEG') return 'JPEG Image';
  return 'Document';
}
