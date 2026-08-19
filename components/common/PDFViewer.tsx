'use client';

import React, { useState } from 'react';
import { PDFDocumentData } from '@/types/mac';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Sparkles,
} from 'lucide-react';

interface PDFViewerProps {
  pdfData?: PDFDocumentData;
  title?: string;
}

export function PDFViewer({ pdfData, title }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const totalPages = pdfData?.totalPages || 1;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 160));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 70));
  const handleResetZoom = () => setZoomLevel(100);

  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  const pageData = pdfData?.pages.find((p) => p.pageNumber === currentPage) || pdfData?.pages[0];

  return (
    <div className="flex flex-col h-full w-full bg-surface-container-lowest text-on-surface overflow-hidden font-sans select-none">
      {/* Top Toolbar */}
      <div className="h-10 px-3 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between text-xs shrink-0 z-10">
        {/* Left: Document Info */}
        <div className="flex items-center gap-2 truncate">
          <FileText className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="font-semibold text-on-surface truncate max-w-[180px] sm:max-w-[260px]">
            {title || pdfData?.title || 'Document.pdf'}
          </span>
        </div>

        {/* Center: Pagination */}
        <div className="flex items-center gap-1.5 bg-surface-container-lowest/90 border border-outline-variant rounded-lg px-2 py-1">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-0.5 rounded text-on-surface-variant hover:text-white disabled:opacity-30 disabled:hover:text-on-surface-variant transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-medium text-on-surface min-w-[70px] text-center">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="p-0.5 rounded text-on-surface-variant hover:text-white disabled:opacity-30 disabled:hover:text-on-surface-variant transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Zoom & Export Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="p-1 rounded text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-on-surface-variant font-mono w-9 text-center">
            {zoomLevel}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 rounded text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-outline-variant mx-1" />

          <button
            onClick={handleResetZoom}
            className="p-1 rounded text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
            title="Reset Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Page Canvas Display */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 flex justify-center bg-surface-container-lowest/95">
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          className="transition-transform duration-150 ease-out my-auto"
        >
          {/* PDF Page Container */}
          <div className="w-[520px] sm:w-[620px] min-h-[720px] bg-white text-on-surface rounded-md shadow-2xl p-8 sm:p-10 flex flex-col justify-between border border-outline-variant relative select-text font-serif">
            {/* Top Page Header */}
            <div>
              <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-6 text-[10px] text-on-surface-variant font-sans uppercase tracking-widest">
                <span className="flex items-center gap-1 font-bold text-on-surface">
                  <Sparkles className="w-3 h-3 text-rose-500" />
                  {pdfData?.title || title || 'TECHNICAL DOCUMENTATION'}
                </span>
                <span>CONFIDENTIAL • PAGE {currentPage} OF {totalPages}</span>
              </div>

              {/* Cover Title on Page 1 */}
              {currentPage === 1 && (
                <div className="mb-6 font-sans">
                  <h1 className="text-2xl font-black text-on-surface tracking-tight leading-tight">
                    {pdfData?.title || title}
                  </h1>
                  {pdfData?.subtitle && (
                    <p className="text-xs font-semibold text-rose-600 mt-1">
                      {pdfData.subtitle}
                    </p>
                  )}
                </div>
              )}

              {/* Render Page Sections */}
              {pageData ? (
                <div className="space-y-5 text-xs text-on-surface font-sans leading-relaxed">
                  {pageData.title && currentPage !== 1 && (
                    <h2 className="text-base font-bold text-on-surface border-b border-outline-variant pb-1.5 mb-3">
                      {pageData.title}
                    </h2>
                  )}

                  {pageData.sections.map((sec, idx) => (
                    <div key={idx} className="space-y-2">
                      {sec.heading && (
                        <h3 className="font-bold text-on-surface text-xs tracking-wide uppercase border-l-2 border-rose-500 pl-2">
                          {sec.heading}
                        </h3>
                      )}
                      {sec.text && <p className="text-on-surface">{sec.text}</p>}

                      {sec.bullets && sec.bullets.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 pl-1 text-on-surface">
                          {sec.bullets.map((b, bIdx) => (
                            <li key={bIdx}>{b}</li>
                          ))}
                        </ul>
                      )}

                      {sec.metrics && sec.metrics.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 my-3">
                          {sec.metrics.map((m, mIdx) => (
                            <div
                              key={mIdx}
                              className="p-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-center"
                            >
                              <div className="text-base font-black text-on-surface">
                                {m.value}
                              </div>
                              <div className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                                {m.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {sec.code && (
                        <pre className="bg-surface-container-lowest text-emerald-400 p-3 rounded-lg text-[10px] font-mono overflow-x-auto my-2">
                          <code>{sec.code}</code>
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-on-surface-variant text-xs italic font-sans">
                  Page content not available.
                </div>
              )}
            </div>

            {/* Bottom Page Footer */}
            <div className="pt-6 border-t border-outline-variant flex items-center justify-between text-[10px] text-on-surface-variant font-sans mt-8">
              <span>ARYAN NAVALE AI PORTFOLIO — PDF EXPORT</span>
              <span>PAGE {currentPage}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
