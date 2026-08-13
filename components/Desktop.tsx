'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppId, WindowState, WallpaperPreset, FileItem } from '@/types/mac';
import { useTheme } from '@/components/context/ThemeContext';
import { MenuBar } from '@/components/MenuBar';
import { Dock } from '@/components/Dock';
import { Window } from '@/components/Window';
import { Spotlight } from '@/components/Spotlight';
import { FinderApp } from '@/components/apps/FinderApp';
import { TerminalApp } from '@/components/apps/TerminalApp';
import { NotesApp } from '@/components/apps/NotesApp';
import { MailApp } from '@/components/apps/MailApp';
import { SettingsApp } from '@/components/apps/SettingsApp';
import { TextEditApp } from '@/components/apps/TextEditApp';
import { ResumeApp } from '@/components/apps/ResumeApp';
import { AskAIApp } from '@/components/apps/AskAIApp';
import Image from 'next/image';
import { FileText, Folder, Sparkles } from 'lucide-react';
import { PORTFOLIO_INFO } from '@/lib/data';
import { DESKTOP_FILES } from '@/lib/projectsFS';

const DEFAULT_WINDOWS: WindowState[] = [
  {
    id: 'notes',
    title: 'Notes — About Me',
    icon: 'Edit3',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 90, y: 55 },
    size: { width: 620, height: 430 },
  },
  {
    id: 'finder',
    title: 'Finder — AI & ML Projects',
    icon: 'Folder',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 120, y: 70 },
    size: { width: 660, height: 450 },
  },
  {
    id: 'terminal',
    title: 'Terminal — bash (Skills & CLI)',
    icon: 'Terminal',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 150, y: 85 },
    size: { width: 580, height: 400 },
  },
  {
    id: 'mail',
    title: 'Mail — Contact Aryan',
    icon: 'Mail',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 170, y: 75 },
    size: { width: 560, height: 420 },
  },
  {
    id: 'settings',
    title: 'System Settings',
    icon: 'Settings',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 140, y: 65 },
    size: { width: 600, height: 420 },
  },
  {
    id: 'textedit',
    title: 'Document Reader',
    icon: 'FileCode',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 200, y: 80 },
    size: { width: 620, height: 450 },
  },
  {
    id: 'askai',
    title: 'Ultron',
    icon: 'Sparkles',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 880, y: 210 },
    size: { width: 460, height: 500 },
  },
];

const STORAGE_KEY_WINDOWS = 'macos_portfolio_windows_state_v6';

const MAX_WINDOW_Z = 40;
const APP_IDS: AppId[] = ['finder', 'terminal', 'notes', 'mail', 'settings', 'textedit', 'askai'];

// Clamp a window size so it never overflows the viewport.
const fitSize = (size: { width: number; height: number }) => {
  if (typeof window === 'undefined') return { ...size };
  return {
    width: Math.max(360, Math.min(size.width, window.innerWidth - 48)),
    height: Math.max(200, Math.min(size.height, window.innerHeight - 120)),
  };
};

// Keep a restored window on screen.
const clampPosition = (
  position: { x: number; y: number },
  size: { width: number; height: number }
) => {
  if (typeof window === 'undefined') return { ...position };
  const maxX = Math.max(0, window.innerWidth - Math.min(size.width, window.innerWidth - 48) - 40);
  const maxY = Math.max(28, window.innerHeight - Math.min(size.height, window.innerHeight - 120) - 40);
  return {
    x: Math.max(0, Math.min(position.x, maxX)),
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
      x: Math.max(0, Math.round((window.innerWidth - fitted.width) / 2)),
      y: Math.max(28, Math.round((window.innerHeight - fitted.height) / 2)),
    },
  };
};

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

  // Save windows state (only after restore to avoid clobbering saved layout)
  useEffect(() => {
    if (typeof window === 'undefined' || !restored) return;
    try {
      localStorage.setItem(STORAGE_KEY_WINDOWS, JSON.stringify(windows));
    } catch (err) {
      console.error('Failed to save windows state:', err);
    }
  }, [windows, restored]);

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
      prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
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

  // Wallpaper CSS
  const getWallpaperClass = (preset: WallpaperPreset) => {
    switch (preset) {
      case 'sonoma-purple':
        return 'bg-gradient-to-br from-[#1e1b4b] via-[#3b0764] to-[#020617]';
      case 'sequoia-dusk':
        return 'bg-gradient-to-br from-[#0f172a] via-[#451a03] to-[#020617]';
      case 'cyber-navy':
        return 'bg-gradient-to-br from-[#0284c7] via-[#1e1b4b] to-[#020617]';
      case 'glass-light':
        return 'bg-gradient-to-br from-slate-200 via-purple-100 to-indigo-200';
      default:
        return 'bg-gradient-to-br from-[#1e1b4b] via-[#3b0764] to-[#020617]';
    }
  };

  return (
    <div
      onClick={() => setSelectedIcon(null)}
      className={`relative w-screen h-screen overflow-hidden select-none font-sans transition-all duration-500 ${labelTextClass} ${getWallpaperClass(
        wallpaper
      )}`}
    >
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

      {/* Desktop Icons (Top Left) */}
      <div className="absolute top-12 left-6 flex flex-col items-center gap-6 z-10">
        {/* Resume Icon */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setSelectedIcon('resume');
          }}
          onDoubleClick={() => handleOpenFile(DESKTOP_FILES[0])}
          className={`flex flex-col items-center gap-1.5 cursor-pointer group transition-transform hover:scale-105 ${
            selectedIcon === 'resume' ? 'opacity-100 ring-2 ring-accent-400 rounded-2xl p-1' : ''
          }`}
        >
          <div className={`${iconBoxSize} ${iconTileClass} flex items-center justify-center shadow-lg relative overflow-hidden group-hover:bg-white/20 transition-all`}>
            <FileText className={`${iconInnerSize} text-blue-400`} />
            <span className="absolute top-0.5 right-0.5 bg-blue-500/80 text-white text-[7px] font-bold px-1 rounded">
              PDF
            </span>
          </div>
          <span className={`text-[11px] font-medium ${labelTextClass} drop-shadow-md`}>
            Resume.pdf
          </span>
        </div>

        {/* Research / About Icon */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setSelectedIcon('about');
          }}
          onDoubleClick={() => handleOpenApp('notes')}
          className={`flex flex-col items-center gap-1.5 cursor-pointer group transition-transform hover:scale-105 ${
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

        {/* Projects Folder Icon */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setSelectedIcon('projects');
          }}
          onDoubleClick={() => handleOpenApp('finder')}
          className={`flex flex-col items-center gap-1.5 cursor-pointer group transition-transform hover:scale-105 ${
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
      <div className="absolute inset-0 pt-7 pb-16 pointer-events-none overflow-hidden">
        {[...windows]
          .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
          .map((win) => {
          const isActive = activeAppId === win.id;
          return (
            <div key={win.id} className="pointer-events-auto">
              <Window
                windowState={win}
                isActive={isActive}
                onFocus={() => handleFocusWindow(win.id)}
                onClose={() => handleCloseWindow(win.id)}
                onMinimize={() => handleToggleMinimize(win.id)}
                onMaximize={() => handleToggleMaximize(win.id)}
                onUpdatePosition={(x, y) => handleUpdatePosition(win.id, x, y)}
                onUpdateSize={(w, h) => handleUpdateSize(win.id, w, h)}
              >
                {win.id === 'finder' && (
                  <FinderApp
                    onOpenFile={handleOpenFile}
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
              </Window>
            </div>
          );
        })}
      </div>
      {/* Bottom Dock */}
      <Dock
        windows={windows}
        activeAppId={activeAppId}
        onOpenApp={handleOpenApp}
        onToggleMinimize={handleToggleMinimize}
      />

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
    </div>
  );
}
