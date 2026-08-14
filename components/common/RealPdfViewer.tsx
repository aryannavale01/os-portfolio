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
    <div className="flex flex-col h-full w-full bg-slate-900 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Toolbar */}
      <div className="h-10 px-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs shrink-0 z-10">
        <div className="flex items-center gap-2 truncate">
          <FileText className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-[320px]">
            {title}
          </span>
          {size && <span className="text-[10px] text-slate-500 shrink-0">({size})</span>}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href={url}
            download={title}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Native PDF Embed */}
      <div className="flex-1 bg-slate-950 overflow-hidden">
        <iframe
          src={url}
          title={title}
          className="w-full h-full border-none"
        />
      </div>
    </div>
  );
}
