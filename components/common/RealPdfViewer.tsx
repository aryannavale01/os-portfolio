'use client';

import React from 'react';
import { Download, ExternalLink, FileText } from 'lucide-react';

interface RealPdfViewerProps {
  url: string;
  title: string;
  size?: string;
}

export function RealPdfViewer({ url, title, size }: RealPdfViewerProps) {
  return (
    <div className="flex flex-col h-full w-full bg-surface-container-lowest text-on-surface overflow-hidden font-sans select-none">
      {/* Top Toolbar */}
      <div className="h-10 px-3 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between text-xs shrink-0 z-10">
        <div className="flex items-center gap-2 truncate">
          <FileText className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="font-semibold text-on-surface truncate max-w-[200px] sm:max-w-[320px]">
            {title}
          </span>
          {size && <span className="text-[10px] text-on-surface-variant shrink-0">({size})</span>}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href={url}
            download={title}
            className="p-1.5 rounded text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Native PDF Embed */}
      <div className="flex-1 bg-surface-container-lowest overflow-hidden">
        <iframe
          src={url}
          title={title}
          className="w-full h-full border-none"
          style={{ minHeight: '100%', minWidth: '100%' }}
        />
      </div>
    </div>
  );
}
