'use client';

import React, { useState, useMemo, useRef, memo } from 'react';
import { motion } from 'motion/react';
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
          className="text-secondary underline decoration-secondary/50 hover:decoration-primary-container hover:text-primary"
        >
          {match[1]}
        </a>
      );
    }
    return <span key={`${keyPrefix}-link-${i}`}>{part}</span>;
  });
};

export const NotesApp = memo(function NotesApp() {
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
    sidebarWidth === 'compact'
      ? 'w-40 md:w-48'
      : sidebarWidth === 'wide'
        ? 'w-40 md:w-72'
        : 'w-40 md:w-64';

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
    <div className="flex h-full w-full select-none bg-surface text-on-surface overflow-hidden font-sans relative">
      {/* Toast Popup */}
      {toastMessage && (
        <div className="absolute top-11 right-6 z-50 bg-surface-container-high text-on-surface text-xs px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-md flex items-center gap-2 border border-white/10 transition-all animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* COLUMN 1: Folders Sidebar */}
      {isSidebarOpen && (
        <div
          className={`${sidebarWidthClass} border-r border-outline-variant bg-surface-container-low p-2.5 flex flex-col justify-between shrink-0 transition-all text-xs min-w-0`}
        >
          <div className="space-y-3 overflow-y-auto pr-1">
            {/* Header: iCloud */}
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-bold tracking-wider text-primary uppercase">
                iCloud
              </div>
              <div className="space-y-0.5">
                {folders
                  .filter((f) => f.id !== 'trash')
                  .map((f) => {
                    const isActive = activeFolderId === f.id;
                    const count = getFolderCount(f.id);
                    return (
                      <motion.button
                        key={f.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setActiveFolderId(f.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                          isActive
                            ? 'bg-primary-container/30 text-primary font-bold shadow-2xs'
                            : 'text-on-surface-variant hover:bg-surface-container-high '
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {f.id === 'quick-notes' ? (
                            <StickyNote className={`${iconSizeClass} text-primary shrink-0`} />
                          ) : f.id === 'work' ? (
                            <Briefcase className={`${iconSizeClass} text-secondary shrink-0`} />
                          ) : f.id === 'personal' ? (
                            <User className={`${iconSizeClass} text-secondary shrink-0`} />
                          ) : (
                            <Folder className={`${iconSizeClass} text-primary shrink-0`} />
                          )}
                          <span className="truncate">{f.name}</span>
                        </div>
                        <span className="text-[11px] text-on-surface-variant ml-1">
                          {count}
                        </span>
                      </motion.button>
                    );
                  })}
              </div>
            </div>

            {/* Header: System / Trash */}
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">
                System
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveFolderId('trash')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  activeFolderId === 'trash'
                    ? 'bg-error/10 text-error font-bold shadow-2xs'
                    : 'text-on-surface-variant hover:bg-surface-container-high '
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Trash2 className={`${iconSizeClass} text-error shrink-0`} />
                  <span className="truncate">Recently Deleted</span>
                </div>
                <span className="text-[11px] text-on-surface-variant">
                  {getFolderCount('trash')}
                </span>
              </motion.button>
            </div>
          </div>

          {/* Sidebar Footer: New Folder */}
          <div className="pt-2 border-t border-outline-variant">
            {isAddingFolder ? (
              <div className="space-y-1.5 p-1 bg-surface-container rounded-lg border border-outline-variant">
                <input
                  type="text"
                  placeholder="Folder Name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                  autoFocus
                  className="w-full px-2 py-1 text-xs bg-transparent focus:outline-none text-on-surface"
                />
                <div className="flex items-center justify-end gap-1">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setIsAddingFolder(false)}
                    className="p-1 rounded text-on-surface-variant hover:text-on-surface"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCreateFolder}
                    className="px-2 py-0.5 rounded bg-primary-container text-on-primary-container text-[10px] font-bold"
                  >
                    Add
                  </motion.button>
                </div>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsAddingFolder(true)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high  transition-colors font-medium text-xs"
              >
                <FolderPlus className={`${iconSizeClass} text-primary shrink-0`} />
                <span>New Folder</span>
              </motion.button>
            )}
          </div>
        </div>
      )}

      {/* COLUMN 2: Note List (hidden on mobile so the editor gets full width) */}
      <div className="hidden md:flex w-48 sm:w-56 border-r border-outline-variant bg-surface-container-low p-2.5 flex flex-col gap-2 shrink-0 overflow-hidden min-w-0">
        {/* Search Header */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search Notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-6 py-1 text-xs rounded-md bg-surface-container-high border border-outline-variant focus:outline-none focus:ring-1 focus:ring-primary-container/60 placeholder-on-surface-variant text-on-surface"
            />
            {searchQuery && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-3 h-3" />
              </motion.button>
            )}
          </div>

          {/* Sort Menu Toggle */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowSortMenu(!showSortMenu)}
              title="Sort Notes"
              className="p-1.5 rounded-md bg-surface-container-high border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest transition-colors shrink-0"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </motion.button>

            {showSortMenu && (
              <div className="absolute right-0 top-8 z-40 bg-surface-container border border-outline-variant rounded-xl shadow-xl p-1 w-36 space-y-0.5 text-xs animate-in fade-in zoom-in-95">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setSortBy('date');
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${
                    sortBy === 'date' ? 'bg-primary-container/30 text-primary font-bold' : 'hover:bg-surface-container-high'
                  }`}
                >
                  <span>Sort by Date</span>
                  {sortBy === 'date' && <Check className="w-3 h-3 text-primary" />}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setSortBy('title');
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${
                    sortBy === 'title' ? 'bg-primary-container/30 text-primary font-bold' : 'hover:bg-surface-container-high'
                  }`}
                >
                  <span>Sort by Title</span>
                  {sortBy === 'title' && <Check className="w-3 h-3 text-primary" />}
                </motion.button>
              </div>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCreateNote}
            title="Create New Note"
            className="p-1.5 rounded-md bg-primary-container text-on-primary-container hover:bg-primary-container/80 transition-colors shadow-2xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        {/* Note Cards List */}
        <div className="flex-1 overflow-y-auto space-y-3 pt-1 pr-0.5">
          {/* Pinned Notes Section */}
          {pinnedNotes.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[10px] font-bold tracking-wider text-primary uppercase flex items-center gap-1">
                <Pin className="w-3 h-3 text-primary fill-primary" /> Pinned
              </div>
              <div className="space-y-1">
                {pinnedNotes.map((note) => {
                  const isSelected = activeNoteId === note.id;
                  return (
                    <motion.button
                      key={note.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveNoteId(note.id)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all border ${
                        isSelected
                          ? 'bg-primary-container/25 border-primary-container/50 shadow-xs ring-1 ring-primary-container/40'
                          : 'bg-surface-container border-transparent hover:bg-surface-container-high'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-on-surface truncate">
                          {note.title || 'Untitled Note'}
                        </span>
                        {note.isLocked && <Lock className="w-3 h-3 text-primary shrink-0" />}
                      </div>
                      <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">
                        {cleanSnippet(note.content) || 'No additional text'}
                      </p>
                      <span className="text-[10px] text-on-surface-variant mt-1 block font-medium">
                        {note.date}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Regular Notes Section */}
          <div>
            <div className="px-2 pb-1 text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">
              {activeFolderId === 'trash' ? 'Deleted Notes' : 'Notes'}
            </div>
            {otherNotes.length === 0 && pinnedNotes.length === 0 ? (
              <div className="p-4 text-center text-xs text-on-surface-variant italic">No notes found</div>
            ) : (
              <div className="space-y-1">
                {otherNotes.map((note) => {
                  const isSelected = activeNoteId === note.id;
                  return (
                    <motion.button
                      key={note.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveNoteId(note.id)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all border ${
                        isSelected
                          ? 'bg-primary-container/25 border-primary-container/50 shadow-xs ring-1 ring-primary-container/40'
                          : 'bg-surface-container border-transparent hover:bg-surface-container-high'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-on-surface truncate">
                          {note.title || 'Untitled Note'}
                        </span>
                        {note.isLocked && <Lock className="w-3 h-3 text-primary shrink-0" />}
                      </div>
                      <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">
                        {cleanSnippet(note.content) || 'No additional text'}
                      </p>
                      <span className="text-[10px] text-on-surface-variant mt-1 block font-medium">
                        {note.date}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Note Count Status Footer */}
        <div className="pt-2 border-t border-outline-variant text-center text-[10px] text-on-surface-variant font-medium shrink-0">
          {filteredNotes.length} {filteredNotes.length === 1 ? 'Note' : 'Notes'}
        </div>
      </div>

      {/* COLUMN 3: Main Note View & Editor */}
      <div className="flex-1 min-w-0 flex flex-col h-full bg-surface overflow-hidden relative">
        {/* Top macOS Notes Toolbar */}
        <div className="h-10 px-3 border-b border-outline-variant flex items-center justify-between bg-surface-container-low text-xs shrink-0 select-none gap-2 min-w-0 overflow-x-auto scrollbar-none">
          {/* Left Actions */}
          <div className="flex items-center gap-1.5 shrink-0 min-w-0">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title="Toggle Folders Sidebar"
              className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
            >
              <PanelLeft className="w-4 h-4" />
            </motion.button>

            {/* Folder Move Dropdown */}
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowMoveMenu(!showMoveMenu)}
                title="Move Note to Folder"
                className="px-2 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors flex items-center gap-1 text-[11px] font-medium"
              >
                <Folder className="w-3.5 h-3.5 text-primary" />
                <span className="max-w-[100px] truncate">{currentFolder.name}</span>
                <ChevronRight className="w-3 h-3 text-on-surface-variant rotate-90" />
              </motion.button>

              {showMoveMenu && (
                <div className="absolute left-0 top-8 z-40 bg-surface-container border border-outline-variant rounded-xl shadow-xl p-1 w-44 space-y-0.5 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 text-[10px] font-bold text-on-surface-variant uppercase">
                    Move to Folder
                  </div>
                  {folders
                    .filter((f) => f.id !== 'trash' && f.id !== 'all')
                    .map((f) => (
                      <motion.button
                        key={f.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleMoveNote(f.id)}
                        className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 ${
                          activeNote.folderId === f.id
                            ? 'bg-primary-container/30 text-primary font-bold'
                            : 'hover:bg-surface-container-high'
                        }`}
                      >
                        <Folder className="w-3.5 h-3.5 text-primary" />
                        <span>{f.name}</span>
                      </motion.button>
                    ))}
                </div>
              )}
            </div>

            <span className="text-on-surface-variant font-medium hidden sm:inline">•</span>

            <span className="text-on-surface-variant font-medium text-[11px] truncate max-w-[150px]">
              {activeNote.date}
            </span>
          </div>

          {/* Right Toolbar Actions */}
          <div className="flex items-center gap-1 text-on-surface-variant shrink-0">
            {/* View / Edit Mode Switcher */}
            <div className="flex items-center bg-surface-container-high rounded-lg p-0.5 mr-1">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setEditorMode('preview')}
                title="Rich Interactive View"
                className={`p-1 px-2 rounded-md transition-all flex items-center gap-1 text-[11px] font-medium ${
                  editorMode === 'preview'
                    ? 'bg-surface-bright text-primary shadow-2xs font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rich</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setEditorMode('edit')}
                title="Source Markdown Editor"
                className={`p-1 px-2 rounded-md transition-all flex items-center gap-1 text-[11px] font-medium ${
                  editorMode === 'edit'
                    ? 'bg-surface-bright text-primary shadow-2xs font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </motion.button>
            </div>

            {/* Format Menu Popup */}
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowFormatMenu(!showFormatMenu)}
                title="Format Text"
                className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-1 text-xs"
              >
                <Type className="w-4 h-4 text-primary" />
              </motion.button>

              {showFormatMenu && (
                <div className="absolute right-0 top-8 z-40 bg-surface-container border border-outline-variant rounded-xl shadow-xl p-1.5 w-48 space-y-0.5 animate-in fade-in zoom-in-95">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => applyFormatting('title')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-surface-container-high font-bold"
                  >
                    <Heading1 className="w-3.5 h-3.5 text-secondary" /> Title (#)
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => applyFormatting('heading')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-surface-container-high font-semibold"
                  >
                    <Heading2 className="w-3.5 h-3.5 text-primary" /> Heading (##)
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => applyFormatting('subheading')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-surface-container-high font-medium"
                  >
                    <Heading3 className="w-3.5 h-3.5 text-secondary" /> Subheading (###)
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => applyFormatting('checklist')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-surface-container-high"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-primary" /> Checklist (- [ ])
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => applyFormatting('bullet')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-surface-container-high"
                  >
                    <List className="w-3.5 h-3.5 text-secondary" /> Bullet List (-)
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => applyFormatting('numbered')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-surface-container-high"
                  >
                    <ListOrdered className="w-3.5 h-3.5 text-secondary" /> Numbered List (1.)
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => applyFormatting('quote')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-surface-container-high"
                  >
                    <Quote className="w-3.5 h-3.5 text-primary" /> Blockquote (&gt;)
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => applyFormatting('bold')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-surface-container-high"
                  >
                    <span className="font-extrabold text-xs text-error">B</span> Bold Text (**)
                  </motion.button>
                </div>
              )}
            </div>

            {/* Checklist Shortcut */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => applyFormatting('checklist')}
              title="Insert Checklist Item"
              className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors"
            >
              <CheckSquare className="w-4 h-4 text-primary" />
            </motion.button>

            {/* Pin Toggle */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleTogglePin}
              title={activeNote.isPinned ? 'Unpin Note' : 'Pin Note'}
              className={`p-1.5 rounded-lg transition-colors ${
                activeNote.isPinned
                  ? 'text-primary bg-primary-container/30'
                  : 'hover:bg-surface-container-high'
              }`}
            >
              <Pin className="w-4 h-4" />
            </motion.button>

            {/* Lock / Password Toggle */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleToggleLockNote}
              title={activeNote.isLocked ? 'Remove Password Protection' : 'Protect with Password'}
              className={`p-1.5 rounded-lg transition-colors ${
                activeNote.isLocked
                  ? 'text-primary bg-primary-container/30'
                  : 'hover:bg-surface-container-high'
              }`}
            >
              {activeNote.isLocked ? <Lock className="w-4 h-4 text-primary" /> : <Unlock className="w-4 h-4" />}
            </motion.button>

            {/* Copy / Share */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleCopyNote}
              title="Copy Note Text"
              className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>

            {/* Restore button if in trash */}
            {activeNote.folderId === 'trash' ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleRestoreNote}
                title="Restore Note"
                className="p-1.5 text-secondary hover:bg-secondary-container/20 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleDeleteNote}
                title="Move to Trash"
                className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Note Body Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col justify-between select-text relative min-w-0">
          {isCurrentLocked ? (
            /* Protected Shield Overlay */
            <div className="my-auto mx-auto max-w-sm w-full p-6 bg-surface-container-high rounded-2xl border border-outline-variant shadow-xl backdrop-blur-md text-center space-y-4">
              <div className="w-12 h-12 bg-primary-container/10 text-primary rounded-2xl flex items-center justify-center mx-auto border border-primary-container/20">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-on-surface">
                  Note is Locked
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  This note is password protected. Click unlock to view contents.
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleUnlockCurrentNote}
                className="w-full py-2 bg-primary-container hover:bg-primary-container/80 text-on-primary-container font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Unlock Note
              </motion.button>
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
                  className="w-full text-2xl font-bold bg-transparent border-b border-outline-variant pb-2 focus:outline-none text-on-surface placeholder-on-surface-variant tracking-tight"
                />
                <div className="text-[11px] text-on-surface-variant font-medium pt-1">
                  {activeNote.date} • {currentFolder.name}
                </div>
              </div>

              {/* Main Body Area: Switchable between Rich View & Edit Mode */}
              {editorMode === 'preview' ? (
                /* RICH INTERACTIVE VIEW MODE */
                <div className="space-y-3 min-h-[360px] text-sm text-on-surface font-sans leading-relaxed">
                  {activeNote.content.split('\n').map((line, idx) => {
                    // Checkbox lines (- [ ] or - [x])
                    if (line.includes('- [ ]') || line.includes('- [x]')) {
                      const isChecked = line.includes('- [x]');
                      const text = line.replace('- [ ]', '').replace('- [x]', '').trim();

                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleChecklistIndex(idx)}
                          className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-xl bg-surface-container border border-outline-variant hover:border-primary-container cursor-pointer transition-all group"
                        >
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                              isChecked
                                ? 'bg-primary-container border-primary-container text-on-primary-container'
                                : 'border-outline-variant bg-surface-container'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              isChecked
                                ? 'line-through text-on-surface-variant'
                                : 'text-on-surface'
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
                        <h1 key={idx} className="text-xl font-bold text-on-surface pt-2 pb-1 border-b border-outline-variant">
                          {line.replace('# ', '')}
                        </h1>
                      );
                    }
                    if (line.startsWith('## ')) {
                      return (
                        <h2 key={idx} className="text-lg font-bold text-on-surface pt-2">
                          {line.replace('## ', '')}
                        </h2>
                      );
                    }
                    if (line.startsWith('### ')) {
                      return (
                        <h3 key={idx} className="text-base font-semibold text-primary pt-1">
                          {line.replace('### ', '')}
                        </h3>
                      );
                    }

                    // Blockquote
                    if (line.startsWith('> ')) {
                      return (
                        <blockquote key={idx} className="border-l-4 border-primary-container pl-3 py-1 my-1 italic text-on-surface-variant bg-primary-container/5 rounded-r-lg">
                          {line.replace('> ', '')}
                        </blockquote>
                      );
                    }

                    // Bullet points
                    if (line.startsWith('- ') || line.startsWith('* ')) {
                      return (
                        <div key={idx} className="flex items-start gap-2 pl-2">
                          <span className="text-primary font-bold">•</span>
                          <span>{renderInlineLinks(line.replace(/^[-*]\s*/, ''), idx)}</span>
                        </div>
                      );
                    }

                    // Numbered lists
                    if (/^\d+\.\s/.test(line)) {
                      return (
                        <div key={idx} className="flex items-start gap-2 pl-2">
                          <span className="text-primary font-bold font-mono">
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
                  className="w-full min-h-[380px] bg-transparent resize-none focus:outline-none text-sm leading-relaxed text-on-surface font-sans tracking-wide"
                />
              )}
            </div>
          )}

          {/* Word & Character Status Bar */}
          <div className="pt-2 text-right text-[10px] text-on-surface-variant font-medium select-none flex items-center justify-between border-t border-outline-variant mt-4">
            <span className="text-on-surface-variant">
              Folder: <strong className="text-primary">{currentFolder.name}</strong>
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
          <div className="bg-surface-container border border-outline-variant rounded-2xl shadow-2xl p-5 max-w-xs w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 font-bold text-sm text-on-surface">
              <Lock className="w-4 h-4 text-primary" /> Protect Note
            </div>
            <p className="text-xs text-on-surface-variant">
              Set password protection for &quot;{activeNote.title}&quot;.
            </p>
            <input
              type="password"
              placeholder="Enter Password..."
              value={lockPasswordInput}
              onChange={(e) => setLockPasswordInput(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-surface-container-high border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
            <div className="flex items-center justify-end gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowLockModal(false)}
                className="px-3 py-1.5 text-xs rounded-xl text-on-surface-variant hover:bg-surface-container-high"
              >
                Cancel
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleConfirmLock}
                className="px-3 py-1.5 text-xs rounded-xl bg-primary-container text-on-primary-container font-bold hover:bg-primary-container/80"
              >
                Protect
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
