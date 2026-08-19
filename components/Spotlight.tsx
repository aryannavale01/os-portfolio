'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppId } from '@/types/mac';
import { PROJECTS_DATA } from '@/lib/data';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { spotlightStagger, spotlightItem, getAnimationConfig } from '@/lib/animations';
import { Search, Command, Folder, Terminal, Edit3, Mail, Settings, Sparkles, ArrowRight, Music2, Compass } from 'lucide-react';

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: AppId) => void;
}

export function Spotlight({ isOpen, onClose, onOpenApp }: SpotlightProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const animCfg = getAnimationConfig(prefersReducedMotion);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  // Global Keyboard listener for Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          handleClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const appActions: { id: AppId; name: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'finder', name: 'Finder — Projects', desc: 'Browse AI/ML, RAG, & Agent projects', icon: <Folder className="w-4 h-4 text-blue-500" /> },
    { id: 'terminal', name: 'Terminal — Skills', desc: 'Interactive shell with technical stack', icon: <Terminal className="w-4 h-4 text-emerald-500" /> },
    { id: 'notes', name: 'Notes — About Me', desc: 'Read background, bio, & research', icon: <Edit3 className="w-4 h-4 text-amber-500" /> },
    { id: 'mail', name: 'Mail — Contact', desc: 'Send direct message or inquiry', icon: <Mail className="w-4 h-4 text-sky-500" /> },
    { id: 'settings', name: 'System Settings', desc: 'Appearance, themes & wallpapers', icon: <Settings className="w-4 h-4 text-on-surface-variant" /> },
    { id: 'askai', name: 'Ultron', desc: 'Chat about Aryan, his projects & skills', icon: <Sparkles className="w-4 h-4 text-fuchsia-500" /> },
    { id: 'music', name: 'Music Player', desc: 'Play songs from the playlist', icon: <Music2 className="w-4 h-4 text-rose-500" /> },
    { id: 'safari', name: 'Safari', desc: 'Browse the web', icon: <Compass className="w-4 h-4 text-sky-500" /> },
  ];

  const filteredApps = appActions.filter(
    (a) =>
      query === '' ||
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.desc.toLowerCase().includes(query.toLowerCase())
  );

  const filteredProjects = PROJECTS_DATA.filter(
    (p) =>
      query !== '' &&
      (p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.shortDesc.toLowerCase().includes(query.toLowerCase()) ||
        p.techStack.some((t) => t.toLowerCase().includes(query.toLowerCase())))
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={prefersReducedMotion ? { duration: 0.01 } : animCfg.smoothTransition}
          onClick={handleClose}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={prefersReducedMotion ? { duration: 0.01 } : animCfg.snappyTransition}
            className="w-full max-w-xl bg-surface-container-high/80 backdrop-blur-2xl border border-outline-variant/60 rounded-2xl shadow-2xl overflow-hidden font-sans select-none"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant/60">
              <Search className="w-5 h-5 text-on-surface-variant shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Spotlight Search (Search projects, skills, apps...)"
                className="flex-1 bg-transparent text-sm text-on-surface placeholder-on-surface-variant focus:outline-none"
              />
              <div className="flex items-center gap-1 text-[10px] font-semibold text-on-surface-variant bg-surface-container-high/60 px-2 py-0.5 rounded">
                <Command className="w-3 h-3" /> K
              </div>
            </div>

            {/* Results List */}
            <motion.div
              variants={spotlightStagger}
              initial="hidden"
              animate="visible"
              className="max-h-80 overflow-y-auto p-2 space-y-3"
            >
              {/* Apps */}
              {filteredApps.length > 0 && (
                <div>
                  <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider text-on-surface-variant uppercase">
                    Applications
                  </div>
                  <div className="space-y-0.5">
                    {filteredApps.map((app) => (
                      <motion.button
                        key={app.id}
                        variants={spotlightItem}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          onOpenApp(app.id);
                          handleClose();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-primary hover:text-on-surface group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-surface-container-low dark:bg-surface-container-high group-hover:bg-white/20">
                            {app.icon}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-on-surface group-hover:text-on-surface">
                              {app.name}
                            </div>
                            <div className="text-[11px] text-on-surface-variant group-hover:text-primary">
                              {app.desc}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:text-on-surface group-hover:translate-x-0.5 transition-transform" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects results if searching */}
              {filteredProjects.length > 0 && (
                <div>
                  <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider text-on-surface-variant uppercase">
                    Matching Projects
                  </div>
                  <div className="space-y-0.5">
                    {filteredProjects.map((proj) => (
                      <motion.button
                        key={proj.id}
                        variants={spotlightItem}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          onOpenApp('finder');
                          handleClose();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-primary hover:text-on-surface group transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-on-surface group-hover:text-on-surface">
                            {proj.title}
                          </div>
                          <div className="text-[11px] text-on-surface-variant group-hover:text-primary">
                            {proj.shortDesc}
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary group-hover:bg-white/20 group-hover:text-on-surface">
                          Finder
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
