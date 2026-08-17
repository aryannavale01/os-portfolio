'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppId } from '@/types/mac';
import { PROJECTS_DATA } from '@/lib/data';
import { Search, Command, Folder, Terminal, Edit3, Mail, Settings, Sparkles, ArrowRight, Music2, Compass } from 'lucide-react';

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: AppId) => void;
}

export function Spotlight({ isOpen, onClose, onOpenApp }: SpotlightProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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

  if (!isOpen) return null;

  const appActions: { id: AppId; name: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'finder', name: 'Finder — Projects', desc: 'Browse AI/ML, RAG, & Agent projects', icon: <Folder className="w-4 h-4 text-blue-500" /> },
    { id: 'terminal', name: 'Terminal — Skills', desc: 'Interactive shell with technical stack', icon: <Terminal className="w-4 h-4 text-emerald-500" /> },
    { id: 'notes', name: 'Notes — About Me', desc: 'Read background, bio, & research', icon: <Edit3 className="w-4 h-4 text-amber-500" /> },
    { id: 'mail', name: 'Mail — Contact', desc: 'Send direct message or inquiry', icon: <Mail className="w-4 h-4 text-sky-500" /> },
    { id: 'settings', name: 'System Settings', desc: 'Appearance, themes & wallpapers', icon: <Settings className="w-4 h-4 text-slate-400" /> },
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
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/30 dark:border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden font-sans select-none"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200/60 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Spotlight Search (Search projects, skills, apps...)"
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded">
            <Command className="w-3 h-3" /> K
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {/* Apps */}
          {filteredApps.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Applications
              </div>
              <div className="space-y-0.5">
                {filteredApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => {
                      onOpenApp(app.id);
                      handleClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-accent-500 hover:text-white group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-white/20">
                        {app.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-white">
                          {app.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-accent-50">
                          {app.desc}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects results if searching */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Matching Projects
              </div>
              <div className="space-y-0.5">
                {filteredProjects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      onOpenApp('finder');
                      handleClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-accent-500 hover:text-white group transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-white">
                        {proj.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-accent-50">
                        {proj.shortDesc}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-accent-100 dark:bg-accent-500/20 text-accent-700 dark:text-accent-300 group-hover:bg-white/20 group-hover:text-white">
                      Finder
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
