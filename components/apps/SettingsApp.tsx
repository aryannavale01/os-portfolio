'use client';

import React, { useState, memo } from 'react';
import Image from 'next/image';
import { useTheme } from '@/components/context/ThemeContext';
import { AccentColor } from '@/types/mac';
import { WALLPAPERS } from '@/lib/wallpapers';
import { PORTFOLIO_INFO } from '@/lib/data';
import {
  Sun,
  Moon,
  Monitor,
  Palette,
  Laptop,
  Check,
  Sparkles,
  Volume2,
  VolumeX,
  Lock,
  LayoutGrid,
  Sliders,
  Cpu,
  Info,
  HardDrive,
  ShieldCheck,
  Zap,
} from 'lucide-react';

type SettingsTab = 'appearance' | 'layout' | 'sound' | 'about';

export const SettingsApp = memo(function SettingsApp() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

  const {
    theme,
    setTheme,
    wallpaper,
    setWallpaper,
    accentColor,
    setAccentColor,
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
  } = useTheme();

  const sidebarWidthClass =
    sidebarWidth === 'compact' ? 'w-48' : sidebarWidth === 'wide' ? 'w-72' : 'w-64';
  const sidebarIconClass =
    sidebarIconSize === 'small' ? 'w-3.5 h-3.5' : sidebarIconSize === 'large' ? 'w-5 h-5' : 'w-4 h-4';

  const accentsList: { id: AccentColor; name: string; bg: string }[] = [
    { id: 'blue', name: 'System Blue', bg: 'bg-blue-500' },
    { id: 'purple', name: 'Royal Purple', bg: 'bg-purple-500' },
    { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-500' },
    { id: 'orange', name: 'Amber Orange', bg: 'bg-amber-500' },
  ];

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'appearance', label: 'Appearance & Wallpaper', icon: Palette },
    { id: 'layout', label: 'Icons & Layout', icon: LayoutGrid },
    { id: 'sound', label: 'Sound & Audio', icon: Volume2 },
    { id: 'about', label: 'About & Hardware', icon: Info },
  ];

  return (
    <div className="flex flex-col md:flex-row h-full w-full select-none bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
      {/* Mobile Top Navigation Bar (Shown on small screens) */}
      <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/80 p-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-500" />
          <span className="font-bold text-xs">System Settings</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-medium overflow-x-auto max-w-[220px] sm:max-w-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-accent-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setIsLocked(true)}
            className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            title="Lock Workstation"
          >
            <Lock className="w-3.5 h-3.5 text-amber-500" />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar (Hidden on mobile) */}
      <div className={`hidden md:flex ${sidebarWidthClass} border-r border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/40 p-3 flex-col gap-3 text-xs shrink-0`}>
        <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          System Preferences
        </div>

        <div className="space-y-1 flex-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left font-medium transition-all ${
                  isActive
                    ? 'bg-accent-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`${sidebarIconClass} shrink-0 ${isActive ? 'text-white' : 'text-accent-500'}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}

          <div className="pt-2 my-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setIsLocked(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left font-medium text-slate-700 dark:text-slate-300 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Lock Screen</span>
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
          <span>macOS Sonoma</span>
          <span>v15.2</span>
        </div>
      </div>

      {/* Main Settings Panel */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 space-y-6">
        {/* TAB 1: APPEARANCE & WALLPAPER */}
        {activeTab === 'appearance' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-500" /> Appearance Mode
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Select your preferred theme palette for windows, dialogs, and navigation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                    theme === 'dark'
                      ? 'border-accent-500 bg-accent-500/10 text-accent-500 ring-1 ring-accent-500/30 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center shrink-0 border border-slate-800">
                    <Moon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold block text-slate-900 dark:text-slate-100">
                      Dark Theme
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      High-contrast dark obsidian canvas
                    </span>
                  </div>
                  {theme === 'dark' && <Check className="w-4 h-4 text-accent-500 ml-auto" />}
                </button>

                <button
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                    theme === 'light'
                      ? 'border-accent-500 bg-accent-500/10 text-accent-500 ring-1 ring-accent-500/30 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-300">
                    <Sun className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold block text-slate-900 dark:text-slate-100">
                      Light Theme
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Clean frosted white layout
                    </span>
                  </div>
                  {theme === 'light' && <Check className="w-4 h-4 text-accent-500 ml-auto" />}
                </button>
              </div>
            </div>

            {/* Accent Color Section */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                Accent Color
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Used for selection highlights, active buttons, and focus indicators.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg">
                {accentsList.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => setAccentColor(acc.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      accentColor === acc.id
                        ? 'border-accent-500 bg-accent-500/10 text-slate-900 dark:text-slate-100 shadow-xs ring-1 ring-accent-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 bg-white/50 dark:bg-slate-900/30'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full ${acc.bg} shrink-0`} />
                    <span className="truncate">{acc.name}</span>
                    {accentColor === acc.id && (
                      <Check className="w-3.5 h-3.5 text-accent-500 ml-auto shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Wallpaper Picker */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" /> Desktop Wallpaper
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Choose a dynamic gradient theme for your desktop workspace.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {WALLPAPERS.map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => setWallpaper(wp.id)}
                    className={`group relative h-24 rounded-xl overflow-hidden border-2 transition-all shadow-xs ${
                      wallpaper === wp.id
                        ? 'border-accent-500 ring-2 ring-accent-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                    }`}
                  >
                    {wp.type === 'image' && wp.imagePath ? (
                      <>
                        <Image
                          src={wp.imagePath}
                          alt={wp.title}
                          fill
                          sizes="(max-width: 1024px) 50vw, 25vw"
                          className="object-cover"
                        />
                        {wp.scrim && (
                          <div className={`absolute inset-0 ${wp.scrim}`} />
                        )}
                      </>
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${wp.gradient}`} />
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-end p-2.5">
                      <span className="text-xs font-semibold text-white drop-shadow">
                        {wp.title}
                      </span>
                    </div>
                    {wallpaper === wp.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-accent-500 text-white rounded-full flex items-center justify-center shadow-md">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ICONS & LAYOUT */}
        {activeTab === 'layout' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-blue-500" /> Desktop & Dock Sizing
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Customize icon sizes, dock height, and sidebar widths for your optimal screen density.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Dock Icon Size */}
                <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 dark:text-slate-200">
                      Dock Icon Size
                    </label>
                    <span className="text-[11px] text-accent-500 font-semibold uppercase">
                      {dockIconSize}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {(['small', 'medium', 'large'] as const).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setDockIconSize(sz)}
                        className={`flex-1 py-1.5 rounded-md capitalize font-medium transition-all ${
                          dockIconSize === sz
                            ? 'bg-accent-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Desktop Icon Size */}
                <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 dark:text-slate-200">
                      Desktop Icon Size
                    </label>
                    <span className="text-[11px] text-accent-500 font-semibold uppercase">
                      {desktopIconSize}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {(['small', 'medium', 'large'] as const).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setDesktopIconSize(sz)}
                        className={`flex-1 py-1.5 rounded-md capitalize font-medium transition-all ${
                          desktopIconSize === sz
                            ? 'bg-accent-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sidebar Icon Size */}
                <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 dark:text-slate-200">
                      Sidebar Icon Size
                    </label>
                    <span className="text-[11px] text-accent-500 font-semibold uppercase">
                      {sidebarIconSize}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {(['small', 'medium', 'large'] as const).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSidebarIconSize(sz)}
                        className={`flex-1 py-1.5 rounded-md capitalize font-medium transition-all ${
                          sidebarIconSize === sz
                            ? 'bg-accent-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sidebar Width */}
                <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 dark:text-slate-200">
                      Sidebar Width & Layout
                    </label>
                    <span className="text-[11px] text-accent-500 font-semibold uppercase">
                      {sidebarWidth}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {(['compact', 'standard', 'wide'] as const).map((w) => (
                      <button
                        key={w}
                        onClick={() => setSidebarWidth(w)}
                        className={`flex-1 py-1.5 rounded-md capitalize font-medium transition-all ${
                          sidebarWidth === w
                            ? 'bg-accent-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SOUND & AUDIO */}
        {activeTab === 'sound' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-500" /> System Audio & Sound FX
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Configure user interface acoustic feedback and system sound alerts.
              </p>

              <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    soundEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {soundEnabled ? (
                      <Volume2 className="w-5 h-5" />
                    ) : (
                      <VolumeX className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">
                      UI Action Chimes & Click Feedback
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Plays subtle audio ticks when clicking windows, launching apps, or minimizing.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
                    soundEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-100/60 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> Connected Output Device
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                <span>Active Device: AirPods Max (Spatial Audio)</span>
                <span className="text-emerald-500 font-semibold">Lossless 24-bit</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ABOUT & HARDWARE */}
        {activeTab === 'about' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-blue-500" /> About Workstation
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Hardware specification overview and developer environment status.
              </p>

              {/* Specs Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
                <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <Cpu className="w-6 h-6 text-indigo-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Processor
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {PORTFOLIO_INFO.systemSpecs.chip}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Unified Memory
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {PORTFOLIO_INFO.systemSpecs.memory}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <HardDrive className="w-6 h-6 text-sky-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Flash Storage
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {PORTFOLIO_INFO.systemSpecs.storage}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <Laptop className="w-6 h-6 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Operating System
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {PORTFOLIO_INFO.systemSpecs.os}
                    </span>
                  </div>
                </div>
              </div>

              {/* Developer Profile Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-white/20 border border-white/30 overflow-hidden shrink-0">
                    <Image
                      src="/logo.png"
                      alt={PORTFOLIO_INFO.name}
                      width={44}
                      height={44}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{PORTFOLIO_INFO.name}</h3>
                    <p className="text-xs text-blue-100">{PORTFOLIO_INFO.role}</p>
                    <p className="text-[11px] text-blue-200 mt-1">
                      {PORTFOLIO_INFO.location} • {PORTFOLIO_INFO.status}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsLocked(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-semibold text-white transition-colors flex items-center gap-1.5 self-end sm:self-auto"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  Lock Workstation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

