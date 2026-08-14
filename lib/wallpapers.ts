import { WallpaperPreset } from '@/types/mac';

export interface WallpaperConfig {
  id: WallpaperPreset;
  title: string;
  type: 'image' | 'gradient';
  imagePath?: string;
  gradient?: string;
  scrim?: string;
}

export const WALLPAPERS: WallpaperConfig[] = [
  {
    id: 'workstation',
    title: 'Dev Workstation',
    type: 'image',
    imagePath: '/wallpapers/default-workstation.jpg',
    scrim: 'bg-gradient-to-t from-black/40 via-black/5 to-black/15',
  },
  {
    id: 'sonoma-purple',
    title: 'Sonoma Purple',
    type: 'gradient',
    gradient: 'from-slate-950 via-purple-950 to-indigo-950',
  },
  {
    id: 'sequoia-dusk',
    title: 'Sequoia Dusk',
    type: 'gradient',
    gradient: 'from-slate-950 via-amber-950 to-indigo-950',
  },
  {
    id: 'cyber-navy',
    title: 'Cyber Deep Navy',
    type: 'gradient',
    gradient: 'from-slate-950 via-cyan-950 to-blue-950',
  },
  {
    id: 'glass-light',
    title: 'macOS Light Glass',
    type: 'gradient',
    gradient: 'from-slate-100 via-sky-100 to-indigo-100',
  },
];

export const DEFAULT_WALLPAPER: WallpaperPreset = 'workstation';

export function getWallpaperConfig(id: WallpaperPreset): WallpaperConfig {
  return WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0];
}
