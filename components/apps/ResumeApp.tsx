'use client';

import React, { useState, useRef, memo } from 'react';
import { useTheme } from '@/components/context/ThemeContext';
import { PORTFOLIO_INFO, SKILLS_CATEGORIZED, RESUME_PROJECTS, EDUCATION, COURSEWORK, ACHIEVEMENTS } from '@/lib/data';
import { PDFViewer } from '@/components/common/PDFViewer';
import { RealPdfViewer } from '@/components/common/RealPdfViewer';
import { FileItem } from '@/types/mac';
import {
  FileText,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Search,
  ChevronLeft,
  ChevronRight,
  Sidebar,
  FileUp,
  Share2,
  Briefcase,
  GraduationCap,
  Trophy,
  Github,
  Linkedin,
  Sparkles,
  X,
  Check,
} from 'lucide-react';

interface PDFDocumentConfig {
  id: string;
  title: string;
  fileSize: string;
  pagesCount: number;
  date: string;
  category: 'Resume' | 'Research' | 'Architecture' | 'Custom';
  customUrl?: string; // For user uploaded real PDFs
  pages: {
    pageNumber: number;
    title?: string;
    sections: {
      type: 'header' | 'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'achievements' | 'text_block' | 'architecture_diagram';
      heading?: string;
      content?: string | React.ReactNode;
    }[];
  }[];
}

const BUILTIN_DOCUMENTS: PDFDocumentConfig[] = [
  {
    id: 'resume',
    title: 'Aryan_Navale_AI_ML_FullStack_Resume.pdf',
    fileSize: '1.2 MB',
    pagesCount: 2,
    date: 'Aug 2026',
    category: 'Resume',
    pages: [
      {
        pageNumber: 1,
        title: 'Executive Summary & Core Engineering',
        sections: [
          {
            type: 'header',
          },
          {
            type: 'summary',
            heading: 'Executive Summary',
            content: PORTFOLIO_INFO.summary,
          },
          {
            type: 'skills',
            heading: 'Technical Skills',
          },
        ],
      },
      {
        pageNumber: 2,
        title: 'Featured AI Projects, Education & Achievements',
        sections: [
          {
            type: 'projects',
            heading: 'Key Projects',
          },
          {
            type: 'education',
            heading: 'Education & Coursework',
          },
          {
            type: 'achievements',
            heading: 'Achievements',
          },
        ],
      },
    ],
  },
  {
    id: 'rag-paper',
    title: 'NGO_ERP_System_CaseStudy.pdf',
    fileSize: '2.2 MB',
    pagesCount: 2,
    date: 'Apr 2026',
    category: 'Architecture',
    pages: [
      {
        pageNumber: 1,
        title: 'Problem & Architectural Solution',
        sections: [
          {
            type: 'text_block',
            heading: '1. Problem & Introduction',
            content:
              'Rupasri Mahila Vikas Sanstha, a rural NGO, needed a modern system to manage members, transactions, and reporting — usable by staff who work in Hindi, English, and Marathi.',
          },
          {
            type: 'architecture_diagram',
            heading: '2. System Architecture',
            content: 'Next.js 15 Frontend → Prisma ORM → Supabase / PostgreSQL → Better Auth',
          },
          {
            type: 'text_block',
            heading: '3. Key Modules',
            content:
              'Member registry, donation and transaction tracking, activity management, and role-based dashboards with instant trilingual switching.',
          },
        ],
      },
      {
        pageNumber: 2,
        title: 'Results & Impact',
        sections: [
          {
            type: 'text_block',
            heading: '4. Outcomes',
            content:
              'A production-deployed ERP serving daily operations of a real NGO across three languages, with secure role-based access and a responsive dashboard.',
          },
          {
            type: 'text_block',
            heading: '5. Tech Stack',
            content:
              'Next.js 15, TypeScript, Tailwind CSS, Prisma, Supabase, PostgreSQL, Better Auth.',
          },
        ],
      },
    ],
  },
  {
    id: 'rag-system',
    title: 'RAG_System_AI_Document_Chatbot.pdf',
    fileSize: '1.6 MB',
    pagesCount: 1,
    date: 'Aug 2026',
    category: 'Architecture',
    pages: [
      {
        pageNumber: 1,
        title: 'Hybrid Retrieval RAG System',
        sections: [
          {
            type: 'text_block',
            heading: 'System Modules',
            content:
              '• Document Ingestion: PDFs, Word, TXT, CSV, Excel, Markdown, HTML, XML, JSON, and PowerPoint\n• Chunking & Embeddings: Sentence Transformers generate dense vector embeddings\n• Hybrid Retrieval: BM25 keyword search fused with FAISS semantic search\n• Generation: Groq LLMs produce context-aware answers with source references',
          },
          {
            type: 'architecture_diagram',
            heading: 'Retrieval Pipeline',
            content: 'Documents → Chunking → Embeddings (FAISS) + BM25 → Hybrid Retriever → Groq LLM → Answer + Sources',
          },
          {
            type: 'text_block',
            heading: 'Key Design Choices',
            content:
              '• Hybrid retrieval (BM25 + FAISS) beats pure vector search on exact-match queries\n• Source references make every answer verifiable\n• Runs locally with Streamlit — no paid APIs required for embedding',
          },
        ],
      },
    ],
  },
];

export const ResumeApp = memo(function ResumeApp({
  minimal = false,
  fileData,
}: {
  minimal?: boolean;
  fileData?: FileItem;
}) {
  const { sidebarWidth, sidebarIconSize } = useTheme();
  const [documents, setDocuments] = useState<PDFDocumentConfig[]>(BUILTIN_DOCUMENTS);

  const sidebarWidthClass =
    sidebarWidth === 'compact'
      ? 'w-40 md:w-48'
      : sidebarWidth === 'wide'
        ? 'w-40 md:w-72'
        : 'w-40 md:w-64';

  const iconSizeClass =
    sidebarIconSize === 'small' ? 'w-3.5 h-3.5' : sidebarIconSize === 'large' ? 'w-5 h-5' : 'w-4 h-4';
  const [selectedDocId, setSelectedDocId] = useState<string>('resume');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100); // 50 to 200
  const [rotationAngle, setRotationAngle] = useState<number>(0); // 0, 90, 180, 270
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(!minimal);
  const [viewMode, setViewMode] = useState<'continuous' | 'single' | 'grid'>('continuous');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeDoc =
    documents.find((d) => d.id === selectedDocId) || documents[0];

  const handleSelectDoc = (id: string) => {
    setSelectedDocId(id);
    setCurrentPage(1);
  };

  // Handle Custom PDF File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processPdfFile(files[0]);
  };

  const processPdfFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file (.pdf)');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const customDoc: PDFDocumentConfig = {
      id: `custom-pdf-${Date.now()}`,
      title: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      pagesCount: 1,
      date: 'Uploaded Today',
      category: 'Custom',
      customUrl: objectUrl,
      pages: [
        {
          pageNumber: 1,
          title: 'External PDF Document',
          sections: [
            {
              type: 'text_block',
              heading: file.name,
              content: 'Custom PDF file loaded successfully into macOS Preview.',
            },
          ],
        },
      ],
    };

    setDocuments((prev) => [customDoc, ...prev]);
    handleSelectDoc(customDoc.id);
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    if (minimal) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (minimal) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (minimal) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processPdfFile(e.dataTransfer.files[0]);
    }
  };

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(200, prev + 15));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(50, prev - 15));
  const handleResetZoom = () => setZoomLevel(100);

  // Rotate handlers
  const handleRotateCw = () =>
    setRotationAngle((prev) => (prev + 90) % 360);
  const handleRotateCcw = () =>
    setRotationAngle((prev) => (prev - 90 + 360) % 360);

  // Print & Download
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (activeDoc.customUrl) {
      const a = document.createElement('a');
      a.href = activeDoc.customUrl;
      a.download = activeDoc.title;
      a.click();
      return;
    }
    // Built-in document: open the print dialog where the user can Save as PDF
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => undefined);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // When a specific PDF file was opened from the file system, render its real
  // content. Desktop documents and project case studies carry a pdfUrl.
  if (fileData?.pdfUrl) {
    return <RealPdfViewer url={fileData.pdfUrl} title={fileData.name} size={fileData.size} />;
  }
  if (fileData?.pdfData) {
    return <PDFViewer pdfData={fileData.pdfData} title={fileData.name} />;
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-col h-full w-full select-none bg-slate-300 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden font-sans relative"
    >
      {/* Hidden File Input for uploading custom PDF */}
      {!minimal && (
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
      )}

      {/* Drag and Drop Zone Overlay */}
      {isDraggingFile && !minimal && (
        <div className="absolute inset-0 bg-accent-600/90 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white border-4 border-dashed border-white/80 p-6 animate-in fade-in duration-150">
          <FileUp className="w-16 h-16 mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold">Drop PDF File Here</h2>
          <p className="text-sm text-accent-50 mt-1">
            Instantly view and inspect any PDF file in macOS Preview
          </p>
        </div>
      )}

      {/* Top macOS Preview Toolbar */}
      <div className="h-10 px-3 border-b border-slate-300/80 dark:border-slate-800 flex items-center justify-between bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur-xl text-xs shrink-0 shadow-xs z-20">
        {/* Left Controls */}
        <div className="flex items-center gap-1.5">
          {!minimal && (
            <>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`hidden md:inline-flex p-1.5 rounded-md transition-colors ${
                  isSidebarOpen
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
                title="Toggle Sidebar Thumbnails"
              >
                <Sidebar className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-800 mx-0.5" />

              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-accent-600 hover:bg-accent-500 text-white font-medium text-[11px] shadow-xs transition-colors"
                title="Open Custom PDF File from Device"
              >
                <FileUp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open PDF...</span>
              </button>
            </>
          )}

          {/* Document Title Badge */}
          <div className="hidden md:flex items-center gap-1.5 ml-2 bg-slate-200/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-300/60 dark:border-slate-700/60 max-w-[200px] truncate">
            <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="font-semibold text-[11px] truncate text-slate-800 dark:text-slate-200">
              {activeDoc.title}
            </span>
          </div>
        </div>

        {/* Center Navigation & Zoom Controls */}
        <div className="flex items-center gap-1.5">
          {/* Page Counter */}
          <div className="flex items-center gap-1 text-[11px] bg-slate-200/60 dark:bg-slate-800/60 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="hover:text-accent-600 disabled:opacity-30 disabled:hover:text-inherit"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-medium whitespace-nowrap">
              {currentPage} / {activeDoc.pagesCount}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(activeDoc.pagesCount, p + 1))}
              disabled={currentPage >= activeDoc.pagesCount}
              className="hover:text-accent-600 disabled:opacity-30 disabled:hover:text-inherit"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-800 mx-0.5" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-0.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-md p-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-slate-300 dark:hover:bg-slate-700 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:text-accent-600"
              title="Reset Zoom to 100%"
            >
              {zoomLevel}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-slate-300 dark:hover:bg-slate-700 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rotation Controls */}
          {!minimal && (
            <div className="hidden lg:flex items-center gap-0.5">
              <button
                onClick={handleRotateCcw}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors text-slate-600 dark:text-slate-400"
                title="Rotate Left 90°"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleRotateCw}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors text-slate-600 dark:text-slate-400"
                title="Rotate Right 90°"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Search & Action Buttons */}
        <div className="flex items-center gap-1.5">
          {!minimal && (
            <>
              {/* Search Toggle */}
              <div className="relative flex items-center">
                {isSearching ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Find text..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-28 sm:w-36 px-2 py-0.5 text-xs rounded bg-white dark:bg-slate-800 border border-accent-500 focus:outline-none text-slate-900 dark:text-white"
                    />
                    <button
                      onClick={() => {
                        setIsSearching(false);
                        setSearchQuery('');
                      }}
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSearching(true)}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 transition-colors"
                    title="Search in PDF"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-800 mx-0.5" />

              {/* Share */}
              <button
                onClick={handleShare}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 transition-colors relative"
                title="Share Document Link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              </button>

              <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-800 mx-0.5" />
            </>
          )}

          {/* Print */}
          <button
            onClick={handlePrint}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 transition-colors"
            title="Print PDF Document"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 transition-colors"
            title="Print / Save as PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Document Body Stage */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar: Documents & Page Thumbnails (hidden on mobile by default) */}
        {!minimal && isSidebarOpen && (
          <div className={`hidden md:flex ${sidebarWidthClass} border-r border-slate-300 dark:border-slate-800 bg-slate-200/90 dark:bg-slate-900/90 flex flex-col p-2 gap-3 shrink-0 z-10 overflow-y-auto transition-all`}>
            {/* Document Library Section */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 block mb-1">
                Document Library
              </span>
              <div className="space-y-1">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleSelectDoc(doc.id)}
                    className={`w-full text-left p-2 rounded-lg transition-all flex items-center gap-2 border ${
                      selectedDocId === doc.id
                        ? 'bg-accent-600 text-white border-accent-500 shadow-xs'
                        : 'bg-white/40 dark:bg-slate-800/40 hover:bg-slate-300/60 dark:hover:bg-slate-800/80 border-transparent text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <FileText
                      className={`${iconSizeClass} shrink-0 ${
                        selectedDocId === doc.id ? 'text-white' : 'text-red-500'
                      }`}
                    />
                    <div className="overflow-hidden flex-1 min-w-0">
                      <span className="font-semibold text-xs block truncate leading-tight">
                        {doc.title}
                      </span>
                      <span
                        className={`text-[10px] block mt-0.5 ${
                          selectedDocId === doc.id ? 'text-accent-50' : 'text-slate-500'
                        }`}
                      >
                        {doc.fileSize} • {doc.pagesCount} Page{doc.pagesCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Page Thumbnails Section */}
            {!activeDoc.customUrl && (
              <div className="pt-2 border-t border-slate-300 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 block mb-2">
                  Page Thumbnails
                </span>
                <div className="space-y-2 px-1">
                  {activeDoc.pages.map((p) => (
                    <button
                      key={p.pageNumber}
                      onClick={() => setCurrentPage(p.pageNumber)}
                      className={`w-full flex flex-col items-center gap-1 group`}
                    >
                      <div
                        className={`w-full aspect-[1/1.3] bg-white text-slate-900 rounded p-2 text-[6px] shadow-sm overflow-hidden transition-all border ${
                          currentPage === p.pageNumber
                            ? 'ring-2 ring-accent-500 border-accent-500 scale-[1.02]'
                            : 'border-slate-300 group-hover:border-slate-400 opacity-80'
                        }`}
                      >
                        <div className="font-bold border-b border-slate-200 pb-0.5 truncate text-[7px]">
                          {p.title || `Page ${p.pageNumber}`}
                        </div>
                        <div className="mt-1 space-y-1 opacity-60">
                          <div className="h-1 bg-slate-300 rounded w-full" />
                          <div className="h-1 bg-slate-200 rounded w-3/4" />
                          <div className="h-1 bg-slate-200 rounded w-5/6" />
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-medium ${
                          currentPage === p.pageNumber
                            ? 'text-accent-600 font-bold'
                            : 'text-slate-500'
                        }`}
                      >
                        Page {p.pageNumber}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PDF Canvas Preview Viewer Container */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center bg-slate-400/30 dark:bg-slate-950/90 relative"
        >
          {/* Custom Real Uploaded PDF Viewer via Native IFrame Embed */}
          {activeDoc.customUrl ? (
            <div className="w-full h-full max-w-4xl bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-300 dark:border-slate-800 overflow-hidden flex flex-col">
              <iframe
                src={activeDoc.customUrl}
                title={activeDoc.title}
                className="w-full h-full border-none flex-1"
              />
            </div>
          ) : (
            /* Interactive Vector PDF Sheet Page View */
            <div
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotationAngle}deg)`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
              }}
              className="w-full max-w-2xl space-y-8 select-text"
            >
              {activeDoc.pages
                .filter((p) => viewMode === 'continuous' || p.pageNumber === currentPage)
                .map((page) => (
                  <div
                    key={page.pageNumber}
                    className="w-full bg-white text-slate-900 shadow-2xl rounded-sm p-8 sm:p-10 space-y-6 border border-slate-200/80 relative min-h-[780px] flex flex-col justify-between"
                  >
                    {/* Header Watermark / Title */}
                    <div className="space-y-6">
                      <div className="border-b border-slate-200 pb-3 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                        <span>{activeDoc.title}</span>
                        <span>CONFIDENTIAL • {activeDoc.date}</span>
                      </div>

                      {/* Render Sections */}
                      {page.sections.map((sec, idx) => {
                        if (sec.type === 'header') {
                          return (
                            <div
                              key={idx}
                              className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                            >
                              <div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                  {PORTFOLIO_INFO.name}
                                </h1>
                                <p className="text-xs font-semibold text-accent-600 mt-0.5">
                                  {PORTFOLIO_INFO.role}
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {PORTFOLIO_INFO.location} • {PORTFOLIO_INFO.email}
                                </p>
                              </div>

                              <div className="flex gap-2 text-[11px]">
                                <a
                                  href={PORTFOLIO_INFO.github}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 text-slate-700 hover:text-accent-600 font-medium border border-slate-200 px-2 py-1 rounded"
                                >
                                  <Github className="w-3 h-3" /> GitHub
                                </a>
                                <a
                                  href={PORTFOLIO_INFO.linkedin}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 text-slate-700 hover:text-accent-600 font-medium border border-slate-200 px-2 py-1 rounded"
                                >
                                  <Linkedin className="w-3 h-3" /> LinkedIn
                                </a>
                              </div>
                            </div>
                          );
                        }

                        if (sec.type === 'summary') {
                          return (
                            <div key={idx}>
                              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 border-b border-slate-100 pb-0.5">
                                {sec.heading}
                              </h2>
                              <p className="text-slate-700 leading-relaxed text-[11px]">
                                {sec.content}
                              </p>
                            </div>
                          );
                        }

                        if (sec.type === 'skills') {
                          return (
                            <div key={idx}>
                              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 border-b border-slate-100 pb-0.5">
                                {sec.heading}
                              </h2>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                                {SKILLS_CATEGORIZED.map((cat, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className="bg-slate-50 p-2 rounded border border-slate-100"
                                  >
                                    <span className="font-bold text-slate-800 block mb-0.5">
                                      {cat.category}
                                    </span>
                                    <p className="text-slate-600 leading-tight">
                                      {cat.skills.join(', ')}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }

                        if (sec.type === 'experience') {
                          return (
                            <div key={idx}>
                              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-100 pb-0.5 flex items-center gap-1">
                                <Briefcase className="w-3.5 h-3.5 text-accent-500" />{' '}
                                {sec.heading}
                              </h2>
                              <div className="space-y-3 text-[11px]">
                                <div>
                                  <div className="flex justify-between font-bold text-slate-900">
                                    <span>Software Development Intern — MKCL</span>
                                    <span className="text-slate-400">2026 – Present</span>
                                  </div>
                                  <p className="text-slate-600 text-[10.5px] mt-0.5">
                                    • Working on production software with AI/ML and full-stack tools, mentored by the company CTO.
                                    <br />• Applying LLMs, RAG, and modern web tooling to real-world product challenges.
                                  </p>
                                </div>
                                <div>
                                  <div className="flex justify-between font-bold text-slate-900">
                                    <span>Final-Year Project — AI Document RAG System</span>
                                    <span className="text-slate-400">2025 – 2026</span>
                                  </div>
                                  <p className="text-slate-600 text-[10.5px] mt-0.5">
                                    • Production-style RAG pipeline combining BM25 keyword search with FAISS semantic retrieval for chat over documents.
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (sec.type === 'projects') {
                          return (
                            <div key={idx}>
                              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-100 pb-0.5 flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-accent-500" />{' '}
                                {sec.heading}
                              </h2>
                              <div className="space-y-3">
                                {RESUME_PROJECTS.map((proj) => (
                                  <div key={proj.id} className="space-y-0.5">
                                    <div className="flex items-center justify-between font-bold text-slate-900 text-xs">
                                      <span>{proj.title}</span>
                                      <span className="text-slate-400 text-[10px]">
                                        {proj.date}
                                      </span>
                                    </div>
                                    <p className="text-slate-600 text-[11px] leading-relaxed">
                                      {proj.shortDesc}
                                    </p>
                                    <div className="text-emerald-700 font-medium text-[10px]">
                                      Impact: {proj.metrics.join(' | ')}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }

                        if (sec.type === 'education') {
                          return (
                            <div key={idx}>
                              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 border-b border-slate-100 pb-0.5 flex items-center gap-1">
                                <GraduationCap className="w-3.5 h-3.5 text-accent-500" />{' '}
                                {sec.heading}
                              </h2>
                              <div className="space-y-1.5 text-[11px]">
                                <div>
                                  <div className="flex justify-between font-bold text-slate-900">
                                    <span>{EDUCATION.degree}</span>
                                    <span className="text-slate-400">{EDUCATION.years}</span>
                                  </div>
                                  <p className="text-slate-600">{EDUCATION.college}</p>
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900">
                                    Relevant Coursework
                                  </div>
                                  <p className="text-slate-600">{COURSEWORK.join(', ')}</p>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (sec.type === 'achievements') {
                          return (
                            <div key={idx}>
                              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 border-b border-slate-100 pb-0.5 flex items-center gap-1">
                                <Trophy className="w-3.5 h-3.5 text-accent-500" />{' '}
                                {sec.heading}
                              </h2>
                              <ul className="space-y-1.5 text-[11px] text-slate-700 list-disc list-inside leading-relaxed">
                                {ACHIEVEMENTS.map((item, aIdx) => (
                                  <li key={aIdx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          );
                        }

                        if (sec.type === 'architecture_diagram') {
                          return (
                            <div
                              key={idx}
                              className="bg-slate-900 text-slate-100 p-4 rounded-lg border border-slate-800 font-mono text-[10px] space-y-2 my-3"
                            >
                              <div className="text-accent-400 font-bold text-xs border-b border-slate-800 pb-1">
                                {sec.heading}
                              </div>
                              <pre className="text-emerald-400 overflow-x-auto leading-tight">
{`+-----------------------+     +-----------------------+     +-----------------------+
|  User Query Stream    | --> | NeuralCache Vector    | --> | Distributed Flash     |
|  (sub-10ms ingress)   |     | FAISS Quantized (PQ8) |     | Attention-2 KV Cluster|
+-----------------------+     +-----------------------+     +-----------------------+`}
                              </pre>
                            </div>
                          );
                        }

                        return (
                          <div key={idx} className="space-y-1">
                            {sec.heading && (
                              <h3 className="font-bold text-slate-900 text-xs">
                                {sec.heading}
                              </h3>
                            )}
                            <p className="text-slate-700 text-[11px] leading-relaxed whitespace-pre-line">
                              {typeof sec.content === 'string' ? sec.content : null}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Page Footer */}
                    <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-[10px] text-slate-400">
                      <span>macOS Preview Engine</span>
                      <span>
                        Page {page.pageNumber} of {activeDoc.pagesCount}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
