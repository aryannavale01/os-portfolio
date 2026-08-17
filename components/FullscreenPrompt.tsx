'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, X, Monitor } from 'lucide-react';

const DISMISS_KEY = 'macos_portfolio_fs_dismissed';

function isDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 768 && !('ontouchstart' in window);
}

function isInFullscreen(): boolean {
  if (typeof document === 'undefined') return false;
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).msFullscreenElement
  );
}

export function FullscreenPrompt({ onDismiss }: { onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isDesktop()) return;
    if (isInFullscreen()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') return;
    } catch {}
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleFullscreen = useCallback(() => {
    const el = document.documentElement;
    try {
      if (el.requestFullscreen) el.requestFullscreen();
      else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
      else if ((el as any).msRequestFullscreen) (el as any).msRequestFullscreen();
    } catch {}
    setVisible(false);
    onDismiss();
  }, [onDismiss]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch {}
    onDismiss();
  }, [onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: 0, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-24 right-5 z-[200] w-[320px] max-w-[calc(100vw-40px)] rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-black/10 dark:border-white/15 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* Top Accent Bar */}
          <div className="h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

          <div className="p-4 flex gap-3">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
              <Monitor className="w-5 h-5 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                Full Screen Mode
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                Best experienced in fullscreen for the full macOS feel.
              </p>

              {/* Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFullscreen}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-indigo-500/20 transition-all active:scale-[0.97]"
                >
                  <Maximize2 className="w-3 h-3" />
                  Go Fullscreen
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={handleDismiss}
              className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0 self-start mt-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
