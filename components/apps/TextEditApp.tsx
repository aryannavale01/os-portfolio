'use client';

import React, { useState, useMemo, memo } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { FileItem } from '@/types/mac';
import { DESKTOP_FILES, PROJECTS_FS, RESEARCH_FS } from '@/lib/projectsFS';
import { MarkdownViewer } from '@/components/common/MarkdownViewer';
import { PDFViewer } from '@/components/common/PDFViewer';
import { RealPdfViewer } from '@/components/common/RealPdfViewer';
import { useTheme } from '@/components/context/ThemeContext';
import {
  BookOpen,
  FileText,
  Image as ImageIcon,
  Search,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

interface TextEditAppProps {
  fileData?: FileItem;
}

export const TextEditApp = memo(function TextEditApp({ fileData }: TextEditAppProps) {
  const { sidebarWidth } = useTheme();
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(fileData ?? null);
  const [searchQuery, setSearchQuery] = useState('');

  const sidebarWidthClass =
    sidebarWidth === 'compact'
      ? 'w-40 md:w-48'
      : sidebarWidth === 'wide'
        ? 'w-40 md:w-72'
        : 'w-40 md:w-64';

  const documentGroups = useMemo(() => {
    const groups = [
      { folderName: 'Desktop', files: DESKTOP_FILES },
      ...RESEARCH_FS.map((p) => ({ folderName: p.name, files: p.files })),
      ...PROJECTS_FS.map((p) => ({ folderName: p.name, files: p.files })),
    ];
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        files: g.files.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.type.toLowerCase().includes(q) ||
            (f.content || '').slice(0, 2000).toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.files.length > 0);
  }, [searchQuery]);

  const totalDocuments = documentGroups.reduce((acc, g) => acc + g.files.length, 0);

  const fileIcon = (file: FileItem) => {
    if (file.type === 'pdf') return <FileText className="w-4 h-4 text-rose-400 shrink-0" />;
    if (file.type === 'md') return <FileText className="w-4 h-4 text-amber-400 shrink-0" />;
    return <ImageIcon className="w-4 h-4 text-blue-400 shrink-0" />;
  };

  const renderDocument = (file: FileItem) => {
    if (file.type === 'pdf') {
      if (file.pdfUrl) {
        return <RealPdfViewer url={file.pdfUrl} title={file.name} size={file.size} />;
      }
      return <PDFViewer pdfData={file.pdfData} title={file.name} />;
    }
    if (file.type === 'md') {
      return (
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 select-text">
          <div className="max-w-3xl mx-auto">
            <MarkdownViewer content={file.content || `# ${file.name}\n\nNo text content.`} />
          </div>
        </div>
      );
    }
    return (
      <div className="flex-1 overflow-auto bg-surface-container-lowest p-6 flex items-center justify-center">
        <div className="relative w-full h-full min-h-[200px]">
          <Image
            src={file.imageUrl || 'https://picsum.photos/seed/default/1200/800'}
            alt={file.name}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-contain rounded-xl shadow-2xl border border-white/10"
            priority={false}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full bg-surface-container-low dark:bg-surface-container text-on-surface overflow-hidden font-sans select-none">
      {/* Sidebar: Document Library (hidden on mobile so content gets full width) */}
      <div className={`hidden md:flex ${sidebarWidthClass} border-r border-outline-variant bg-surface-container-low dark:bg-surface-container-lowest/60 flex flex-col shrink-0`}>
        <div className="p-3 border-b border-outline-variant">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xs">Document Reader</span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-1 text-xs rounded-lg bg-surface-container-low dark:bg-surface-container-high border border-outline-variant focus:outline-none focus:ring-1 focus:ring-emerald-500 text-on-surface placeholder-on-surface-variant"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {documentGroups.map((group) => (
            <div key={group.folderName}>
              <div className="px-2 pb-1 text-[10px] font-bold tracking-wider text-on-surface-variant uppercase flex items-center gap-1">
                <ChevronRight className="w-3 h-3" />
                <span className="truncate">{group.folderName}</span>
              </div>
              <div className="space-y-0.5">
                {group.files.map((file) => (
                  <motion.button
                    key={file.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs font-medium transition-colors ${
                      selectedFile?.id === file.id
                        ? 'bg-emerald-600 text-white'
                        : 'text-on-surface hover:bg-surface-container-high dark:hover:bg-surface-container-high'
                    }`}
                    title={file.name}
                  >
                    {fileIcon(file)}
                    <span className="truncate">{file.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-3 py-2 border-t border-outline-variant text-[10px] text-on-surface-variant font-medium">
          {totalDocuments} documents
        </div>
      </div>

      {/* Main Area */}
      {selectedFile ? (
        <div className="flex flex-col flex-1 min-w-0 bg-surface-container text-on-surface">
          <div className="h-9 px-3 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between text-xs shrink-0 select-none">
            <div className="flex items-center gap-2 min-w-0">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedFile(null)}
                className="p-1 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                title="Back to Library"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </motion.button>
              {fileIcon(selectedFile)}
              <span className="font-bold text-on-surface truncate">{selectedFile.name}</span>
              <span className="text-[10px] font-normal text-on-surface-variant shrink-0">
                ({selectedFile.size})
              </span>
            </div>
            <div className="text-[10px] text-on-surface-variant font-medium shrink-0">
              {selectedFile.type === 'pdf'
                ? 'PDF Document'
                : selectedFile.type === 'md'
                ? 'Markdown Document'
                : 'Image'}
            </div>
          </div>
          {renderDocument(selectedFile)}
        </div>
      ) : (
        /* Library View */
        <div className="flex-1 overflow-y-auto bg-surface-container-low dark:bg-surface-container p-6 select-none">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-base font-bold text-on-surface">
                  Document Reader
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Browse all documents across the workstation. Click a document to open it.
                </p>
              </div>
            </div>

            {documentGroups.length === 0 ? (
              <div className="py-20 text-center text-xs text-on-surface-variant italic">
                No documents found matching &quot;{searchQuery}&quot;.
              </div>
            ) : (
              documentGroups.map((group) => (
                <div key={group.folderName} className="mb-6">
                  <h3 className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase mb-2 flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5" />
                    {group.folderName}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {group.files.map((file) => (
                      <motion.button
                        key={file.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedFile(file)}
                        className="group p-3 rounded-xl bg-surface-container-low dark:bg-surface-container-high/50 border border-outline-variant hover:border-emerald-500 hover:shadow-md transition-all text-left"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          {fileIcon(file)}
                          <span className="font-bold text-xs text-on-surface truncate flex-1">
                            {file.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-on-surface-variant">
                          {file.type === 'pdf'
                            ? 'PDF'
                            : file.type === 'md'
                            ? 'Markdown'
                            : 'Image'}{' '}
                          • {file.size}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
});
