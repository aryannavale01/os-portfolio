'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  return (
    <div
      className={`prose prose-invert max-w-none text-on-surface text-sm leading-relaxed ${className}`}
    >
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary font-semibold underline underline-offset-2 hover:text-primary transition-colors"
            >
              {children}
            </a>
          ),
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface mt-4 mb-3 border-b border-outline-variant pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold text-on-surface mt-5 mb-2 flex items-center gap-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-on-surface mt-4 mb-1.5">
              {children}
            </h3>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-surface-container-low dark:bg-surface-container-high/80 text-amber-600 dark:text-amber-400 font-mono text-xs px-1.5 py-0.5 rounded border border-outline-variant">
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-surface-container-lowest text-on-surface p-3.5 rounded-xl text-xs font-mono overflow-x-auto border border-outline-variant my-3 shadow-md">
                <code>{children}</code>
              </pre>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-amber-500 bg-amber-500/10 dark:bg-amber-500/5 px-4 py-2 my-3 rounded-r-lg italic text-on-surface-variant">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-2 text-on-surface-variant">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-2 text-on-surface-variant">
              {children}
            </ol>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 border border-outline-variant rounded-xl shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-surface-container-low dark:bg-surface-container-high px-3 py-2 font-bold text-on-surface border-b border-outline-variant">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-b border-outline-variant/60 text-on-surface-variant">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
