'use client';

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { motion } from 'motion/react';
import { AppId, WindowState, FileItem } from '@/types/mac';
import { useTheme } from '@/components/context/ThemeContext';
import { getWallpaperConfig } from '@/lib/wallpapers';
import { DesktopIntro, IntroStage } from '@/components/DesktopIntro';
import { MenuBar } from '@/components/MenuBar';
import { Dock } from '@/components/Dock';
import { Window } from '@/components/Window';
import { Spotlight } from '@/components/Spotlight';
import { QuickLook } from '@/components/QuickLook';
import { FullscreenPrompt } from '@/components/FullscreenPrompt';
import { FinderApp } from '@/components/apps/FinderApp';
import { TerminalApp } from '@/components/apps/TerminalApp';
import { NotesApp } from '@/components/apps/NotesApp';
import { MailApp } from '@/components/apps/MailApp';
import { SettingsApp } from '@/components/apps/SettingsApp';
import { TextEditApp } from '@/components/apps/TextEditApp';
import { ResumeApp } from '@/components/apps/ResumeApp';
import { AskAIApp } from '@/components/apps/AskAIApp';
import { MusicApp } from '@/components/apps/MusicApp';
import { SafariApp } from '@/components/apps/SafariApp';
import Image from 'next/image';
import { FileText, Folder, Sparkles } from 'lucide-react';
import { PORTFOLIO_INFO } from '@/lib/data';
import { DESKTOP_FILES, RESEARCH_FS } from '@/lib/projectsFS';

const DEFAULT_WINDOWS: WindowState[] = [
  {
    id: 'notes',
    title: 'Notes — About Me',
    icon: 'Edit3',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 100, y: 50 },
    size: { width: 1100, height: 700 },
  },
  {
    id: 'finder',
    title: 'Finder — AI & ML Projects',
    icon: 'Folder',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 120, y: 60 },
    size: { width: 1200, height: 750 },
  },
  {
    id: 'terminal',
    title: 'Terminal — bash (Skills & CLI)',
    icon: 'Terminal',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 140, y: 70 },
    size: { width: 950, height: 600 },
  },
  {
    id: 'mail',
    title: 'Mail — Contact Aryan',
    icon: 'Mail',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 130, y: 65 },
    size: { width: 1000, height: 650 },
  },
  {
    id: 'settings',
    title: 'System Settings',
    icon: 'Settings',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 120, y: 60 },
    size: { width: 1200, height: 750 },
  },
  {
    id: 'textedit',
    title: 'Document Reader',
    icon: 'FileCode',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 130, y: 55 },
    size: { width: 1100, height: 700 },
  },
  {
    id: 'askai',
    title: 'Ultron',
    icon: 'Sparkles',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 560, y: 100 },
    size: { width: 750, height: 680 },
  },
  {
    id: 'music',
    title: 'Music',
    icon: 'Music',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 180, y: 80 },
    size: { width: 900, height: 600 },
  },
  {
    id: 'safari',
    title: 'Safari',
    icon: 'Compass',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 150, y: 75 },
    size: { width: 1100, height: 700 },
  },
];

const STORAGE_KEY_WINDOWS = 'macos_portfolio_windows_state_v10';

const MAX_WINDOW_Z = 40;
const APP_IDS: AppId[] = ['finder', 'terminal', 'notes', 'mail', 'settings', 'textedit', 'askai', 'music', 'safari'];

// Clamp a window size so it fits the viewport (and never overflows it, even on
// tiny screens where the requested width exceeds the usable space).
const fitSize = (size: { width: number; height: number }) => {
  if (typeof window === 'undefined') return { ...size };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxW = Math.max(400, vw - 64);
  const maxH = Math.max(300, vh - 140);
  const minW = Math.min(400, maxW);
  const minH = Math.min(300, maxH);
  return {
    width: Math.max(minW, Math.min(size.width, maxW)),
    height: Math.max(minH, Math.min(size.height, maxH)),
  };
};

// Keep a window's position fully on screen (respecting the menu bar and dock).
const clampPosition = (
  position: { x: number; y: number },
  size: { width: number; height: number }
) => {
  if (typeof window === 'undefined') return { ...position };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(size.width, vw - 64);
  const h = Math.min(size.height, vh - 140);
  const maxX = Math.max(0, vw - w - 32);
  const maxY = Math.max(28, vh - h - 60);
  return {
    x: Math.max(8, Math.min(position.x, maxX)),
    y: Math.max(28, Math.min(position.y, maxY)),
  };
};

const isValidWindow = (value: unknown): value is WindowState => {
  if (!value || typeof value !== 'object') return false;
  const w = value as Partial<WindowState>;
  return (
    !!w.id &&
    APP_IDS.includes(w.id) &&
    typeof w.position?.x === 'number' &&
    Number.isFinite(w.position.x) &&
    typeof w.position?.y === 'number' &&
    Number.isFinite(w.position.y) &&
    typeof w.size?.width === 'number' &&
    Number.isFinite(w.size.width) &&
    typeof w.size?.height === 'number' &&
    Number.isFinite(w.size.height) &&
    typeof w.zIndex === 'number'
  );
};

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const el = target as HTMLElement;
  return (
    el.isContentEditable ||
    el.tagName === 'INPUT' ||
    el.tagName === 'TEXTAREA' ||
    el.tagName === 'SELECT'
  );
};

// Center a window on the viewport (used when an app is opened fresh).
const openLayout = (size: { width: number; height: number }) => {
  if (typeof window === 'undefined') {
    return { size: { ...size }, position: { x: 100, y: 60 } };
  }
  const fitted = fitSize(size);
  return {
    size: fitted,
    position: {
      x: Math.max(8, Math.round((window.innerWidth - fitted.width) / 2)),
      y: Math.max(28, Math.round((window.innerHeight - fitted.height) / 2)),
    },
  };
};

interface WindowSlotProps {
  win: WindowState;
  isActive: boolean;
  finderRoot: 'projects' | 'research';
  finderFolderId: string | null;
  finderRootNonce: number;
  onFocus: (id: AppId) => void;
  onClose: (id: AppId) => void;
  onMinimize: (id: AppId) => void;
  onMaximize: (id: AppId) => void;
  onUpdatePosition: (id: AppId, x: number, y: number) => void;
  onUpdateSize: (id: AppId, width: number, height: number) => void;
  onOpenFile: (file: FileItem) => void;
  onQuickLook: (images: FileItem[], index: number) => void;
  browserTargetUrl?: string | null;
  onBrowserNavigated?: () => void;
}

// Renders one window's chrome + app body. Memoized on the window's own state
// object: Desktop re-renders on every drag frame, but non-dragged windows get
// the same `win` reference (and stable callbacks), so their whole subtree —
// including expensive bodies like Finder's file grid — skips re-rendering.
const WindowSlot = memo(function WindowSlot({
  win,
  isActive,
  finderRoot,
  finderFolderId,
  finderRootNonce,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onUpdatePosition,
  onUpdateSize,
  onOpenFile,
  onQuickLook,
  browserTargetUrl,
  onBrowserNavigated,
}: WindowSlotProps) {
  return (
    <div className="pointer-events-auto">
      <Window
        windowState={win}
        isActive={isActive}
        onFocus={() => onFocus(win.id)}
        onClose={() => onClose(win.id)}
        onMinimize={() => onMinimize(win.id)}
        onMaximize={() => onMaximize(win.id)}
        onUpdatePosition={(x, y) => onUpdatePosition(win.id, x, y)}
        onUpdateSize={(w, h) => onUpdateSize(win.id, w, h)}
      >
        {win.id === 'finder' && (
          <FinderApp
            key={finderRootNonce}
            initialRoot={finderRoot}
            initialFolderId={finderFolderId}
            onOpenFile={onOpenFile}
            onQuickLook={onQuickLook}
          />
        )}
        {win.id === 'terminal' && <TerminalApp />}
        {win.id === 'notes' && <NotesApp />}
        {win.id === 'mail' && <MailApp />}
        {win.id === 'settings' && <SettingsApp />}
        {win.id === 'textedit' &&
          (win.fileData?.type === 'pdf' ? (
            <ResumeApp minimal fileData={win.fileData} />
          ) : (
            <TextEditApp
              key={win.fileData?.id ?? 'library'}
              fileData={win.fileData}
            />
          ))}
        {win.id === 'askai' && <AskAIApp />}
        {win.id === 'music' && <MusicApp />}
        {win.id === 'safari' && (
          <SafariApp
            navigateToUrl={browserTargetUrl}
            onNavigated={onBrowserNavigated}
          />
        )}
      </Window>
    </div>
  );
});

interface DesktopProps {
  onTriggerBoot?: () => void;
}

export function Desktop({ onTriggerBoot }: DesktopProps) {
  const { wallpaper, isLocked, setIsLocked, desktopIconSize } = useTheme();

  const iconBoxSize =
    desktopIconSize === 'small'
      ? 'w-10 h-10'
      : desktopIconSize === 'large'
      ? 'w-16 h-16'
      : 'w-14 h-14';

  const iconInnerSize =
    desktopIconSize === 'small'
      ? 'w-5 h-5'
      : desktopIconSize === 'large'
      ? 'w-9 h-9'
      : 'w-8 h-8';

  const isLightWallpaper = wallpaper === 'glass-light';
  const labelTextClass = isLightWallpaper ? 'text-slate-800' : 'text-white';
  const iconTileClass = isLightWallpaper
    ? 'bg-white/70 backdrop-blur-md rounded-xl border border-white/40'
    : 'bg-white/10 backdrop-blur-md rounded-xl border border-white/20';

  const [windows, setWindows] = useState<WindowState[]>(DEFAULT_WINDOWS);
  const [restored, setRestored] = useState(false);
  const [activeAppId, setActiveAppId] = useState<AppId | null>('notes');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState<boolean>(false);
  const [quickLook, setQuickLook] = useState<{
    images: FileItem[];
    index: number;
  } | null>(null);

  // Stable identity so memoized WindowSlots don't re-render when Quick Look opens.
  const handleQuickLook = useCallback((images: FileItem[], index: number) => {
    setQuickLook({ images, index });
  }, []);

  // Fullscreen prompt — tracks whether the overlay has been dismissed this session.
  const [showFsPrompt, setShowFsPrompt] = useState(true);

  // Intro entrance: plays on every full page load (and boot replay), but never
  // replays for window open/close since Desktop is not remounted for those.
  const [introPlayed, setIntroPlayed] = useState(false);
  const [introStage, setIntroStage] = useState<IntroStage>('pending');
  useEffect(() => {
    const enterTimer = window.setTimeout(() => setIntroStage('entering'), 30);
    const doneTimer = window.setTimeout(() => {
      setIntroPlayed(true);
      setIntroStage('done');
    }, 2100);
    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  // Which Finder root the desktop folder icons should open (and a nonce so a
  // repeated double-click on the same icon still re-mounts Finder at that root).
  const [finderRoot, setFinderRoot] = useState<'projects' | 'research'>('projects');
  const [finderFolderId, setFinderFolderId] = useState<string | null>(null);
  const [finderRootNonce, setFinderRootNonce] = useState(0);

  // Browser navigation state — when the dock or OS triggers a URL open,
  // this prop tells SafariApp to navigate to that URL.
  const [browserTargetUrl, setBrowserTargetUrl] = useState<string | null>(null);
  const clearBrowserTarget = useCallback(() => setBrowserTargetUrl(null), []);

  // True while a MenuBar dropdown or modal is open so Escape/overlays behave
  const overlayOpenRef = useRef(false);
  useEffect(() => {
    const onOverlayChange = (e: Event) => {
      overlayOpenRef.current = (e as CustomEvent<boolean>).detail ?? false;
    };
    window.addEventListener('os:overlay-change', onOverlayChange);
    return () => window.removeEventListener('os:overlay-change', onOverlayChange);
  }, []);

  // Load saved state on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_WINDOWS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const valid = parsed.filter(isValidWindow);
            const merged = DEFAULT_WINDOWS.map((def) => {
              const savedWin = valid.find((w) => w.id === def.id);
              if (!savedWin) return def;
              const size = fitSize(savedWin.size);
              return {
                ...def,
                ...savedWin,
                size,
                position: clampPosition(savedWin.position, size),
              };
            });
            setWindows(merged);
            const top = [...merged]
              .filter((w) => w.isOpen && !w.isMinimized)
              .sort((a, b) => b.zIndex - a.zIndex)[0];
            if (top) setActiveAppId(top.id);
          }
        }
      } catch (err) {
        console.error('Failed to load windows state:', err);
      } finally {
        setRestored(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Persist window state — debounced. Writing on every `windows` change would
  // JSON.stringify + localStorage.setItem at 60fps while dragging; coalescing
  // into a single save 400ms after the last change avoids that. Latest state is
  // flushed immediately if the tab closes or is hidden mid-debounce.
  const windowsRef = useRef(windows);
  useEffect(() => {
    windowsRef.current = windows;
  }, [windows]);
  const saveTimerRef = useRef<number | null>(null);

  const persistWindows = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WINDOWS, JSON.stringify(windowsRef.current));
    } catch (err) {
      console.error('Failed to save windows state:', err);
    }
  }, []);

  useEffect(() => {
    if (!restored) return;
    if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(persistWindows, 400);
    return () => {
      if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    };
  }, [windows, restored, persistWindows]);

  useEffect(() => {
    const flush = () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      persistWindows();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('beforeunload', flush);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', flush);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [persistWindows]);

  // Re-flow open windows whenever the viewport changes (rotate, split screen,
  // resize the browser) so no window is ever clipped or stranded off-screen.
  useEffect(() => {
    let timer: number;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setWindows((prev) =>
          prev.map((w) => {
            if (!w.isOpen) return w;
            const size = fitSize(w.size);
            const position = clampPosition(w.position, size);
            if (
              size.width === w.size.width &&
              size.height === w.size.height &&
              position.x === w.position.x &&
              position.y === w.position.y
            ) {
              return w;
            }
            return { ...w, size, position };
          })
        );
      }, 150);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Focus Window
  const handleFocusWindow = useCallback((id: AppId) => {
    setActiveAppId(id);
    setWindows((prev) => {
      const max = prev.reduce((m, w) => Math.max(m, w.zIndex || 0), 0);
      let next = max + 1;
      let base = prev;
      if (next > MAX_WINDOW_Z) {
        const sorted = [...prev].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
        base = sorted.map((w, i) => ({ ...w, zIndex: 10 + i }));
        next = 10 + sorted.length;
      }
      return base.map((w) => {
        if (w.id !== id) return w;
        const layout = w.isOpen ? { size: fitSize(w.size) } : openLayout(w.size);
        return { ...w, ...layout, zIndex: next, isMinimized: false, isOpen: true };
      });
    });
  }, []);

  // Open App
  const handleOpenApp = useCallback((id: AppId) => {
    if (id === 'textedit') {
      setWindows((prev) => {
        const max = prev.reduce((m, w) => Math.max(m, w.zIndex || 0), 0);
        let next = max + 1;
        let base = prev;
        if (next > MAX_WINDOW_Z) {
          const sorted = [...prev].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
          base = sorted.map((w, i) => ({ ...w, zIndex: 10 + i }));
          next = 10 + sorted.length;
        }
        return base.map((w) => {
          if (w.id !== 'textedit') return w;
          const layout = w.isOpen ? { size: fitSize(w.size) } : openLayout(w.size);
          return {
            ...w,
            ...layout,
            title: 'Document Reader',
            fileData: undefined,
            isOpen: true,
            isMinimized: false,
            zIndex: next,
          };
        });
      });
      setActiveAppId('textedit');
      return;
    }

    handleFocusWindow(id);
  }, [handleFocusWindow]);

  // Open Finder at a specific root (Projects Directory or Research library),
  // optionally deep-linking straight into one research topic folder.
  const handleOpenFinderRoot = useCallback(
    (root: 'projects' | 'research', folderId?: string | null) => {
      setFinderRoot(root);
      setFinderFolderId(folderId ?? null);
      setFinderRootNonce((n) => n + 1);
      handleOpenApp('finder');
    },
    [handleOpenApp]
  );

  // Open File in Document Reader
  const handleOpenFile = useCallback((file: FileItem) => {
    const appId = 'textedit';

    setWindows((prev) => {
      const max = prev.reduce((m, w) => Math.max(m, w.zIndex || 0), 0);
      let next = max + 1;
      let base = prev;
      if (next > MAX_WINDOW_Z) {
        const sorted = [...prev].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
        base = sorted.map((w, i) => ({ ...w, zIndex: 10 + i }));
        next = 10 + sorted.length;
      }
      return base.map((w) => {
        if (w.id === appId) {
          const layout = w.isOpen ? { size: fitSize(w.size) } : openLayout(w.size);
          return {
            ...w,
            ...layout,
            title: `${file.name} — Preview`,
            fileData: file,
            isOpen: true,
            isMinimized: false,
            zIndex: next,
          };
        }
        return w;
      });
    });
    setActiveAppId(appId);
  }, []);

  // Open URL in Browser — opens Safari (if not already open) and navigates
  // to the given URL. Used by dock GitHub/LinkedIn icons and any internal
  // link that should open inside the OS browser rather than a real tab.
  const handleOpenBrowserUrl = useCallback(
    (url: string) => {
      setBrowserTargetUrl(url);
      handleFocusWindow('safari');
    },
    [handleFocusWindow]
  );

  // Close Window
  const handleCloseWindow = useCallback(
    (id: AppId) => {
      setWindows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, isOpen: false } : w))
      );
      if (activeAppId === id) {
        const remainingOpen = windows.filter(
          (w) => w.id !== id && w.isOpen && !w.isMinimized
        );
        if (remainingOpen.length > 0) {
          remainingOpen.sort((a, b) => b.zIndex - a.zIndex);
          setActiveAppId(remainingOpen[0].id);
        } else {
          setActiveAppId(null);
        }
      }
    },
    [activeAppId, windows]
  );

  // Toggle Minimize (restoring brings the window to the front and focuses it)
  const handleToggleMinimize = useCallback(
    (id: AppId) => {
      const win = windows.find((w) => w.id === id);
      if (win?.isMinimized) {
        setWindows((prev) => {
          const max = prev.reduce((m, w) => Math.max(m, w.zIndex || 0), 0);
          let next = max + 1;
          let base = prev;
          if (next > MAX_WINDOW_Z) {
            const sorted = [...prev].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
            base = sorted.map((w, i) => ({ ...w, zIndex: 10 + i }));
            next = 10 + sorted.length;
          }
          return base.map((w) =>
            w.id === id ? { ...w, isMinimized: false, zIndex: next } : w
          );
        });
        setActiveAppId(id);
      } else {
        setWindows((prev) =>
          prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
        );
        if (activeAppId === id) {
          const remainingOpen = windows.filter(
            (w) => w.id !== id && w.isOpen && !w.isMinimized
          );
          if (remainingOpen.length > 0) {
            remainingOpen.sort((a, b) => b.zIndex - a.zIndex);
            setActiveAppId(remainingOpen[0].id);
          } else {
            setActiveAppId(null);
          }
        }
      }
    },
    [windows, activeAppId]
  );

  // Toggle Maximize
  const handleToggleMaximize = useCallback((id: AppId) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        if (w.isMaximized) {
          // Restore to saved position/size if available, otherwise use defaults
          return {
            ...w,
            isMaximized: false,
            position: w.preMaximizePosition || openLayout(w.size).position,
            size: w.preMaximizeSize || w.size,
          };
        }
        // Save current position/size before maximizing
        return {
          ...w,
          isMaximized: true,
          preMaximizePosition: { ...w.position },
          preMaximizeSize: { ...w.size },
        };
      })
    );
  }, []);

  // Update Position
  const handleUpdatePosition = useCallback((id: AppId, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, position: { x, y } } : w))
    );
  }, []);

  // Update Size
  const handleUpdateSize = useCallback((id: AppId, width: number, height: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, size: { width, height } } : w))
    );
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;

      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.altKey && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        setWindows((prev) => prev.map((w) => ({ ...w, isOpen: false })));
        setActiveAppId(null);
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (activeAppId) {
          handleCloseWindow(activeAppId);
        }
      } else if (
        isCmdOrCtrl &&
        (e.key.toLowerCase() === 'm' || e.key.toLowerCase() === 'h')
      ) {
        e.preventDefault();
        if (activeAppId) {
          handleToggleMinimize(activeAppId);
        }
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        if (activeAppId) {
          handleCloseWindow(activeAppId);
        }
      } else if (isCmdOrCtrl && e.key === ',') {
        e.preventDefault();
        handleOpenApp('settings');
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        window.print();
      } else if (e.altKey && isCmdOrCtrl && e.key === 'Escape') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('os:open-force-quit'));
      } else if (e.key === 'Escape') {
        if (isSpotlightOpen) {
          setIsSpotlightOpen(false);
        } else if (!overlayOpenRef.current && activeAppId) {
          handleCloseWindow(activeAppId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeAppId, isSpotlightOpen, handleCloseWindow, handleToggleMinimize, handleOpenApp]);

  const wallpaperCfg = getWallpaperConfig(wallpaper);

  return (
    <div
      onClick={() => setSelectedIcon(null)}
      className={`relative w-screen h-screen overflow-hidden select-none font-sans transition-all duration-500 ${labelTextClass} bg-slate-950`}
    >
      {/* Wallpaper Layer (image or gradient) + legibility scrim */}
      <motion.div
        initial={introPlayed ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="absolute inset-0 overflow-hidden"
      >
        {wallpaperCfg.type === 'image' && wallpaperCfg.imagePath ? (
          <>
            <Image
              src={wallpaperCfg.imagePath}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            {wallpaperCfg.scrim && (
              <div className={`absolute inset-0 ${wallpaperCfg.scrim}`} />
            )}
          </>
        ) : (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${wallpaperCfg.gradient}`} />
            {!isLightWallpaper && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />
            )}
          </>
        )}
      </motion.div>

      {/* Intro Overlay (name + cycling role taglines) */}
      <DesktopIntro stage={introStage} playEntrance={!introPlayed} />
      {/* Lock Screen Overlay */}
      {isLocked && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-3xl text-white flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-2xl mb-4 overflow-hidden">
            <Image
              src="/logo.png"
              alt={PORTFOLIO_INFO.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-xl font-bold">{PORTFOLIO_INFO.name}</h2>
          <p className="text-xs text-slate-400 mb-6">{PORTFOLIO_INFO.role}</p>
          <button
            onClick={() => setIsLocked(false)}
            className="px-6 py-2 rounded-xl bg-white text-slate-900 font-semibold text-xs hover:bg-slate-200 transition-colors shadow-lg"
          >
            Click to Unlock macOS Session
          </button>
        </div>
      )}

      {/* Ambient Wallpaper Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Top MenuBar */}
      <motion.div
        initial={introPlayed ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={
          introPlayed
            ? { duration: 0.3 }
            : { duration: 0.6, ease: 'easeOut', delay: 1.5 }
        }
      >
        <MenuBar
          windows={windows}
          activeAppId={activeAppId}
          onOpenApp={handleOpenApp}
          onOpenFile={handleOpenFile}
        onOpenSpotlight={() => setIsSpotlightOpen(true)}
        onTriggerBoot={() => onTriggerBoot?.()}
        onCloseWindow={handleCloseWindow}
        onToggleMinimize={handleToggleMinimize}
        onToggleMaximize={handleToggleMaximize}
        onCloseAllWindows={() => {
          setWindows((prev) => prev.map((w) => ({ ...w, isOpen: false })));
          setActiveAppId(null);
        }}
        />
      </motion.div>

      {/* Desktop Icons (Top-Left Row) — icons placed in a single horizontal line. */}
      <div className="absolute top-12 left-6 bottom-88 z-10 flex flex-row flex-wrap content-start items-start gap-6 overflow-hidden">
        {/* Desktop Documents — every PDF from /content/documents becomes an icon */}
        {DESKTOP_FILES.map((file) => (
          <div
            key={file.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIcon(file.id);
            }}
            onDoubleClick={() => handleOpenFile(file)}
            className={`flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group transition-transform hover:scale-105 ${
              selectedIcon === file.id ? 'opacity-100 ring-2 ring-accent-400 rounded-2xl p-1' : ''
            }`}
          >
            <div className={`${iconBoxSize} ${iconTileClass} flex items-center justify-center shadow-lg relative overflow-hidden group-hover:bg-white/20 transition-all`}>
              <FileText className={`${iconInnerSize} text-blue-400`} />
              <span className="absolute top-0.5 right-0.5 bg-blue-500/80 text-white text-[7px] font-bold px-1 rounded">
                PDF
              </span>
            </div>
            <span className={`text-[11px] font-medium ${labelTextClass} drop-shadow-md max-w-[110px] text-center truncate`}>
              {file.name.replace(/\.pdf$/i, '')}
            </span>
          </div>
        ))}

        {/* Research / About Icon */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setSelectedIcon('about');
          }}
          onDoubleClick={() => handleOpenFinderRoot('research')}
          className={`flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group transition-transform hover:scale-105 ${
            selectedIcon === 'about' ? 'opacity-100 ring-2 ring-accent-400 rounded-2xl p-1' : ''
          }`}
        >
          <div className={`${iconBoxSize} ${iconTileClass} flex items-center justify-center shadow-lg group-hover:bg-white/20 transition-all`}>
            <Folder className={`${iconInnerSize} text-purple-400 fill-purple-400/20`} />
          </div>
          <span className={`text-[11px] font-medium ${labelTextClass} drop-shadow-md`}>
            Research
          </span>
        </div>

        {/* Research Topics — one folder icon per topic from /content/research */}
        {RESEARCH_FS.map((topic) => (
          <div
            key={topic.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIcon(topic.id);
            }}
            onDoubleClick={() => handleOpenFinderRoot('research', topic.id)}
            className={`flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group transition-transform hover:scale-105 ${
              selectedIcon === topic.id ? 'opacity-100 ring-2 ring-accent-400 rounded-2xl p-1' : ''
            }`}
          >
            <div className={`${iconBoxSize} ${iconTileClass} flex items-center justify-center shadow-lg group-hover:bg-white/20 transition-all`}>
              <Folder className={`${iconInnerSize} text-fuchsia-400 fill-fuchsia-400/20`} />
            </div>
            <span className={`text-[11px] font-medium ${labelTextClass} drop-shadow-md max-w-[110px] text-center truncate`}>
              {topic.name}
            </span>
          </div>
        ))}

        {/* Projects Folder Icon */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setSelectedIcon('projects');
          }}
          onDoubleClick={() => handleOpenFinderRoot('projects')}
          className={`flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group transition-transform hover:scale-105 ${
            selectedIcon === 'projects' ? 'opacity-100 ring-2 ring-accent-400 rounded-2xl p-1' : ''
          }`}
        >
          <div className={`${iconBoxSize} ${iconTileClass} flex items-center justify-center shadow-lg group-hover:bg-white/20 transition-all`}>
            <Folder className={`${iconInnerSize} text-indigo-400 fill-indigo-400/30`} />
          </div>
          <span className={`text-[11px] font-medium ${labelTextClass} drop-shadow-md`}>
            Projects
          </span>
        </div>
      </div>

      {/* Main Window Stage */}
      <div className="absolute inset-0 pt-7 pb-[76px] pointer-events-none overflow-hidden">
        {[...windows]
          .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
          .map((win) => (
            <WindowSlot
              key={win.id}
              win={win}
              isActive={activeAppId === win.id}
              finderRoot={finderRoot}
              finderFolderId={finderFolderId}
              finderRootNonce={finderRootNonce}
              onFocus={handleFocusWindow}
              onClose={handleCloseWindow}
              onMinimize={handleToggleMinimize}
              onMaximize={handleToggleMaximize}
              onUpdatePosition={handleUpdatePosition}
              onUpdateSize={handleUpdateSize}
              onOpenFile={handleOpenFile}
              onQuickLook={handleQuickLook}
              browserTargetUrl={browserTargetUrl}
              onBrowserNavigated={clearBrowserTarget}
            />
          ))}
      </div>
      {/* Bottom Dock */}
      <motion.div
        initial={introPlayed ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={
          introPlayed
            ? { duration: 0.3 }
            : { duration: 0.6, ease: 'easeOut', delay: 1.5 }
        }
      >
        <Dock
          windows={windows}
          activeAppId={activeAppId}
          onOpenApp={handleOpenApp}
          onToggleMinimize={handleToggleMinimize}
          onNavigateToUrl={handleOpenBrowserUrl}
        />
      </motion.div>

      {/* Floating "Ask Ultron" Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleOpenApp('askai');
        }}
        title="Ask Ultron"
        className="absolute bottom-20 right-5 z-[45] group animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        <span className="block bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 p-[1.5px] rounded-full shadow-[0_0_25px_rgba(139,92,246,0.45)] group-hover:shadow-[0_0_35px_rgba(139,92,246,0.65)] transition-shadow">
          <span className="flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full bg-slate-900/85 backdrop-blur-xl text-white group-hover:bg-slate-900/70 transition-colors">
            <Sparkles className="w-4 h-4 text-fuchsia-300" />
            <span className="text-xs font-semibold">Ask Ultron</span>
          </span>
        </span>
      </button>

      {/* Spotlight Search Overlay */}
      <Spotlight
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        onOpenApp={handleOpenApp}
      />

      {/* Quick Look Image Viewer */}
      {quickLook && (
        <QuickLook
          images={quickLook.images}
          initialIndex={quickLook.index}
          onClose={() => setQuickLook(null)}
        />
      )}

      {/* Fullscreen Prompt — desktop only, after intro completes */}
      {showFsPrompt && introPlayed && (
        <FullscreenPrompt onDismiss={() => setShowFsPrompt(false)} />
      )}
    </div>
  );
}
