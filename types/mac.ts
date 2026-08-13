export type AppId = 'finder' | 'terminal' | 'notes' | 'mail' | 'settings' | 'textedit' | 'askai';

export type FileType = 'pdf' | 'png' | 'jpg' | 'md' | 'folder';

export interface PDFPageSection {
  heading?: string;
  text?: string;
  bullets?: string[];
  code?: string;
  metrics?: Array<{ label: string; value: string }>;
  diagramType?: 'architecture' | 'flow' | 'benchmark' | 'table';
}

export interface PDFPage {
  pageNumber: number;
  title?: string;
  sections: PDFPageSection[];
}

export interface PDFDocumentData {
  totalPages: number;
  title: string;
  subtitle: string;
  pages: PDFPage[];
}

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  size: string;
  modifiedDate: string;
  content?: string; // Markdown text
  imageUrl?: string; // Image path or SVG data URL
  pdfData?: PDFDocumentData;
  parentFolderId?: string;
}

export interface ProjectFolder {
  id: string;
  name: string;
  category: 'ai-rag' | 'agents' | 'vision-ml' | 'fullstack';
  categoryLabel: string;
  icon: string;
  date: string;
  shortDesc: string;
  files: FileItem[];
}

export type ThemeMode = 'dark' | 'light';

export type WallpaperPreset = 'sonoma-purple' | 'sequoia-dusk' | 'cyber-navy' | 'glass-light';

export type AccentColor = 'blue' | 'purple' | 'emerald' | 'orange';

export interface WindowState {
  id: AppId;
  title: string;
  icon: string; // Lucide icon name or indicator
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  fileData?: FileItem;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: 'ai-rag' | 'agents' | 'vision-ml' | 'fullstack';
  shortDesc: string;
  fullDesc: string;
  techStack: string[];
  metrics: string[];
  githubUrl: string;
  liveUrl?: string;
  featured?: boolean;
  date: string;
  stars?: number;
}

export interface NoteFolder {
  id: string;
  name: string;
  icon?: string;
  isSystem?: boolean;
}

export interface NoteItem {
  id: string;
  title: string;
  date: string;
  category: string;
  content: string;
  isPinned?: boolean;
  isLocked?: boolean;
  folderId?: string;
  sortOrder?: number;
}
