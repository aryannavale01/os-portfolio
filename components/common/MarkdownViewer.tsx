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
      className={`prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-100 text-sm leading-relaxed ${className}`}
    >
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-600 dark:text-accent-400 font-semibold underline underline-offset-2 hover:text-accent-700 dark:hover:text-accent-300 transition-colors"
            >
              {children}
            </a>
          ),
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-4 mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-5 mb-2 flex items-center gap-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-1.5">
              {children}
            </h3>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-slate-100 dark:bg-slate-800/80 text-amber-600 dark:text-amber-400 font-mono text-xs px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-slate-950 text-slate-100 p-3.5 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 my-3 shadow-md">
                <code>{children}</code>
              </pre>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-amber-500 bg-amber-500/10 dark:bg-amber-500/5 px-4 py-2 my-3 rounded-r-lg italic text-slate-700 dark:text-slate-300">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-2 text-slate-700 dark:text-slate-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-2 text-slate-700 dark:text-slate-300">
              {children}
            </ol>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-slate-100 dark:bg-slate-800 px-3 py-2 font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/60 text-slate-700 dark:text-slate-300">
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
