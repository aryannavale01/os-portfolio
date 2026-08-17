'use client';

import React, { useRef, useState } from 'react';
import { AppId, WindowState } from '@/types/mac';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
  MotionValue,
} from 'motion/react';
import { useTheme } from '@/components/context/ThemeContext';
import {
  Folder,
  Terminal,
  Edit3,
  Mail,
  Settings,
  Github,
  Linkedin,
  BookOpen,
  Sparkles,
  Music2,
  Compass,
} from 'lucide-react';

interface DockProps {
  windows: WindowState[];
  activeAppId: AppId | null;
  onOpenApp: (appId: AppId) => void;
  onToggleMinimize: (appId: AppId) => void;
  onNavigateToUrl?: (url: string) => void;
}

interface DockItemConfig {
  id: AppId | 'github' | 'linkedin';
  name: string;
  icon: React.ReactNode;
  bgGradient: string;
  isExternal?: boolean;
  externalUrl?: string;
}

const PINNED_DOCK_ITEMS: DockItemConfig[] = [
  {
    id: 'finder',
    name: 'Finder (Projects)',
    icon: <Folder className="w-4.5 h-4.5 text-white fill-white/20" />,
    bgGradient: 'from-blue-400 to-blue-600',
  },
  {
    id: 'textedit',
    name: 'Document Reader',
    icon: <BookOpen className="w-4.5 h-4.5 text-white" />,
    bgGradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'terminal',
    name: 'Terminal (Skills CLI)',
    icon: <Terminal className="w-4.5 h-4.5 text-emerald-400" />,
    bgGradient: 'from-slate-950 to-black border border-white/20',
  },
  {
    id: 'notes',
    name: 'Notes (About Me)',
    icon: <Edit3 className="w-4.5 h-4.5 text-slate-900" />,
    bgGradient: 'from-yellow-300 to-amber-500',
  },
  {
    id: 'mail',
    name: 'Mail (Contact)',
    icon: <Mail className="w-4.5 h-4.5 text-white" />,
    bgGradient: 'from-sky-400 to-blue-600',
  },
  {
    id: 'settings',
    name: 'System Settings',
    icon: <Settings className="w-4.5 h-4.5 text-slate-800" />,
    bgGradient: 'from-gray-200 to-gray-400',
  },
  {
    id: 'music',
    name: 'Music Player',
    icon: <Music2 className="w-4.5 h-4.5 text-white" />,
    bgGradient: 'from-pink-500 via-rose-500 to-red-600',
  },
  {
    id: 'safari',
    name: 'Safari',
    icon: <Compass className="w-4.5 h-4.5 text-white" />,
    bgGradient: 'from-sky-400 to-blue-600',
  },
];

const EXTERNAL_DOCK_ITEMS: DockItemConfig[] = [
  {
    id: 'askai',
    name: 'Ultron',
    icon: <Sparkles className="w-4.5 h-4.5 text-white" />,
    bgGradient: 'from-blue-500 via-indigo-500 to-purple-600',
  },
  {
    id: 'github',
    name: 'GitHub Profile',
    icon: <Github className="w-4.5 h-4.5 text-white" />,
    bgGradient: 'from-slate-800 to-slate-950 border border-white/10',
    isExternal: true,
    externalUrl: 'https://github.com/aryannavale01',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Profile',
    icon: <Linkedin className="w-4.5 h-4.5 text-white" />,
    bgGradient: 'from-sky-500 to-blue-700',
    isExternal: true,
              externalUrl: 'https://linkedin.com/in/aryan-navale-207961291',
  },
];

function DockIconItem({
  item,
  windows,
  activeAppId,
  mouseX,
  onOpenApp,
  onToggleMinimize,
  onNavigateToUrl,
}: {
  item: DockItemConfig;
  windows: WindowState[];
  activeAppId: AppId | null;
  mouseX: MotionValue<number>;
  onOpenApp: (appId: AppId) => void;
  onToggleMinimize: (appId: AppId) => void;
  onNavigateToUrl?: (url: string) => void;
}) {
  const { dockIconSize } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  const baseSize = dockIconSize === 'small' ? 28 : dockIconSize === 'large' ? 42 : 34;
  const magSize = dockIconSize === 'small' ? 42 : dockIconSize === 'large' ? 62 : 52;

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const sizeSync = useTransform(
    distance,
    [-100, 0, 100],
    [baseSize, magSize, baseSize],
    { clamp: true }
  );
  const size = useSpring(sizeSync, { mass: 0.1, stiffness: 350, damping: 22 });

  const isApp = !item.isExternal;
  const win = isApp ? windows.find((w) => w.id === item.id) : null;
  const isOpen = win ? win.isOpen : false;
  const isFocused = activeAppId === item.id && isOpen && !win?.isMinimized;

  const handleClick = () => {
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 500);

    if (item.isExternal && item.externalUrl) {
      if (onNavigateToUrl) {
        onNavigateToUrl(item.externalUrl);
      } else {
        window.open(item.externalUrl, '_blank');
      }
      return;
    }

    const appId = item.id as AppId;
    if (!win) {
      onOpenApp(appId);
    } else if (win.isMinimized) {
      onToggleMinimize(appId);
    } else if (activeAppId === appId) {
      onToggleMinimize(appId);
    } else {
      onOpenApp(appId);
    }
  };

  return (
    <div
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex flex-col items-center justify-end group pb-0.5"
    >
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: -4, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            className="absolute -top-8 px-2 py-0.5 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white text-[10px] font-medium rounded-md shadow-lg whitespace-nowrap pointer-events-none backdrop-blur-md border border-black/10 dark:border-white/15 z-50"
          >
            {item.name}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dock Icon Box */}
      <motion.button
        onClick={handleClick}
        style={{ width: size, height: size }}
        animate={isBouncing ? { y: [0, -14, 0, -6, 0] } : { y: 0 }}
        transition={
          isBouncing
            ? { duration: 0.5, ease: 'easeOut' }
            : { type: 'spring', stiffness: 350, damping: 22 }
        }
        aria-label={item.name}
        title={item.name}
        className={`rounded-xl bg-gradient-to-b ${item.bgGradient} flex items-center justify-center shadow-md active:scale-90 transition-shadow relative overflow-hidden shrink-0`}
      >
        {/* Icon is decorative — the accessible name lives on the button. */}
        <span aria-hidden="true" className="pointer-events-none flex items-center justify-center">
          {item.icon}
        </span>
      </motion.button>

      {/* Active Indicator Dot */}
      {isOpen && (
        <div
          className={`w-1 h-1 rounded-full mt-1 transition-all ${
            isFocused
              ? 'bg-accent-500 shadow-sm shadow-accent-500/50 scale-110'
              : 'bg-slate-900/40 dark:bg-white/50'
          }`}
        />
      )}
    </div>
  );
}

export function Dock({
  windows,
  activeAppId,
  onOpenApp,
  onToggleMinimize,
  onNavigateToUrl,
}: DockProps) {
  const { dockIconSize } = useTheme();
  const mouseX = useMotionValue(Infinity);

  const dockHeightClass =
    dockIconSize === 'small'
      ? 'h-[40px]'
      : dockIconSize === 'large'
      ? 'h-[58px]'
      : 'h-[48px]';

  return (
    <div className="fixed bottom-2.5 left-0 right-0 z-40 flex justify-center pointer-events-none select-none">
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={`pointer-events-auto ${dockHeightClass} bg-white/40 dark:bg-slate-900/50 backdrop-blur-2xl rounded-[16px] border border-black/10 dark:border-white/10 px-2 flex items-end gap-1.5 shadow-2xl transition-all`}
      >
        {/* Pinned Standard Apps */}
        {PINNED_DOCK_ITEMS.map((item) => (
          <DockIconItem
            key={item.id}
            item={item}
            windows={windows}
            activeAppId={activeAppId}
            mouseX={mouseX}
            onOpenApp={onOpenApp}
            onToggleMinimize={onToggleMinimize}
            onNavigateToUrl={onNavigateToUrl}
          />
        ))}

        {/* External Links Separator */}
        <div className="w-[1px] h-6 bg-white/20 self-center mx-0.5" />

        {/* External Links (GitHub, LinkedIn) */}
        {EXTERNAL_DOCK_ITEMS.map((item) => (
          <DockIconItem
            key={item.id}
            item={item}
            windows={windows}
            activeAppId={activeAppId}
            mouseX={mouseX}
            onOpenApp={onOpenApp}
            onToggleMinimize={onToggleMinimize}
            onNavigateToUrl={onNavigateToUrl}
          />
        ))}
      </motion.div>
    </div>
  );
}
