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

// Bump when stored payload shape changes. v1 payloads persisted the old
// 'sonoma-purple' default as a real value, so on first v2 load we drop the
// wallpaper field (falls back to the new 'workstation' default) while keeping
// every other preference intact.
const SETTINGS_SCHEMA_VERSION = 2;

const DEFAULT_VALUES = {
  theme: 'dark' as ThemeMode,
  wallpaper: 'workstation' as WallpaperPreset,
  accentColor: 'blue' as AccentColor,
  isLocked: false as boolean,
  soundEnabled: true as boolean,
  dockIconSize: 'medium' as IconSize,
  desktopIconSize: 'medium' as IconSize,
  sidebarIconSize: 'medium' as IconSize,
  sidebarWidth: 'standard' as SidebarWidth,
};

type PersistedSettings = Partial<typeof DEFAULT_VALUES> & { __v?: number };

function loadSettings(): PersistedSettings {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      const settings = parsed as PersistedSettings;
      if (settings.__v !== SETTINGS_SCHEMA_VERSION) {
        // Legacy (v1) payload — reset the wallpaper to the new default but
        // preserve the user's other preferences.
        delete (settings as { wallpaper?: unknown }).wallpaper;
      }
      return settings;
    }
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
          __v: SETTINGS_SCHEMA_VERSION,
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
