'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeMode, WallpaperPreset, AccentColor } from '@/types/mac';

export type IconSize = 'small' | 'medium' | 'large';
export type SidebarWidth = 'compact' | 'standard' | 'wide';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  wallpaper: WallpaperPreset;
  setWallpaper: (wallpaper: WallpaperPreset) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  dockIconSize: IconSize;
  setDockIconSize: (size: IconSize) => void;
  desktopIconSize: IconSize;
  setDesktopIconSize: (size: IconSize) => void;
  sidebarIconSize: IconSize;
  setSidebarIconSize: (size: IconSize) => void;
  sidebarWidth: SidebarWidth;
  setSidebarWidth: (width: SidebarWidth) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'macos_portfolio_settings_v1';

const DEFAULT_VALUES = {
  theme: 'dark' as ThemeMode,
  wallpaper: 'sonoma-purple' as WallpaperPreset,
  accentColor: 'blue' as AccentColor,
  isLocked: false as boolean,
  soundEnabled: true as boolean,
  dockIconSize: 'medium' as IconSize,
  desktopIconSize: 'medium' as IconSize,
  sidebarIconSize: 'medium' as IconSize,
  sidebarWidth: 'standard' as SidebarWidth,
};

function loadSettings(): Partial<typeof DEFAULT_VALUES> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as Partial<typeof DEFAULT_VALUES>;
    return {};
  } catch (err) {
    console.error('Failed to load appearance settings:', err);
    return {};
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [savedSettings] = useState(loadSettings);

  const [theme, setThemeState] = useState<ThemeMode>(
    savedSettings.theme ?? DEFAULT_VALUES.theme
  );
  const [wallpaper, setWallpaper] = useState<WallpaperPreset>(
    savedSettings.wallpaper ?? DEFAULT_VALUES.wallpaper
  );
  const [accentColor, setAccentColor] = useState<AccentColor>(
    savedSettings.accentColor ?? DEFAULT_VALUES.accentColor
  );
  const [isLocked, setIsLocked] = useState<boolean>(
    savedSettings.isLocked ?? DEFAULT_VALUES.isLocked
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    savedSettings.soundEnabled ?? DEFAULT_VALUES.soundEnabled
  );

  // Icon & Sidebar Settings
  const [dockIconSize, setDockIconSize] = useState<IconSize>(
    savedSettings.dockIconSize ?? DEFAULT_VALUES.dockIconSize
  );
  const [desktopIconSize, setDesktopIconSize] = useState<IconSize>(
    savedSettings.desktopIconSize ?? DEFAULT_VALUES.desktopIconSize
  );
  const [sidebarIconSize, setSidebarIconSize] = useState<IconSize>(
    savedSettings.sidebarIconSize ?? DEFAULT_VALUES.sidebarIconSize
  );
  const [sidebarWidth, setSidebarWidth] = useState<SidebarWidth>(
    savedSettings.sidebarWidth ?? DEFAULT_VALUES.sidebarWidth
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.accent = accentColor;
  }, [accentColor]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          theme,
          wallpaper,
          accentColor,
          isLocked,
          soundEnabled,
          dockIconSize,
          desktopIconSize,
          sidebarIconSize,
          sidebarWidth,
        })
      );
    } catch (err) {
      console.error('Failed to save appearance settings:', err);
    }
  }, [
    theme,
    wallpaper,
    accentColor,
    isLocked,
    soundEnabled,
    dockIconSize,
    desktopIconSize,
    sidebarIconSize,
    sidebarWidth,
  ]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        wallpaper,
        setWallpaper,
        accentColor,
        setAccentColor,
        isLocked,
        setIsLocked,
        soundEnabled,
        setSoundEnabled,
        dockIconSize,
        setDockIconSize,
        desktopIconSize,
        setDesktopIconSize,
        sidebarIconSize,
        setSidebarIconSize,
        sidebarWidth,
        setSidebarWidth,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
