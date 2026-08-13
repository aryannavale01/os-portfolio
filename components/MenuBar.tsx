'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppId, WindowState, FileItem } from '@/types/mac';
import { PORTFOLIO_INFO } from '@/lib/data';
import { useTheme } from '@/components/context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import {
  Wifi,
  Battery,
  Search,
  SlidersHorizontal,
  Moon,
  Sun,
  Lock,
  RotateCcw,
  Volume2,
  VolumeX,
  Bluetooth,
  HelpCircle,
  Command,
  X,
  Check,
  Maximize2,
  Music,
  Play,
  Pause,
  Sparkles,
  Folder,
  Terminal,
  BookOpen,
} from 'lucide-react';

interface MenuBarProps {
  windows?: WindowState[];
  activeAppId: AppId | null;
  onOpenApp: (appId: AppId) => void;
  onOpenFile?: (file: FileItem) => void;
  onOpenSpotlight: () => void;
  onTriggerBoot: () => void;
  onCloseWindow?: (appId: AppId) => void;
  onToggleMinimize?: (appId: AppId) => void;
  onToggleMaximize?: (appId: AppId) => void;
  onCloseAllWindows?: () => void;
}

type ActiveMenuTab =
  | 'apple'
  | 'app'
  | 'file'
  | 'edit'
  | 'view'
  | 'window'
  | 'help'
  | 'control'
  | null;

export function MenuBar({
  windows = [],
  activeAppId,
  onOpenApp,
  onOpenFile,
  onOpenSpotlight,
  onTriggerBoot,
  onCloseWindow,
  onToggleMinimize,
  onToggleMaximize,
  onCloseAllWindows,
}: MenuBarProps) {
  const { theme, toggleTheme, setIsLocked } = useTheme();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [openTab, setOpenTab] = useState<ActiveMenuTab>(null);
  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(true);

  // Control Center Interactive State
  const [wifiEnabled, setWifiEnabled] = useState<boolean>(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState<boolean>(true);
  const [airdropEnabled, setAirdropEnabled] = useState<boolean>(true);
  const [brightness, setBrightness] = useState<number>(90);
  const [volume, setVolume] = useState<number>(80);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(true);

  // Modals
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [showForceQuitModal, setShowForceQuitModal] = useState<boolean>(false);
  const [clipboardToast, setClipboardToast] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
      setCurrentTime(formatted.replace(',', ''));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenTab(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Let the Desktop know a dropdown/modal is open so Escape/overlays behave
  useEffect(() => {
    const overlayOpen = openTab !== null || showShortcutsModal || showForceQuitModal;
    window.dispatchEvent(new CustomEvent('os:overlay-change', { detail: overlayOpen }));
  }, [openTab, showShortcutsModal, showForceQuitModal]);

  // Escape closes the topmost MenuBar overlay; open Force Quit via keyboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showShortcutsModal) setShowShortcutsModal(false);
        else if (showForceQuitModal) setShowForceQuitModal(false);
        else setOpenTab(null);
      }
    };
    const onOpenForceQuit = () => setShowForceQuitModal(true);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('os:open-force-quit', onOpenForceQuit);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('os:open-force-quit', onOpenForceQuit);
    };
  }, [showShortcutsModal, showForceQuitModal]);

  // Cursor-on-top detection for auto-hiding menu bar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (openTab !== null) {
        setIsMenuVisible(true);
        return;
      }
      if (e.clientY <= 36) {
        setIsMenuVisible(true);
      } else if (e.clientY > 55 && openTab === null) {
        setIsMenuVisible(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [openTab]);

  const getAppName = (id: AppId | null) => {
    switch (id) {
      case 'finder':
        return 'Finder';
      case 'terminal':
        return 'Terminal';
      case 'notes':
        return 'Notes';
      case 'mail':
        return 'Mail';
      case 'settings':
        return 'System Settings';
      case 'textedit':
        return 'Document Reader';
      case 'askai':
        return 'Ultron';
      default:
        return 'Finder';
    }
  };

  const currentAppName = getAppName(activeAppId);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).catch(() => undefined);
    setClipboardToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setClipboardToast(null), 2500);
    setOpenTab(null);
  };

  const toggleTab = (tab: ActiveMenuTab) => {
    setOpenTab((prev) => (prev === tab ? null : tab));
  };

  return (
    <>
      {/* Dynamic Brightness Overlay Controlled by Control Center Slider */}
      <div
        style={{ opacity: (100 - brightness) / 100 }}
        className="fixed inset-0 bg-black pointer-events-none z-[45] transition-opacity duration-150"
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {clipboardToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[60] bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white px-4 py-2 rounded-xl text-xs font-medium shadow-2xl border border-black/10 dark:border-white/20 backdrop-blur-md flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{clipboardToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invisible Mouse Hover Trigger at Top Screen Edge */}
      <div
        onMouseEnter={() => setIsMenuVisible(true)}
        className="fixed top-0 left-0 right-0 h-2.5 z-50 pointer-events-auto"
      />

      {/* Auto-Hiding Slide Down Top MenuBar Header */}
      <motion.header
        ref={menuRef}
        onMouseEnter={() => setIsMenuVisible(true)}
        initial={{ y: 0 }}
        animate={{ y: isMenuVisible || openTab !== null ? 0 : -32 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="fixed top-0 left-0 right-0 h-7 z-50 bg-white/60 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-black/10 dark:border-white/10 text-[13px] text-slate-900 dark:text-white font-medium select-none flex items-center justify-between px-3 font-sans shadow-md"
      >
        {/* Left Section: Apple, App Name, and Menu Tabs */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Apple Menu */}
          <div className="relative">
            <button
              onClick={() => toggleTab('apple')}
              className={`p-1 px-1.5 rounded-md transition-colors flex items-center justify-center ${
                openTab === 'apple' ? 'bg-black/10 dark:bg-white/25 text-slate-900 dark:text-white' : 'hover:bg-black/5 dark:hover:bg-white/15 text-slate-900 dark:text-white'
              }`}
              title="Apple Menu"
            >
              <Image
                src="/logo.png"
                alt="Aryan Navale"
                width={16}
                height={16}
                className="w-4 h-4 rounded-[3px] object-cover"
              />
            </button>

            {/* Apple Dropdown */}
            <AnimatePresence>
              {openTab === 'apple' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-7 w-60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-black/10 dark:border-white/15 rounded-xl shadow-2xl p-1.5 z-50 text-xs space-y-0.5 text-slate-900 dark:text-white"
                >
                  <div className="px-2 py-1.5 border-b border-black/10 dark:border-white/10">
                    <span className="font-bold text-slate-900 dark:text-white block truncate">
                      {PORTFOLIO_INFO.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-white/60 block truncate">
                      {PORTFOLIO_INFO.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onOpenApp('notes');
                      setOpenTab(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>About This Workstation</span>
                    <Sparkles className="w-3 h-3 opacity-60" />
                  </button>

                  <button
                    onClick={() => {
                      onOpenApp('settings');
                      setOpenTab(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors"
                  >
                    System Settings...
                  </button>

                  <button
                    onClick={() => {
                      onOpenApp('finder');
                      setOpenTab(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors"
                  >
                    App Store & Projects...
                  </button>

                  <div className="my-1 border-t border-black/10 dark:border-white/10" />

                  <button
                    onClick={() => {
                      setShowForceQuitModal(true);
                      setOpenTab(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Force Quit Applications...</span>
                    <span className="text-[10px] opacity-60">⌥⌘Esc</span>
                  </button>

                  <div className="my-1 border-t border-black/10 dark:border-white/10" />

                  <button
                    onClick={() => {
                      setIsLocked(true);
                      setOpenTab(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Lock Screen</span>
                    <Lock className="w-3 h-3 opacity-60" />
                  </button>

                  <button
                    onClick={() => {
                      onTriggerBoot();
                      setOpenTab(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Restart Workstation...</span>
                    <RotateCcw className="w-3 h-3 opacity-60" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Active App Name Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleTab('app')}
              className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                openTab === 'app' ? 'bg-black/10 dark:bg-white/25 text-slate-900 dark:text-white' : 'hover:bg-black/5 dark:hover:bg-white/15 text-slate-900 dark:text-white'
              }`}
            >
              {currentAppName}
            </button>

            <AnimatePresence>
              {openTab === 'app' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-7 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-black/10 dark:border-white/15 rounded-xl shadow-2xl p-1.5 z-50 text-xs space-y-0.5 text-slate-900 dark:text-white"
                >
                  <button
                    onClick={() => {
                      if (activeAppId) onOpenApp(activeAppId);
                      setOpenTab(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors font-semibold"
                  >
                    About {currentAppName}
                  </button>

                  <div className="my-1 border-t border-black/10 dark:border-white/10" />

                  <button
                    onClick={() => {
                      onOpenApp('settings');
                      setOpenTab(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Preferences...</span>
                    <span className="text-[10px] opacity-60">⌘,</span>
                  </button>

                  <div className="my-1 border-t border-black/10 dark:border-white/10" />

                  <button
                    onClick={() => {
                      if (activeAppId && onToggleMinimize) onToggleMinimize(activeAppId);
                      setOpenTab(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Hide {currentAppName}</span>
                    <span className="text-[10px] opacity-60">⌘H</span>
                  </button>

                  <button
                    onClick={() => {
                      if (activeAppId && onCloseWindow) onCloseWindow(activeAppId);
                      setOpenTab(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between text-red-500 dark:text-red-400 hover:text-white"
                  >
                    <span>Quit {currentAppName}</span>
                    <span className="text-[10px] opacity-60">⌘Q</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* File Menu */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => toggleTab('file')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                openTab === 'file' ? 'bg-black/10 dark:bg-white/25 text-slate-900 dark:text-white' : 'opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/15'
              }`}
            >
              File
            </button>

            <AnimatePresence>
              {openTab === 'file' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-7 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-black/10 dark:border-white/15 rounded-xl shadow-2xl p-1.5 z-50 text-xs space-y-0.5 text-slate-900 dark:text-white"
                >
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase">
                    Launch Application
                  </div>
                  <button
                    onClick={() => {
                      onOpenApp('finder');
                      setOpenTab(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Finder (Projects)</span>
                    <Folder className="w-3 h-3 opacity-60" />
                  </button>
                  <button
                    onClick={() => {
                      onOpenApp('terminal');
                      setOpenTab(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Terminal (CLI)</span>
                    <Terminal className="w-3 h-3 opacity-60" />
                  </button>
                  <button
                    onClick={() => {
                      onOpenApp('textedit');
                      setOpenTab(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Document Reader</span>
                    <BookOpen className="w-3 h-3 opacity-60" />
                  </button>

                  <div className="my-1 border-t border-black/10 dark:border-white/10" />

                  <button
                    onClick={() => {
                      if (activeAppId && onCloseWindow) onCloseWindow(activeAppId);
                      setOpenTab(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Close Window</span>
                    <span className="text-[10px] opacity-60">⌘W</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onCloseAllWindows) onCloseAllWindows();
                      setOpenTab(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Close All Windows</span>
                    <span className="text-[10px] opacity-60">⌥⌘W</span>
                  </button>

                  <div className="my-1 border-t border-black/10 dark:border-white/10" />

                  <button
                    onClick={() => {
                      window.print();
                      setOpenTab(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Print Window...</span>
                    <span className="text-[10px] opacity-60">⌘P</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Edit Menu */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => toggleTab('edit')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                openTab === 'edit' ? 'bg-black/10 dark:bg-white/25 text-slate-900 dark:text-white' : 'opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/15'
              }`}
            >
              Edit
            </button>

            <AnimatePresence>
              {openTab === 'edit' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-7 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-black/10 dark:border-white/15 rounded-xl shadow-2xl p-1.5 z-50 text-xs space-y-0.5 text-slate-900 dark:text-white"
                >
                  <button
                    onClick={() => handleCopy(PORTFOLIO_INFO.email, 'Email')}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Copy Developer Email</span>
                  </button>
                  <button
                    onClick={() => handleCopy(PORTFOLIO_INFO.github, 'GitHub URL')}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Copy GitHub Link</span>
                  </button>
                  <button
                    onClick={() => handleCopy(PORTFOLIO_INFO.linkedin, 'LinkedIn URL')}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Copy LinkedIn Link</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View Menu */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => toggleTab('view')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                openTab === 'view' ? 'bg-black/10 dark:bg-white/25 text-slate-900 dark:text-white' : 'opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/15'
              }`}
            >
              View
            </button>

            <AnimatePresence>
              {openTab === 'view' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-7 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-black/10 dark:border-white/15 rounded-xl shadow-2xl p-1.5 z-50 text-xs space-y-0.5 text-slate-900 dark:text-white"
                >
                  <button
                    onClick={() => {
                      toggleTheme();
                      setOpenTab(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Toggle Dark / Light Theme</span>
                    {theme === 'dark' ? <Sun className="w-3 h-3 text-amber-300" /> : <Moon className="w-3 h-3" />}
                  </button>

                  <button
                    onClick={() => {
                      if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen().catch(() => undefined);
                      } else {
                        document.exitFullscreen().catch(() => undefined);
                      }
                      setOpenTab(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Enter Fullscreen</span>
                    <Maximize2 className="w-3 h-3 opacity-60" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Window Menu */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => toggleTab('window')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                openTab === 'window' ? 'bg-black/10 dark:bg-white/25 text-slate-900 dark:text-white' : 'opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/15'
              }`}
            >
              Window
            </button>

            <AnimatePresence>
              {openTab === 'window' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-7 w-60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-black/10 dark:border-white/15 rounded-xl shadow-2xl p-1.5 z-50 text-xs space-y-0.5 text-slate-900 dark:text-white"
                >
                  <button
                    onClick={() => {
                      if (activeAppId && onToggleMinimize) onToggleMinimize(activeAppId);
                      setOpenTab(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Minimize Active Window</span>
                    <span className="text-[10px] opacity-60">⌘M</span>
                  </button>

                  <button
                    onClick={() => {
                      if (activeAppId && onToggleMaximize) onToggleMaximize(activeAppId);
                      setOpenTab(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Zoom / Maximize</span>
                    <Maximize2 className="w-3 h-3 opacity-60" />
                  </button>

                  <div className="my-1 border-t border-black/10 dark:border-white/10" />

                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase">
                    Running Applications
                  </div>

                  {windows.map((win) => (
                    <button
                      key={win.id}
                      onClick={() => {
                        onOpenApp(win.id);
                        setOpenTab(null);
                      }}
                      className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between"
                    >
                      <span className="truncate">{win.title}</span>
                      {activeAppId === win.id && win.isOpen && !win.isMinimized && (
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Help Menu */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => toggleTab('help')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                openTab === 'help' ? 'bg-black/10 dark:bg-white/25 text-slate-900 dark:text-white' : 'opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/15'
              }`}
            >
              Help
            </button>

            <AnimatePresence>
              {openTab === 'help' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-7 w-60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-black/10 dark:border-white/15 rounded-xl shadow-2xl p-1.5 z-50 text-xs space-y-0.5 text-slate-900 dark:text-white"
                >
                  <button
                    onClick={() => {
                      onOpenSpotlight();
                      setOpenTab(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Spotlight Search</span>
                    <span className="text-[10px] opacity-60">⌘K</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowShortcutsModal(true);
                      setOpenTab(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-accent-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Keyboard Shortcuts Guide</span>
                    <HelpCircle className="w-3 h-3 opacity-60" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Section: Status Icons, Control Center & Clock */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Spotlight Search Icon */}
          <button
            onClick={onOpenSpotlight}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/15 transition-colors text-slate-600 dark:text-white/80 hover:text-slate-900 dark:hover:text-white"
            title="Spotlight Search (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Theme Quick Switcher */}
          <button
            onClick={toggleTheme}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/15 transition-colors text-slate-600 dark:text-white/80 hover:text-slate-900 dark:hover:text-white"
            title="Switch Theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Control Center Toggle */}
          <div className="relative">
            <button
              onClick={() => toggleTab('control')}
              className={`p-1 rounded-md transition-colors ${
                openTab === 'control' ? 'bg-black/10 dark:bg-white/25 text-slate-900 dark:text-white' : 'hover:bg-black/5 dark:hover:bg-white/15 text-slate-600 dark:text-white/80 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="macOS Control Center"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* macOS Control Center Widget Panel */}
            <AnimatePresence>
              {openTab === 'control' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -6, x: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -6, x: 10 }}
                  transition={{ duration: 0.15, type: 'spring', stiffness: 350, damping: 25 }}
                  className="absolute right-0 top-8 w-72 bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl border border-black/10 dark:border-white/20 rounded-2xl shadow-2xl p-3 z-50 text-slate-900 dark:text-white space-y-3"
                >
                  {/* Top Grid: Wi-Fi, Bluetooth, AirDrop */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Wi-Fi Tile */}
                    <div className="bg-slate-100 dark:bg-white/5 border border-black/10 dark:border-white/10 p-2 rounded-xl flex items-center gap-2">
                      <button
                        onClick={() => setWifiEnabled(!wifiEnabled)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          wifiEnabled ? 'bg-accent-600 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-white/40'
                        }`}
                      >
                        <Wifi className="w-3.5 h-3.5" />
                      </button>
                      <div className="overflow-hidden">
                        <span className="font-bold text-xs block leading-none">Wi-Fi</span>
                        <span className="text-[10px] text-slate-500 dark:text-white/60 block truncate mt-0.5">
                          {wifiEnabled ? 'Apple_5G_Fiber' : 'Off'}
                        </span>
                      </div>
                    </div>

                    {/* Bluetooth Tile */}
                    <div className="bg-slate-100 dark:bg-white/5 border border-black/10 dark:border-white/10 p-2 rounded-xl flex items-center gap-2">
                      <button
                        onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          bluetoothEnabled ? 'bg-accent-600 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-white/40'
                        }`}
                      >
                        <Bluetooth className="w-3.5 h-3.5" />
                      </button>
                      <div className="overflow-hidden">
                        <span className="font-bold text-xs block leading-none">Bluetooth</span>
                        <span className="text-[10px] text-slate-500 dark:text-white/60 block truncate mt-0.5">
                          {bluetoothEnabled ? 'AirPods Max' : 'Off'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Display Brightness Slider */}
                  <div className="bg-slate-100 dark:bg-white/5 border border-black/10 dark:border-white/10 p-2.5 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-white/80">
                        <Sun className="w-3.5 h-3.5 text-amber-300" /> Display
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-white/60">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-accent-500 h-1.5 bg-slate-300/70 dark:bg-white/20 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Sound Volume Slider */}
                  <div className="bg-slate-100 dark:bg-white/5 border border-black/10 dark:border-white/10 p-2.5 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-white/80">
                        {volume === 0 ? (
                          <VolumeX className="w-3.5 h-3.5 text-red-400" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-accent-400" />
                        )}
                        Sound Volume
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-white/60">{volume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-full accent-accent-500 h-1.5 bg-slate-300/70 dark:bg-white/20 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Now Playing Music Widget */}
                  <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-white/15 p-2.5 rounded-xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/30 flex items-center justify-center shrink-0 border border-white/20">
                        <Music className="w-4 h-4 text-purple-300 animate-pulse" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-bold text-xs block truncate leading-tight">
                          Lofi Deep Work Mix
                        </span>
                        <span className="text-[10px] text-purple-200/70 block truncate">
                          {PORTFOLIO_INFO.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                        className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                      >
                        {isPlayingMusic ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Wifi & Battery Status Icons */}
          <Wifi className="w-3.5 h-3.5 text-slate-600 dark:text-white/80 hidden sm:block" />
          <Battery className="w-3.5 h-3.5 text-slate-600 dark:text-white/80 hidden sm:block" />

          {/* Clock */}
          <span className="font-medium text-[12px] sm:text-[13px] tracking-tight text-slate-700 dark:text-white/90">
            {currentTime || 'Tue Oct 24 10:42 AM'}
          </span>
        </div>
      </motion.header>

      {/* Keyboard Shortcuts Reference Modal */}
      <AnimatePresence>
        {showShortcutsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/20 rounded-2xl p-5 max-w-md w-full shadow-2xl text-slate-900 dark:text-white space-y-4"
            >
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Command className="w-5 h-5 text-accent-400" />
                  <h3 className="font-bold text-base">macOS Keyboard Shortcuts</h3>
                </div>
                <button
                  onClick={() => setShowShortcutsModal(false)}
                  className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-slate-100 dark:bg-white/5 p-2 rounded-lg">
                  <span>Spotlight Global Search</span>
                  <kbd className="bg-slate-200 dark:bg-white/20 px-2 py-0.5 rounded font-mono font-bold">⌘ K</kbd>
                </div>
                <div className="flex justify-between items-center bg-slate-100 dark:bg-white/5 p-2 rounded-lg">
                  <span>Close Focused Window</span>
                  <kbd className="bg-slate-200 dark:bg-white/20 px-2 py-0.5 rounded font-mono font-bold">⌘ W</kbd>
                </div>
                <div className="flex justify-between items-center bg-slate-100 dark:bg-white/5 p-2 rounded-lg">
                  <span>Minimize Focused Window</span>
                  <kbd className="bg-slate-200 dark:bg-white/20 px-2 py-0.5 rounded font-mono font-bold">⌘ M</kbd>
                </div>
                <div className="flex justify-between items-center bg-slate-100 dark:bg-white/5 p-2 rounded-lg">
                  <span>Quit Application</span>
                  <kbd className="bg-slate-200 dark:bg-white/20 px-2 py-0.5 rounded font-mono font-bold">⌘ Q</kbd>
                </div>
                <div className="flex justify-between items-center bg-slate-100 dark:bg-white/5 p-2 rounded-lg">
                  <span>Force Quit Menu</span>
                  <kbd className="bg-slate-200 dark:bg-white/20 px-2 py-0.5 rounded font-mono font-bold">⌥ ⌘ Esc</kbd>
                </div>
              </div>

              <button
                onClick={() => setShowShortcutsModal(false)}
                className="w-full py-2 bg-accent-600 hover:bg-accent-500 font-semibold text-xs rounded-xl transition-colors"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Force Quit Applications Modal */}
      <AnimatePresence>
        {showForceQuitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/20 rounded-2xl p-5 max-w-sm w-full shadow-2xl text-slate-900 dark:text-white space-y-4"
            >
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                <h3 className="font-bold text-base text-red-400">Force Quit Applications</h3>
                <button
                  onClick={() => setShowForceQuitModal(false)}
                  className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-white/70">
                If an application is unresponsive, select it below and click Force Quit.
              </p>

              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {windows.map((win) => (
                  <div
                    key={win.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                  >
                    <span className="text-xs font-semibold">{win.title}</span>
                    {win.isOpen && onCloseWindow && (
                      <button
                        onClick={() => onCloseWindow(win.id)}
                        className="px-2 py-1 text-[10px] bg-red-600/80 hover:bg-red-600 rounded text-white font-bold transition-colors"
                      >
                        Force Quit
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowForceQuitModal(false)}
                className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-semibold text-xs rounded-xl transition-colors"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
