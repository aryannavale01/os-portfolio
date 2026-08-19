'use client';

import React, { useState, useMemo, memo } from 'react';
import { FileItem, ProjectFolder, ResearchFolder } from '@/types/mac';
import { PROJECT_CATEGORIES, PROJECTS_FS, RESEARCH_FS, DESKTOP_FILES } from '@/lib/projectsFS';
import { getFileTypeLabel } from '@/lib/fileAssociations';
import { ProjectGallery } from '@/components/ProjectGallery';
import { useTheme } from '@/components/context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { springSnappy, staggerContainer, staggerItem, getAnimationConfig } from '@/lib/animations';
import {
  Folder,
  FileText,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  Grid,
  List,
  Info,
  ExternalLink,
  Github,
  Database,
  Bot,
  Cpu,
  Layers,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Category icons are looked up by the iconName stored in content/schema.ts so
// the sidebar never hardcodes an icon per category id.
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Folder,
  Database,
  Bot,
  Cpu,
  Layers,
};

interface FinderAppProps {
  onOpenFile?: (file: FileItem) => void;
  onQuickLook?: (images: FileItem[], index: number) => void;
  initialRoot?: 'projects' | 'research';
  initialFolderId?: string | null;
}

function isProjectFolder(
  folder: ProjectFolder | ResearchFolder
): folder is ProjectFolder {
  return 'techStack' in folder;
}

export const FinderApp = memo(function FinderApp({
  onOpenFile,
  onQuickLook,
  initialRoot = 'projects',
  initialFolderId = null,
}: FinderAppProps) {
  const { sidebarWidth, sidebarIconSize } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const animCfg = getAnimationConfig(prefersReducedMotion);

  // Navigation State
  const [rootView, setRootView] = useState<'projects' | 'research'>(initialRoot);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(initialFolderId); // null = root view
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selection & Context Menu
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    file: FileItem | null;
  } | null>(null);

  // Get Info Popover
  const [infoFile, setInfoFile] = useState<FileItem | null>(null);

  // Responsive Sidebar Width
  const sidebarWidthClass =
    sidebarWidth === 'compact'
      ? 'w-40 md:w-48'
      : sidebarWidth === 'wide'
        ? 'w-40 md:w-72'
        : 'w-40 md:w-64';
  const sidebarIconClass =
    sidebarIconSize === 'small' ? 'w-3.5 h-3.5' : sidebarIconSize === 'large' ? 'w-5 h-5' : 'w-4 h-4';

  // Current active folder object (if inside a folder) — resolves from the
  // active root (Projects Directory or Research library).
  const activeFolder = useMemo(() => {
    if (!currentFolderId) return null;
    const collection = rootView === 'research' ? RESEARCH_FS : PROJECTS_FS;
    return collection.find((f) => f.id === currentFolderId) || null;
  }, [currentFolderId, rootView]);

  // Filter project folders at root level by category & search
  const filteredProjectFolders = useMemo(() => {
    return PROJECTS_FS.filter((proj) => {
      if (selectedCategory !== 'all' && proj.category !== selectedCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        proj.name.toLowerCase().includes(q) ||
        proj.shortDesc.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  // Filter research topics at root level by search
  const filteredResearchFolders = useMemo(() => {
    return RESEARCH_FS.filter((topic) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        topic.name.toLowerCase().includes(q) ||
        topic.shortDesc.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  // Root-level folders currently shown (drives grid/list rendering below)
  const rootFolders = rootView === 'research' ? filteredResearchFolders : filteredProjectFolders;

  // Files inside current folder (if inside a project folder). Images are shown
  // through the gallery carousel above, so they are excluded from the flat list.
  const currentFolderFiles = useMemo(() => {
    if (!activeFolder) return [];
    const list = activeFolder.files.filter((f) => !f.imageUrl);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (f) => f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q)
    );
  }, [activeFolder, searchQuery]);

  // Sorted gallery images for the current project folder
  const folderImages = useMemo(() => {
    if (!activeFolder) return [];
    return activeFolder.files.filter((f) => !!f.imageUrl);
  }, [activeFolder]);

  // All PDF documents across the desktop, research, and every project
  const allDocuments = useMemo(() => {
    const desktopPdfs = DESKTOP_FILES.filter((f) => f.type === 'pdf').map((file) => ({
      file,
      folderName: 'Desktop',
    }));
    const researchPdfs = RESEARCH_FS.flatMap((topic) =>
      topic.files
        .filter((f) => f.type === 'pdf')
        .map((file) => ({ file, folderName: topic.name }))
    );
    const projectPdfs = PROJECTS_FS.flatMap((proj) =>
      proj.files
        .filter((f) => f.type === 'pdf')
        .map((file) => ({ file, folderName: proj.name }))
    );
    return [...desktopPdfs, ...researchPdfs, ...projectPdfs];
  }, []);

  // Handle Double Click Folder Navigation
  const handleOpenFolder = (folderId: string) => {
    setCurrentFolderId(folderId);
    setSelectedItemId(null);
  };

  // Navigate Up / Back
  const handleNavigateUp = () => {
    setCurrentFolderId(null);
    setSelectedItemId(null);
  };

  // Switch between the Projects Directory and the Research library
  const handleSelectRoot = (root: 'projects' | 'research') => {
    setRootView(root);
    setCurrentFolderId(null);
    setSelectedCategory('all');
    setSelectedItemId(null);
  };

  // Right Click Handler
  const handleContextMenu = (e: React.MouseEvent, file: FileItem) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedItemId(file.id);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      file,
    });
  };

  // Close Context Menu
  const closeContextMenu = () => setContextMenu(null);

  return (
    <div
      onClick={() => {
        setSelectedItemId(null);
        closeContextMenu();
      }}
      className="flex h-full w-full select-none bg-surface-container-low text-on-surface overflow-hidden font-sans relative"
    >
      {/* COLUMN 1: Sidebar (hidden on mobile so the content gets full width) */}
      <div
        className={`hidden md:flex ${sidebarWidthClass} min-w-0 border-r border-outline-variant bg-surface-container-high/50 p-3 flex flex-col justify-between shrink-0 text-xs overflow-y-auto`}
      >
        <div className="space-y-4">
          {/* Favorites Header */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">
              Favorites
            </div>
            <div className="space-y-0.5">
              <motion.button
                onClick={() => handleSelectRoot('projects')}
                whileTap={{ scale: 0.97 }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  rootView === 'projects' && currentFolderId === null && selectedCategory === 'all'
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container-high/60'
                }`}
              >
                <Folder className={`${sidebarIconClass} text-blue-400 shrink-0`} />
                <span className="truncate">Projects Directory</span>
              </motion.button>

              <motion.button
                onClick={() => handleSelectRoot('research')}
                whileTap={{ scale: 0.97 }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  rootView === 'research' && currentFolderId === null
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container-high/60'
                }`}
              >
                <Folder className={`${sidebarIconClass} text-purple-400 shrink-0`} />
                <span className="truncate">Research Library</span>
              </motion.button>
            </div>
          </div>

          {/* Project Categories (only for the Projects Directory root) */}
          {rootView === 'projects' && (
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">
              Categories
            </div>
            <div className="space-y-0.5">
              {PROJECT_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id && currentFolderId === null;
                return (
                  <motion.button
                    key={cat.id}
                    onClick={() => {
                      setRootView('projects');
                      setSelectedCategory(cat.id);
                      setCurrentFolderId(null);
                    }}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-container text-on-primary-container font-bold shadow-xs'
                        : 'text-on-surface-variant hover:bg-surface-container-high/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {(() => {
                        const Icon = CATEGORY_ICONS[cat.iconName] ?? Folder;
                        return (
                          <Icon className={`${sidebarIconClass} ${cat.accentClass} shrink-0`} />
                        );
                      })()}
                      <span className="truncate">{cat.label}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
          )}

          {/* Documents */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">
              Documents
            </div>
            <div className="space-y-0.5">
              {allDocuments.map((doc) => (
                <button
                  key={doc.file.id}
                  onClick={() => {
                    if (onOpenFile) onOpenFile(doc.file);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-medium transition-colors text-on-surface-variant hover:bg-surface-container-high/60"
                  title={doc.folderName}
                >
                  <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="truncate">{doc.file.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-3 border-t border-outline-variant/80 text-[10px] text-on-surface-variant text-center font-medium">
          {PROJECTS_FS.length} Projects • {RESEARCH_FS.length} Research Topics
        </div>
      </div>

      {/* COLUMN 2: Main Content Stage */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-container">
        {/* Top Finder Navigation Toolbar */}
        <div className="h-11 px-3 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between text-xs shrink-0 select-none">
          {/* Left: Back / Forward & Breadcrumbs */}
          <div className="flex items-center gap-2 truncate">
            <button
              onClick={handleNavigateUp}
              disabled={currentFolderId === null}
              className="p-1 rounded-md hover:bg-surface-container-high disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-on-surface-variant"
              title="Navigate Up (Projects Directory)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-1.5 font-medium text-on-surface-variant text-xs truncate">
              <button
                onClick={handleNavigateUp}
                className="hover:text-secondary font-bold hover:underline transition-colors"
              >
                {rootView === 'research' ? 'Research' : 'Projects'}
              </button>
              {activeFolder && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
                  <span className="font-bold text-on-surface truncate">
                    {activeFolder.name}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Toolbar: View Toggle & Search */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Grid / List Toggle */}
            <div className="flex items-center bg-surface-container-high/80 p-0.5 rounded-lg border border-outline-variant/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-surface-container-high shadow-xs text-secondary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-surface-container-high shadow-xs text-secondary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-36 sm:w-48 pl-8 pr-2 py-1 text-xs rounded-lg bg-surface-container-high/60 border border-outline-variant/50 focus:outline-none focus:ring-1 focus:ring-primary text-on-surface placeholder-on-surface-variant"
              />
            </div>
          </div>
        </div>

        {/* Finder Content Stage */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 select-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFolderId || 'root'}
              initial={prefersReducedMotion ? false : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={animCfg.smoothTransition}
            >
          {/* ROOT LEVEL: Showing Project Folders */}
          {!activeFolder ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider text-[11px]">
                  {rootView === 'research'
                    ? 'Research Library'
                    : selectedCategory === 'all'
                      ? 'All Project Folders'
                      : PROJECT_CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                </h2>
                <span className="text-xs text-on-surface-variant">
                  {rootFolders.length} {rootView === 'research' ? 'Topics' : 'Folders'}
                </span>
              </div>

              {rootFolders.length === 0 ? (
                <div className="py-20 text-center text-xs text-on-surface-variant italic">
                  {rootView === 'research'
                    ? 'No research topics found matching filter.'
                    : 'No project folders found matching filter.'}
                </div>
              ) : viewMode === 'grid' ? (
                /* Folders Grid View */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {rootFolders.map((folder) => {
                    const isSelected = selectedItemId === folder.id;
                    return (
                      <motion.div
                        key={folder.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItemId(folder.id);
                        }}
                        onDoubleClick={() => handleOpenFolder(folder.id)}
                        whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
                        transition={springSnappy}
                        className={`group p-3.5 rounded-2xl flex flex-col items-center text-center cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-primary/10 border-primary ring-2 ring-primary/40 shadow-sm'
                            : 'bg-surface-container-low hover:bg-surface-container-high border-outline-variant'
                        }`}
                      >
                        <div className="w-16 h-16 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-2 shadow-md group-hover:scale-105 transition-transform">
                          <Folder className="w-9 h-9 text-blue-500 fill-blue-500/30" />
                        </div>
                        <span className="font-bold text-xs text-on-surface truncate w-full">
                          {folder.name}
                        </span>
                        <span className="text-[10px] text-on-surface-variant line-clamp-1 mt-0.5">
                          {folder.shortDesc}
                        </span>
                        <span className="text-[10px] font-semibold text-secondary bg-primary/10 px-2 py-0.5 rounded-full mt-2">
                          {folder.files.length} items
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                /* Folders List View */
                <div className="border border-outline-variant rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-container-low dark:bg-surface-container-high/80 text-on-surface-variant font-semibold border-b border-outline-variant">
                      <tr>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2">Items</th>
                        <th className="px-3 py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {rootFolders.map((folder) => {
                        const isSelected = selectedItemId === folder.id;
                        return (
                          <tr
                            key={folder.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItemId(folder.id);
                            }}
                            onDoubleClick={() => handleOpenFolder(folder.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-primary/10 text-secondary font-medium'
                                : 'hover:bg-surface-container-high/50 text-on-surface'
                            }`}
                          >
                            <td className="px-3 py-2 font-bold">
                              <div className="flex items-center gap-2">
                                <Folder className="w-4 h-4 text-blue-500 fill-blue-500/20 shrink-0" />
                                <span>{folder.name}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-on-surface-variant">
                              {isProjectFolder(folder) ? folder.categoryLabel : 'Research'}
                            </td>
                            <td className="px-3 py-2 text-on-surface-variant">
                              {folder.files.length} files
                            </td>
                            <td className="px-3 py-2 text-on-surface-variant">{folder.date}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* INSIDE FOLDER: Showing Folder Files */
            <div>
              {/* Folder Details Banner */}
              <div className="mb-5 p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                      <Folder className="w-7 h-7 text-blue-500 fill-blue-500/30" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-on-surface">
                        {activeFolder.name}
                      </h2>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {activeFolder.shortDesc}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isProjectFolder(activeFolder) && activeFolder.githubUrl && (
                      <a
                        href={activeFolder.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-on-surface text-surface text-xs font-semibold hover:opacity-80 transition-opacity"
                      >
                        <Github className="w-3.5 h-3.5" /> GitHub
                      </a>
                    )}
                    {isProjectFolder(activeFolder) && activeFolder.liveUrl && (
                      <a
                        href={activeFolder.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-container text-on-primary-container text-xs font-semibold hover:bg-secondary-container transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Visit Project
                      </a>
                    )}
                    <button
                      onClick={handleNavigateUp}
                      className="px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface-variant text-xs font-semibold hover:bg-surface-container-highest transition-colors"
                    >
                      ← Back to Folders
                    </button>
                  </div>
                </div>

                {isProjectFolder(activeFolder) && activeFolder.fullDesc && (
                  <p className="mt-3 text-xs text-on-surface-variant leading-relaxed">
                    {activeFolder.fullDesc}
                  </p>
                )}

                {isProjectFolder(activeFolder) && activeFolder.techStack.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {activeFolder.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-semibold text-secondary bg-primary/10 px-2 py-0.5 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Sliding Image Gallery */}
              {folderImages.length > 0 && (
                <ProjectGallery
                  images={folderImages}
                  onOpenImage={(index) => onQuickLook?.(folderImages, index)}
                />
              )}

              {/* Files Grid or List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {currentFolderFiles.map((file) => {
                    const isSelected = selectedItemId === file.id;
                    return (
                      <div
                        key={file.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItemId(file.id);
                        }}
                        onDoubleClick={() => {
                          if (onOpenFile) onOpenFile(file);
                        }}
                        onContextMenu={(e) => handleContextMenu(e, file)}
                        className={`group p-3.5 rounded-2xl flex flex-col items-center text-center cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-primary-container text-on-primary-container border-primary ring-2 ring-primary/40 shadow-md'
                            : 'bg-surface-container-low hover:bg-surface-container-high border-outline-variant'
                        }`}
                      >
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-2 shadow-sm relative group-hover:scale-105 transition-transform">
                          {file.type === 'pdf' ? (
                            <div className="w-12 h-14 bg-rose-500/15 border border-rose-500/40 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                              <FileText className="w-7 h-7 text-rose-500" />
                              <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[7px] font-bold px-1 rounded">
                                PDF
                              </span>
                            </div>
                          ) : file.type === 'png' || file.type === 'jpg' ? (
                            <div className="w-12 h-14 bg-blue-500/15 border border-blue-500/40 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                              <ImageIcon className="w-7 h-7 text-blue-500" />
                              <span className="absolute top-0.5 right-0.5 bg-primary text-on-primary text-[7px] font-bold px-0.5 rounded">
                                IMG
                              </span>
                            </div>
                          ) : (
                            <div className="w-12 h-14 bg-amber-500/15 border border-amber-500/40 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                              <FileText className="w-7 h-7 text-amber-500" />
                              <span className="absolute top-0.5 right-0.5 bg-amber-500 text-white text-[7px] font-bold px-0.5 rounded">
                                MD
                              </span>
                            </div>
                          )}
                        </div>

                        <span
                          className={`font-bold text-xs truncate w-full ${
                            isSelected ? 'text-white' : 'text-on-surface'
                          }`}
                        >
                          {file.name}
                        </span>
                        <span
                          className={`text-[10px] mt-0.5 ${
                            isSelected ? 'text-primary' : 'text-on-surface-variant'
                          }`}
                        >
                          {file.size}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Files List View */
                <div className="border border-outline-variant rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-container-low dark:bg-surface-container-high/80 text-on-surface-variant font-semibold border-b border-outline-variant">
                      <tr>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Kind</th>
                        <th className="px-3 py-2">Size</th>
                        <th className="px-3 py-2">Date Modified</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {currentFolderFiles.map((file) => {
                        const isSelected = selectedItemId === file.id;
                        return (
                          <tr
                            key={file.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItemId(file.id);
                            }}
                            onDoubleClick={() => {
                              if (onOpenFile) onOpenFile(file);
                            }}
                            onContextMenu={(e) => handleContextMenu(e, file)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-primary-container text-on-primary-container font-medium'
                                : 'hover:bg-surface-container-high/50 text-on-surface'
                            }`}
                          >
                            <td className="px-3 py-2 font-bold">
                              <div className="flex items-center gap-2">
                                {file.type === 'pdf' ? (
                  <FileText className={`${sidebarIconClass} text-rose-500 shrink-0`} />
                                ) : file.type === 'png' || file.type === 'jpg' ? (
                                  <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />
                                ) : (
                                  <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                                )}
                                <span>{file.name}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 opacity-80">{getFileTypeLabel(file)}</td>
                            <td className="px-3 py-2 opacity-80">{file.size}</td>
                            <td className="px-3 py-2 opacity-70">{file.modifiedDate}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right-Click Context Menu */}
      {contextMenu && contextMenu.file && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 bg-surface-container/95 border border-outline-variant rounded-xl shadow-2xl p-1 w-44 text-xs font-medium space-y-0.5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            onClick={() => {
              const file = contextMenu.file!;
              closeContextMenu();
              if (onOpenFile) onOpenFile(file);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in Document Reader</span>
          </button>

          <div className="h-[1px] bg-outline-variant my-0.5" />

          <button
            onClick={() => {
              setInfoFile(contextMenu.file);
              closeContextMenu();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-amber-500" />
            <span>Get Info</span>
          </button>
        </div>
      )}

      {/* Get Info Popover Modal */}
      {infoFile && (
        <div
          onClick={() => setInfoFile(null)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container border border-outline-variant rounded-2xl shadow-2xl p-5 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-100"
          >
            <div className="flex items-start justify-between border-b border-outline-variant pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-on-surface truncate max-w-[200px]">
                    {infoFile.name}
                  </h3>
                  <span className="text-xs text-on-surface-variant">{getFileTypeLabel(infoFile)}</span>
                </div>
              </div>
              <button
                onClick={() => setInfoFile(null)}
                className="p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-outline-variant/60">
                <span className="text-on-surface-variant">Kind</span>
                <span className="font-medium text-on-surface-variant">
                  {getFileTypeLabel(infoFile)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/60">
                <span className="text-on-surface-variant">Size</span>
                <span className="font-medium text-on-surface-variant">
                  {infoFile.size}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/60">
                <span className="text-on-surface-variant">Modified</span>
                <span className="font-medium text-on-surface-variant">
                  {infoFile.modifiedDate}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-on-surface-variant">Opens with</span>
                <span className="font-bold text-secondary">
                  Document Reader
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                const f = infoFile;
                setInfoFile(null);
                if (onOpenFile) onOpenFile(f);
              }}
              className="w-full py-2 bg-primary-container hover:bg-secondary-container text-on-primary-container font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Open File
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
