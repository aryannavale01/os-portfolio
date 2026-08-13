'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useTheme } from '@/components/context/ThemeContext';
import { NOTES_DATA } from '@/lib/data';
import { NoteItem, NoteFolder } from '@/types/mac';
import {
  Pin,
  FileText,
  Search,
  Trash2,
  Plus,
  Check,
  Share2,
  Lock,
  Unlock,
  PanelLeft,
  Folder,
  FolderPlus,
  CheckSquare,
  List,
  ListOrdered,
  Type,
  StickyNote,
  Briefcase,
  User,
  RotateCcw,
  Sparkles,
  ChevronRight,
  X,
  Heading1,
  Heading2,
  Heading3,
  Eye,
  FileCode,
  ArrowUpDown,
  Quote,
} from 'lucide-react';

const INITIAL_FOLDERS: NoteFolder[] = [
  { id: 'all', name: 'All iCloud', isSystem: true },
  { id: 'quick-notes', name: 'Quick Notes', isSystem: true },
  { id: 'notes', name: 'Notes', isSystem: true },
  { id: 'work', name: 'Work & Research', isSystem: false },
  { id: 'personal', name: 'Personal', isSystem: false },
  { id: 'trash', name: 'Recently Deleted', isSystem: true },
];

const renderInlineLinks = (text: string, keyPrefix: string | number): React.ReactNode => {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (match) {
      return (
        <a
          key={`${keyPrefix}-link-${i}`}
          href={match[2]}
          target="_blank"
          rel="noreferrer"
          className="text-accent-600 dark:text-accent-400 underline decoration-accent-400/50 hover:decoration-accent-600 hover:text-accent-500"
        >
          {match[1]}
        </a>
      );
    }
    return <span key={`${keyPrefix}-link-${i}`}>{part}</span>;
  });
};

export function NotesApp() {
  const { sidebarWidth, sidebarIconSize } = useTheme();

  // State Management
  const [folders, setFolders] = useState<NoteFolder[]>(INITIAL_FOLDERS);
  const [activeFolderId, setActiveFolderId] = useState<string>('all');
  const [notes, setNotes] = useState<NoteItem[]>(NOTES_DATA);
  const [activeNoteId, setActiveNoteId] = useState<string>('about-me');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [editorMode, setEditorMode] = useState<'preview' | 'edit'>('preview');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

  // Custom Folder Creation
  const [isAddingFolder, setIsAddingFolder] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');

  // Lock Note State
  const [lockPasswordInput, setLockPasswordInput] = useState<string>('');
  const [showLockModal, setShowLockModal] = useState<boolean>(false);
  const [unlockedNotes, setUnlockedNotes] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Menus State
  const [showFormatMenu, setShowFormatMenu] = useState<boolean>(false);
  const [showMoveMenu, setShowMoveMenu] = useState<boolean>(false);
  const [showSortMenu, setShowSortMenu] = useState<boolean>(false);

  // Textarea Ref
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Responsive Sidebar Classes
  const sidebarWidthClass =
    sidebarWidth === 'compact' ? 'w-44' : sidebarWidth === 'wide' ? 'w-60' : 'w-52';

  const iconSizeClass =
    sidebarIconSize === 'small' ? 'w-3.5 h-3.5' : sidebarIconSize === 'large' ? 'w-5 h-5' : 'w-4 h-4';

  // Trigger Toast Notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Active Note
  const activeNote = useMemo(() => {
    return (
      notes.find((n) => n.id === activeNoteId) ||
      notes[0] || {
        id: 'default',
        title: 'New Note',
        category: 'Notes',
        folderId: 'notes',
        content: '',
        date: 'Today',
        isPinned: false,
      }
    );
  }, [notes, activeNoteId]);

  // Filter Notes by Folder & Search Query & Sorting
  const filteredNotes = useMemo(() => {
    const list = notes.filter((note) => {
      // Trash filtering
      if (activeFolderId === 'trash') {
        if (note.folderId !== 'trash') return false;
      } else {
        if (note.folderId === 'trash') return false;
      }

      // Folder filtering
      if (activeFolderId !== 'all' && activeFolderId !== 'trash') {
        if (activeFolderId === 'quick-notes' && note.folderId !== 'quick-notes') return false;
        if (activeFolderId === 'notes' && note.folderId !== 'notes' && note.folderId !== 'quick-notes')
          return false;
        if (activeFolderId !== 'quick-notes' && activeFolderId !== 'notes' && note.folderId !== activeFolderId)
          return false;
      }

      // Search Query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q)
      );
    });

    // Sorting
    return list.sort((a, b) => {
      const ao = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const bo = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return b.id.localeCompare(a.id);
    });
  }, [notes, activeFolderId, searchQuery, sortBy]);

  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.isPinned), [filteredNotes]);
  const otherNotes = useMemo(() => filteredNotes.filter((n) => !n.isPinned), [filteredNotes]);

  // Folder Note Counts
  const getFolderCount = (folderId: string) => {
    if (folderId === 'trash') {
      return notes.filter((n) => n.folderId === 'trash').length;
    }
    if (folderId === 'all') {
      return notes.filter((n) => n.folderId !== 'trash').length;
    }
    return notes.filter((n) => n.folderId === folderId && n.folderId !== 'trash').length;
  };

  // Add New Folder
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFld: NoteFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
      isSystem: false,
    };
    setFolders([...folders, newFld]);
    setActiveFolderId(newFld.id);
    setNewFolderName('');
    setIsAddingFolder(false);
    triggerToast(`Folder "${newFld.name}" created`);
  };

  // Create New Note
  const handleCreateNote = () => {
    const targetFolder = activeFolderId === 'trash' ? 'notes' : activeFolderId === 'all' ? 'notes' : activeFolderId;
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: 'New Note',
      category: 'Notes',
      folderId: targetFolder,
      content: 'Start typing your thoughts, ideas, or checklists here...',
      date: 'Just now',
      isPinned: false,
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setEditorMode('edit');
    triggerToast('New Note created');
  };

  // Update Title
  const handleTitleChange = (newTitle: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNote.id
          ? {
              ...n,
              title: newTitle,
              date: 'Just now',
            }
          : n
      )
    );
  };

  // Update Active Note Body Content
  const handleContentChange = (newContent: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNote.id
          ? {
              ...n,
              content: newContent,
              date: 'Just now',
            }
          : n
      )
    );
  };

  // Toggle Checkbox Item in Note Content
  const handleToggleChecklistIndex = (lineIndex: number) => {
    const lines = activeNote.content.split('\n');
    const line = lines[lineIndex];
    if (line === undefined) return;

    if (line.includes('- [ ]')) {
      lines[lineIndex] = line.replace('- [ ]', '- [x]');
    } else if (line.includes('- [x]')) {
      lines[lineIndex] = line.replace('- [x]', '- [ ]');
    }

    handleContentChange(lines.join('\n'));
  };

  // Move Note to Folder
  const handleMoveNote = (targetFolderId: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === activeNote.id ? { ...n, folderId: targetFolderId } : n))
    );
    setShowMoveMenu(false);
    const folderObj = folders.find((f) => f.id === targetFolderId);
    triggerToast(`Moved to ${folderObj?.name || 'Folder'}`);
  };

  // Formatting Actions
  const applyFormatting = (type: 'title' | 'heading' | 'subheading' | 'checklist' | 'bullet' | 'numbered' | 'quote' | 'bold' | 'code') => {
    if (!textareaRef.current) {
      setEditorMode('edit');
    }

    setTimeout(() => {
      if (!textareaRef.current) return;
      const el = textareaRef.current;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const val = el.value;

      let prefix = '';
      if (type === 'title') prefix = '# ';
      else if (type === 'heading') prefix = '## ';
      else if (type === 'subheading') prefix = '### ';
      else if (type === 'checklist') prefix = '- [ ] ';
      else if (type === 'bullet') prefix = '- ';
      else if (type === 'numbered') prefix = '1. ';
      else if (type === 'quote') prefix = '> ';
      else if (type === 'code') prefix = '```\n';

      if (type === 'bold') {
        const selectedText = val.substring(start, end) || 'bold text';
        const replacement = `**${selectedText}**`;
        const updated = val.substring(0, start) + replacement + val.substring(end);
        handleContentChange(updated);
      } else {
        const lineStart = val.lastIndexOf('\n', start - 1) + 1;
        const updated = val.substring(0, lineStart) + prefix + val.substring(lineStart);
        handleContentChange(updated);
      }

      setShowFormatMenu(false);
    }, 50);
  };

  // Toggle Pin Status
  const handleTogglePin = () => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNote.id ? { ...n, isPinned: !n.isPinned } : n
      )
    );
    triggerToast(activeNote.isPinned ? 'Note unpinned' : 'Note pinned to top');
  };

  // Lock / Password Toggle
  const handleToggleLockNote = () => {
    if (activeNote.isLocked) {
      setNotes((prev) =>
        prev.map((n) => (n.id === activeNote.id ? { ...n, isLocked: false } : n))
      );
      triggerToast('Lock removed from note');
    } else {
      setShowLockModal(true);
    }
  };

  const handleConfirmLock = () => {
    setNotes((prev) =>
      prev.map((n) => (n.id === activeNote.id ? { ...n, isLocked: true } : n))
    );
    setShowLockModal(false);
    setLockPasswordInput('');
    triggerToast('Note password protected');
  };

  const handleUnlockCurrentNote = () => {
    setUnlockedNotes({ ...unlockedNotes, [activeNote.id]: true });
  };

  // Delete / Trash Action
  const handleDeleteNote = () => {
    if (activeNote.folderId === 'trash') {
      const remaining = notes.filter((n) => n.id !== activeNote.id);
      setNotes(remaining);
      if (remaining.length > 0) setActiveNoteId(remaining[0].id);
      triggerToast('Note permanently deleted');
    } else {
      setNotes((prev) =>
        prev.map((n) => (n.id === activeNote.id ? { ...n, folderId: 'trash' } : n))
      );
      triggerToast('Moved to Recently Deleted');
    }
  };

  // Restore Note from Trash
  const handleRestoreNote = () => {
    setNotes((prev) =>
      prev.map((n) => (n.id === activeNote.id ? { ...n, folderId: 'notes' } : n))
    );
    triggerToast('Note restored to Notes');
  };

  // Copy Note Text
  const handleCopyNote = () => {
    navigator.clipboard.writeText(`${activeNote.title}\n\n${activeNote.content}`);
    triggerToast('Note copied to clipboard');
  };

  // Helper Snippet Cleaner for List Preview
  const cleanSnippet = (text: string) => {
    return text
      .replace(/^#+\s*/gm, '')
      .replace(/^[*-]\s*/gm, '')
      .replace(/^\[[ x]\]\s*/gm, '')
      .replace(/^>\s*/gm, '')
      .replace(/`/g, '')
      .trim();
  };

  // Word & Character count
  const wordCount = useMemo(() => {
    if (!activeNote.content.trim()) return 0;
    return activeNote.content.trim().split(/\s+/).length;
  }, [activeNote.content]);

  const charCount = activeNote.content.length;

  const isCurrentLocked = activeNote.isLocked && !unlockedNotes[activeNote.id];

  const currentFolder = useMemo(() => {
    return folders.find((f) => f.id === activeNote.folderId) || folders[2];
  }, [folders, activeNote.folderId]);

  return (
    <div className="flex h-full w-full select-none bg-amber-50/40 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 overflow-hidden font-sans relative">
      {/* Toast Popup */}
      {toastMessage && (
        <div className="absolute top-11 right-6 z-50 bg-slate-900/90 dark:bg-slate-100/90 text-white dark:text-slate-900 text-xs px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-md flex items-center gap-2 border border-white/10 transition-all animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* COLUMN 1: Folders Sidebar */}
      {isSidebarOpen && (
        <div
          className={`${sidebarWidthClass} border-r border-amber-200/50 dark:border-slate-800 bg-amber-100/30 dark:bg-slate-950/50 p-2.5 flex flex-col justify-between shrink-0 transition-all text-xs min-w-0`}
        >
          <div className="space-y-3 overflow-y-auto pr-1">
            {/* Header: iCloud */}
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-bold tracking-wider text-amber-900/60 dark:text-amber-400/60 uppercase">
                iCloud
              </div>
              <div className="space-y-0.5">
                {folders
                  .filter((f) => f.id !== 'trash')
                  .map((f) => {
                    const isActive = activeFolderId === f.id;
                    const count = getFolderCount(f.id);
                    return (
                      <button
                        key={f.id}
                        onClick={() => setActiveFolderId(f.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                          isActive
                            ? 'bg-amber-500/20 dark:bg-amber-500/30 text-amber-900 dark:text-amber-200 font-bold shadow-2xs'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-amber-100/60 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {f.id === 'quick-notes' ? (
                            <StickyNote className={`${iconSizeClass} text-amber-500 shrink-0`} />
                          ) : f.id === 'work' ? (
                            <Briefcase className={`${iconSizeClass} text-accent-500 shrink-0`} />
                          ) : f.id === 'personal' ? (
                            <User className={`${iconSizeClass} text-purple-500 shrink-0`} />
                          ) : (
                            <Folder className={`${iconSizeClass} text-amber-500 shrink-0`} />
                          )}
                          <span className="truncate">{f.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1">
                          {count}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Header: System / Trash */}
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                System
              </div>
              <button
                onClick={() => setActiveFolderId('trash')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  activeFolderId === 'trash'
                    ? 'bg-red-500/15 text-red-700 dark:text-red-300 font-bold shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-amber-100/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Trash2 className={`${iconSizeClass} text-red-500 shrink-0`} />
                  <span className="truncate">Recently Deleted</span>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {getFolderCount('trash')}
                </span>
              </button>
            </div>
          </div>

          {/* Sidebar Footer: New Folder */}
          <div className="pt-2 border-t border-amber-200/50 dark:border-slate-800/80">
            {isAddingFolder ? (
              <div className="space-y-1.5 p-1 bg-white/80 dark:bg-slate-900 rounded-lg border border-amber-300 dark:border-slate-700">
                <input
                  type="text"
                  placeholder="Folder Name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                  autoFocus
                  className="w-full px-2 py-1 text-xs bg-transparent focus:outline-none text-slate-800 dark:text-slate-100"
                />
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => setIsAddingFolder(false)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <button
                    onClick={handleCreateFolder}
                    className="px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingFolder(true)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-amber-100/60 dark:hover:bg-slate-800/60 transition-colors font-medium text-xs"
              >
                <FolderPlus className={`${iconSizeClass} text-amber-600 dark:text-amber-400 shrink-0`} />
                <span>New Folder</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* COLUMN 2: Note List */}
      <div className="w-48 sm:w-56 border-r border-amber-200/50 dark:border-slate-800 bg-amber-100/20 dark:bg-slate-950/40 p-2.5 flex flex-col gap-2 shrink-0 overflow-hidden min-w-0">
        {/* Search Header */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-6 py-1 text-xs rounded-md bg-white/80 dark:bg-slate-900/80 border border-amber-200/60 dark:border-slate-700/60 focus:outline-none focus:ring-1 focus:ring-amber-500/60 placeholder-slate-400 text-slate-800 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sort Menu Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              title="Sort Notes"
              className="p-1.5 rounded-md bg-white/80 dark:bg-slate-900/80 border border-amber-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>

            {showSortMenu && (
              <div className="absolute right-0 top-8 z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1 w-36 space-y-0.5 text-xs animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    setSortBy('date');
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${
                    sortBy === 'date' ? 'bg-amber-500/20 text-amber-900 dark:text-amber-300 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Sort by Date</span>
                  {sortBy === 'date' && <Check className="w-3 h-3 text-amber-500" />}
                </button>
                <button
                  onClick={() => {
                    setSortBy('title');
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${
                    sortBy === 'title' ? 'bg-amber-500/20 text-amber-900 dark:text-amber-300 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Sort by Title</span>
                  {sortBy === 'title' && <Check className="w-3 h-3 text-amber-500" />}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleCreateNote}
            title="Create New Note"
            className="p-1.5 rounded-md bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-2xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Note Cards List */}
        <div className="flex-1 overflow-y-auto space-y-3 pt-1 pr-0.5">
          {/* Pinned Notes Section */}
          {pinnedNotes.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[10px] font-bold tracking-wider text-amber-700 dark:text-amber-400 uppercase flex items-center gap-1">
                <Pin className="w-3 h-3 text-amber-500 fill-amber-500" /> Pinned
              </div>
              <div className="space-y-1">
                {pinnedNotes.map((note) => {
                  const isSelected = activeNoteId === note.id;
                  return (
                    <button
                      key={note.id}
                      onClick={() => setActiveNoteId(note.id)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all border ${
                        isSelected
                          ? 'bg-amber-500/25 dark:bg-amber-500/30 border-amber-400 dark:border-amber-500/50 shadow-xs ring-1 ring-amber-400/40'
                          : 'bg-white/60 dark:bg-slate-900/40 border-transparent hover:bg-amber-100/50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {note.title || 'Untitled Note'}
                        </span>
                        {note.isLocked && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {cleanSnippet(note.content) || 'No additional text'}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                        {note.date}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Regular Notes Section */}
          <div>
            <div className="px-2 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {activeFolderId === 'trash' ? 'Deleted Notes' : 'Notes'}
            </div>
            {otherNotes.length === 0 && pinnedNotes.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 italic">No notes found</div>
            ) : (
              <div className="space-y-1">
                {otherNotes.map((note) => {
                  const isSelected = activeNoteId === note.id;
                  return (
                    <button
                      key={note.id}
                      onClick={() => setActiveNoteId(note.id)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all border ${
                        isSelected
                          ? 'bg-amber-500/25 dark:bg-amber-500/30 border-amber-400 dark:border-amber-500/50 shadow-xs ring-1 ring-amber-400/40'
                          : 'bg-white/60 dark:bg-slate-900/40 border-transparent hover:bg-amber-100/50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {note.title || 'Untitled Note'}
                        </span>
                        {note.isLocked && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {cleanSnippet(note.content) || 'No additional text'}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                        {note.date}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Note Count Status Footer */}
        <div className="pt-2 border-t border-amber-200/40 dark:border-slate-800 text-center text-[10px] text-slate-400 font-medium shrink-0">
          {filteredNotes.length} {filteredNotes.length === 1 ? 'Note' : 'Notes'}
        </div>
      </div>

      {/* COLUMN 3: Main Note View & Editor */}
      <div className="flex-1 min-w-0 flex flex-col h-full bg-amber-50/20 dark:bg-slate-900/40 overflow-hidden relative">
        {/* Top macOS Notes Toolbar */}
        <div className="h-10 px-3 border-b border-amber-200/50 dark:border-slate-800 flex items-center justify-between bg-amber-100/30 dark:bg-slate-950/30 text-xs shrink-0 select-none gap-2 min-w-0 overflow-x-auto scrollbar-none">
          {/* Left Actions */}
          <div className="flex items-center gap-1.5 shrink-0 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title="Toggle Folders Sidebar"
              className="p-1.5 rounded-lg hover:bg-amber-200/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <PanelLeft className="w-4 h-4" />
            </button>

            {/* Folder Move Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMoveMenu(!showMoveMenu)}
                title="Move Note to Folder"
                className="px-2 py-1 rounded-lg bg-amber-200/40 dark:bg-slate-800/80 hover:bg-amber-200/70 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1 text-[11px] font-medium"
              >
                <Folder className="w-3.5 h-3.5 text-amber-500" />
                <span className="max-w-[100px] truncate">{currentFolder.name}</span>
                <ChevronRight className="w-3 h-3 text-slate-400 rotate-90" />
              </button>

              {showMoveMenu && (
                <div className="absolute left-0 top-8 z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1 w-44 space-y-0.5 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">
                    Move to Folder
                  </div>
                  {folders
                    .filter((f) => f.id !== 'trash' && f.id !== 'all')
                    .map((f) => (
                      <button
                        key={f.id}
                        onClick={() => handleMoveNote(f.id)}
                        className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 ${
                          activeNote.folderId === f.id
                            ? 'bg-amber-500/20 text-amber-900 dark:text-amber-300 font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Folder className="w-3.5 h-3.5 text-amber-500" />
                        <span>{f.name}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>

            <span className="text-slate-400 font-medium hidden sm:inline">•</span>

            <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px] truncate max-w-[150px]">
              {activeNote.date}
            </span>
          </div>

          {/* Right Toolbar Actions */}
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 shrink-0">
            {/* View / Edit Mode Switcher */}
            <div className="flex items-center bg-amber-200/50 dark:bg-slate-800 rounded-lg p-0.5 mr-1">
              <button
                onClick={() => setEditorMode('preview')}
                title="Rich Interactive View"
                className={`p-1 px-2 rounded-md transition-all flex items-center gap-1 text-[11px] font-medium ${
                  editorMode === 'preview'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rich</span>
              </button>
              <button
                onClick={() => setEditorMode('edit')}
                title="Source Markdown Editor"
                className={`p-1 px-2 rounded-md transition-all flex items-center gap-1 text-[11px] font-medium ${
                  editorMode === 'edit'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            </div>

            {/* Format Menu Popup */}
            <div className="relative">
              <button
                onClick={() => setShowFormatMenu(!showFormatMenu)}
                title="Format Text"
                className="p-1.5 rounded-lg hover:bg-amber-200/50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
              >
                <Type className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </button>

              {showFormatMenu && (
                <div className="absolute right-0 top-8 z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 w-48 space-y-0.5 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => applyFormatting('title')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                  >
                    <Heading1 className="w-3.5 h-3.5 text-accent-500" /> Title (#)
                  </button>
                  <button
                    onClick={() => applyFormatting('heading')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                  >
                    <Heading2 className="w-3.5 h-3.5 text-indigo-500" /> Heading (##)
                  </button>
                  <button
                    onClick={() => applyFormatting('subheading')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                  >
                    <Heading3 className="w-3.5 h-3.5 text-purple-500" /> Subheading (###)
                  </button>
                  <button
                    onClick={() => applyFormatting('checklist')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-amber-500" /> Checklist (- [ ])
                  </button>
                  <button
                    onClick={() => applyFormatting('bullet')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <List className="w-3.5 h-3.5 text-emerald-500" /> Bullet List (-)
                  </button>
                  <button
                    onClick={() => applyFormatting('numbered')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ListOrdered className="w-3.5 h-3.5 text-cyan-500" /> Numbered List (1.)
                  </button>
                  <button
                    onClick={() => applyFormatting('quote')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Quote className="w-3.5 h-3.5 text-orange-500" /> Blockquote (&gt;)
                  </button>
                  <button
                    onClick={() => applyFormatting('bold')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <span className="font-extrabold text-xs text-rose-500">B</span> Bold Text (**)
                  </button>
                </div>
              )}
            </div>

            {/* Checklist Shortcut */}
            <button
              onClick={() => applyFormatting('checklist')}
              title="Insert Checklist Item"
              className="p-1.5 rounded-lg hover:bg-amber-200/50 dark:hover:bg-slate-800 transition-colors"
            >
              <CheckSquare className="w-4 h-4 text-amber-500" />
            </button>

            {/* Pin Toggle */}
            <button
              onClick={handleTogglePin}
              title={activeNote.isPinned ? 'Unpin Note' : 'Pin Note'}
              className={`p-1.5 rounded-lg transition-colors ${
                activeNote.isPinned
                  ? 'text-amber-600 bg-amber-200/60 dark:bg-amber-500/20'
                  : 'hover:bg-amber-200/50 dark:hover:bg-slate-800'
              }`}
            >
              <Pin className="w-4 h-4" />
            </button>

            {/* Lock / Password Toggle */}
            <button
              onClick={handleToggleLockNote}
              title={activeNote.isLocked ? 'Remove Password Protection' : 'Protect with Password'}
              className={`p-1.5 rounded-lg transition-colors ${
                activeNote.isLocked
                  ? 'text-amber-600 bg-amber-200/60 dark:bg-amber-500/20'
                  : 'hover:bg-amber-200/50 dark:hover:bg-slate-800'
              }`}
            >
              {activeNote.isLocked ? <Lock className="w-4 h-4 text-amber-500" /> : <Unlock className="w-4 h-4" />}
            </button>

            {/* Copy / Share */}
            <button
              onClick={handleCopyNote}
              title="Copy Note Text"
              className="p-1.5 rounded-lg hover:bg-amber-200/50 dark:hover:bg-slate-800 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Restore button if in trash */}
            {activeNote.folderId === 'trash' ? (
              <button
                onClick={handleRestoreNote}
                title="Restore Note"
                className="p-1.5 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleDeleteNote}
                title="Move to Trash"
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-100/50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Note Body Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col justify-between select-text relative min-w-0">
          {isCurrentLocked ? (
            /* Protected Shield Overlay */
            <div className="my-auto mx-auto max-w-sm w-full p-6 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-amber-200 dark:border-slate-800 shadow-xl backdrop-blur-md text-center space-y-4">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Note is Locked
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  This note is password protected. Click unlock to view contents.
                </p>
              </div>
              <button
                onClick={handleUnlockCurrentNote}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Unlock Note
              </button>
            </div>
          ) : (
            /* Live Editor & Checklist Area */
            <div className="max-w-2xl mx-auto w-full space-y-4 min-w-0">
              {/* Note Header: Title Input */}
              <div className="space-y-1">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Note Title"
                  className="w-full text-2xl font-bold bg-transparent border-b border-amber-200/60 dark:border-slate-800 pb-2 focus:outline-none text-slate-900 dark:text-slate-50 placeholder-slate-400 tracking-tight"
                />
                <div className="text-[11px] text-slate-400 font-medium pt-1">
                  {activeNote.date} • {currentFolder.name}
                </div>
              </div>

              {/* Main Body Area: Switchable between Rich View & Edit Mode */}
              {editorMode === 'preview' ? (
                /* RICH INTERACTIVE VIEW MODE */
                <div className="space-y-3 min-h-[360px] text-sm text-slate-800 dark:text-slate-200 font-sans leading-relaxed">
                  {activeNote.content.split('\n').map((line, idx) => {
                    // Checkbox lines (- [ ] or - [x])
                    if (line.includes('- [ ]') || line.includes('- [x]')) {
                      const isChecked = line.includes('- [x]');
                      const text = line.replace('- [ ]', '').replace('- [x]', '').trim();

                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleChecklistIndex(idx)}
                          className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-xl bg-white/50 dark:bg-slate-800/40 border border-amber-200/30 dark:border-slate-700/40 hover:border-amber-400 cursor-pointer transition-all group"
                        >
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                              isChecked
                                ? 'bg-amber-500 border-amber-500 text-white'
                                : 'border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              isChecked
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {text || 'Task Item'}
                          </span>
                        </div>
                      );
                    }

                    // Headers
                    if (line.startsWith('# ')) {
                      return (
                        <h1 key={idx} className="text-xl font-bold text-slate-900 dark:text-white pt-2 pb-1 border-b border-amber-200/40 dark:border-slate-800">
                          {line.replace('# ', '')}
                        </h1>
                      );
                    }
                    if (line.startsWith('## ')) {
                      return (
                        <h2 key={idx} className="text-lg font-bold text-slate-900 dark:text-white pt-2">
                          {line.replace('## ', '')}
                        </h2>
                      );
                    }
                    if (line.startsWith('### ')) {
                      return (
                        <h3 key={idx} className="text-base font-semibold text-amber-900 dark:text-amber-300 pt-1">
                          {line.replace('### ', '')}
                        </h3>
                      );
                    }

                    // Blockquote
                    if (line.startsWith('> ')) {
                      return (
                        <blockquote key={idx} className="border-l-4 border-amber-500 pl-3 py-1 my-1 italic text-slate-600 dark:text-slate-300 bg-amber-500/5 rounded-r-lg">
                          {line.replace('> ', '')}
                        </blockquote>
                      );
                    }

                    // Bullet points
                    if (line.startsWith('- ') || line.startsWith('* ')) {
                      return (
                        <div key={idx} className="flex items-start gap-2 pl-2">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{renderInlineLinks(line.replace(/^[-*]\s*/, ''), idx)}</span>
                        </div>
                      );
                    }

                    // Numbered lists
                    if (/^\d+\.\s/.test(line)) {
                      return (
                        <div key={idx} className="flex items-start gap-2 pl-2">
                          <span className="text-amber-600 dark:text-amber-400 font-bold font-mono">
                            {line.match(/^\d+\./)?.[0]}
                          </span>
                          <span>{renderInlineLinks(line.replace(/^\d+\.\s*/, ''), idx)}</span>
                        </div>
                      );
                    }

                    // Empty line spacer
                    if (!line.trim()) {
                      return <div key={idx} className="h-2" />;
                    }

                    // Standard text
                    return (
                      <p key={idx} className="text-sm">
                        {renderInlineLinks(line, idx)}
                      </p>
                    );
                  })}
                </div>
              ) : (
                /* SOURCE TEXT EDITOR MODE */
                <textarea
                  ref={textareaRef}
                  value={activeNote.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Start typing your note..."
                  className="w-full min-h-[380px] bg-transparent resize-none focus:outline-none text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-sans tracking-wide"
                />
              )}
            </div>
          )}

          {/* Word & Character Status Bar */}
          <div className="pt-2 text-right text-[10px] text-slate-400 font-medium select-none flex items-center justify-between border-t border-amber-200/30 dark:border-slate-800/60 mt-4">
            <span className="text-slate-400">
              Folder: <strong className="text-amber-600 dark:text-amber-400">{currentFolder.name}</strong>
            </span>
            <span>
              {wordCount} {wordCount === 1 ? 'word' : 'words'}, {charCount} characters
            </span>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showLockModal && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 max-w-xs w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100">
              <Lock className="w-4 h-4 text-amber-500" /> Protect Note
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set password protection for &quot;{activeNote.title}&quot;.
            </p>
            <input
              type="password"
              placeholder="Enter Password..."
              value={lockPasswordInput}
              onChange={(e) => setLockPasswordInput(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowLockModal(false)}
                className="px-3 py-1.5 text-xs rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLock}
                className="px-3 py-1.5 text-xs rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600"
              >
                Protect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
