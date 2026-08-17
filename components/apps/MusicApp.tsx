'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Shuffle,
  Repeat,
  Repeat1,
  ListMusic,
  Music,
  Heart,
  ChevronLeft,
} from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
  color: string;
}

const TRACKS: Track[] = [
  {
    id: 't1',
    title: 'Aaye Ho Meri Zindagi Mein',
    artist: 'Udit Narayan',
    src: '/media_songs/Aaye Ho Meri Zindagi Mein (Male) - Udit Narayan (128k).mp3',
    color: 'from-rose-600 to-purple-700',
  },
  {
    id: 't2',
    title: 'Agar Tum Na Hote',
    artist: 'R. D. Burman',
    src: '/media_songs/Agar Tum Na Hote (Male Version) - R. D. Burman - Topic (128k).mp3',
    color: 'from-blue-600 to-cyan-600',
  },
  {
    id: 't3',
    title: 'Jeeta Tha Jiske Liye',
    artist: 'Kumar Sanu',
    src: '/media_songs/Jeeta Tha Jiske Liye - The Kumar Sanu Official (128k).mp3',
    color: 'from-emerald-600 to-teal-600',
  },
  {
    id: 't4',
    title: 'Mujhse Mohabbat Ka',
    artist: 'Kumar Sanu',
    src: '/media_songs/Mujhse Mohabbat Ka - The Kumar Sanu Official (128k).mp3',
    color: 'from-amber-600 to-orange-600',
  },
  {
    id: 't5',
    title: 'Tumse Milne Ko Dil',
    artist: 'Alka Yagnik',
    src: '/media_songs/Tumse Milne Ko Dil (Jhankar) - Alka Yagnik (128k).mp3',
    color: 'from-fuchsia-600 to-pink-600',
  },
];

type RepeatMode = 'off' | 'all' | 'one';

function formatTime(sec: number): string {
  if (!sec || !isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const MusicApp = memo(function MusicApp() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [showList, setShowList] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const track = TRACKS[currentIdx];

  // Init audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onTimeUpdate = () => {
      if (!isDragging) setCurrentTime(audio.currentTime);
    };
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => handleTrackEnd();
    const onError = () => {
      console.error('Audio error:', audio.error);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load track when index changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = track.src;
    audio.load();
    setCurrentTime(0);
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, track.src]);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTrackEnd = useCallback(() => {
    if (repeat === 'one') {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
      return;
    }
    if (shuffle) {
      let next: number;
      do {
        next = Math.floor(Math.random() * TRACKS.length);
      } while (next === currentIdx && TRACKS.length > 1);
      setCurrentIdx(next);
    } else if (currentIdx < TRACKS.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else if (repeat === 'all') {
      setCurrentIdx(0);
    } else {
      setIsPlaying(false);
    }
  }, [repeat, shuffle, currentIdx]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const playTrack = useCallback(
    (idx: number) => {
      setCurrentIdx(idx);
      setIsPlaying(true);
      setTimeout(() => {
        audioRef.current?.play().catch(() => setIsPlaying(false));
      }, 100);
    },
    []
  );

  const playNext = useCallback(() => {
    if (shuffle) {
      let next: number;
      do {
        next = Math.floor(Math.random() * TRACKS.length);
      } while (next === currentIdx && TRACKS.length > 1);
      setCurrentIdx(next);
    } else {
      setCurrentIdx((i) => (i + 1) % TRACKS.length);
    }
    setIsPlaying(true);
  }, [shuffle, currentIdx]);

  const playPrev = useCallback(() => {
    if (currentTime > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    setCurrentIdx((i) => (i - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  }, [currentTime]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) audioRef.current.currentTime = val;
  }, []);

  const toggleLike = useCallback((id: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeat((r) => {
      if (r === 'off') return 'all';
      if (r === 'all') return 'one';
      return 'off';
    });
  }, []);

  const volIcon =
    isMuted || volume === 0 ? (
      <VolumeX className="w-3.5 h-3.5" />
    ) : volume < 0.5 ? (
      <Volume1 className="w-3.5 h-3.5" />
    ) : (
      <Volume2 className="w-3.5 h-3.5" />
    );

  return (
    <div className="flex h-full w-full bg-slate-950 text-white overflow-hidden font-sans select-none">
      {/* Sidebar: Playlist */}
      <AnimatePresence>
        {showList && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full border-r border-white/10 bg-slate-900/60 flex flex-col overflow-hidden shrink-0"
          >
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <ListMusic className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Playlist
                </span>
              </div>
              <div className="text-[10px] text-slate-500">
                {TRACKS.length} songs
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
              {TRACKS.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => playTrack(idx)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all group ${
                    idx === currentIdx
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-md bg-gradient-to-br ${t.color} flex items-center justify-center shrink-0 shadow-md`}
                  >
                    {idx === currentIdx && isPlaying ? (
                      <div className="flex items-center gap-[2px]">
                        <motion.div
                          animate={{ scaleY: [0.4, 1, 0.6, 1, 0.4] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="w-[2px] h-3 bg-white rounded-full origin-bottom"
                        />
                        <motion.div
                          animate={{ scaleY: [1, 0.4, 1, 0.6, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="w-[2px] h-3 bg-white rounded-full origin-bottom"
                        />
                        <motion.div
                          animate={{ scaleY: [0.6, 1, 0.4, 1, 0.6] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="w-[2px] h-3 bg-white rounded-full origin-bottom"
                        />
                      </div>
                    ) : (
                      <Music className="w-3.5 h-3.5 text-white/80" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-xs font-semibold truncate ${
                        idx === currentIdx ? 'text-white' : ''
                      }`}
                    >
                      {t.title}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {t.artist}
                    </div>
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(t.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        toggleLike(t.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        liked.has(t.id)
                          ? 'fill-rose-500 text-rose-500'
                          : 'text-slate-500 hover:text-rose-400'
                      }`}
                    />
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main: Now Playing */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="h-10 px-3 flex items-center justify-between border-b border-white/10 bg-slate-900/40 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowList(!showList)}
              className={`p-1.5 rounded-md transition-colors ${
                showList
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Toggle Playlist"
            >
              {showList ? (
                <ChevronLeft className="w-3.5 h-3.5" />
              ) : (
                <ListMusic className="w-3.5 h-3.5" />
              )}
            </button>
            <div className="h-4 w-[1px] bg-white/10" />
            <span className="text-[11px] font-semibold text-slate-300">
              Now Playing
            </span>
          </div>
          <span className="text-[10px] text-slate-500">
            {currentIdx + 1} / {TRACKS.length}
          </span>
        </div>

        {/* Center: Album Art + Track Info */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0 gap-6">
          {/* Album Art */}
          <motion.div
            key={track.id}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative"
          >
            <div
              className={`w-44 h-44 sm:w-52 sm:h-52 rounded-2xl bg-gradient-to-br ${track.color} shadow-2xl flex items-center justify-center relative overflow-hidden`}
            >
              {/* Animated rings when playing */}
              {isPlaying && (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 rounded-2xl border-2 border-white/20"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0, 0.15] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    className="absolute inset-2 rounded-xl border border-white/15"
                  />
                </>
              )}
              <Music className="w-16 h-16 text-white/40" />
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            {/* Shadow */}
            <div
              className={`absolute -bottom-4 left-4 right-4 h-8 rounded-2xl bg-gradient-to-b ${track.color} blur-2xl opacity-30`}
            />
          </motion.div>

          {/* Track Info */}
          <div className="text-center max-w-sm">
            <motion.h2
              key={track.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-bold text-white truncate"
            >
              {track.title}
            </motion.h2>
            <p className="text-xs text-slate-400 mt-0.5">{track.artist}</p>
          </div>
        </div>

        {/* Bottom: Player Controls */}
        <div className="px-4 sm:px-6 pb-5 pt-2">
          {/* Progress Bar */}
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-[10px] font-mono text-slate-500 w-8 text-right tabular-nums">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 group relative">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                className="w-full h-1.5 appearance-none bg-white/15 rounded-full cursor-pointer accent-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:opacity-0 [&::-webkit-slider-thumb]:group-hover:opacity-100 [&::-webkit-slider-thumb]:transition-opacity"
                style={{
                  background: duration
                    ? `linear-gradient(to right, rgba(255,255,255,0.9) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.15) ${(currentTime / duration) * 100}%)`
                    : undefined,
                }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-500 w-8 tabular-nums">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            {/* Left: Shuffle + Repeat */}
            <div className="flex items-center gap-1 w-24">
              <button
                onClick={() => setShuffle(!shuffle)}
                className={`p-1.5 rounded-full transition-colors ${
                  shuffle
                    ? 'text-indigo-400'
                    : 'text-slate-500 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={cycleRepeat}
                className={`p-1.5 rounded-full transition-colors relative ${
                  repeat !== 'off'
                    ? 'text-indigo-400'
                    : 'text-slate-500 hover:text-white'
                }`}
                title={`Repeat: ${repeat}`}
              >
                {repeat === 'one' ? (
                  <Repeat1 className="w-3.5 h-3.5" />
                ) : (
                  <Repeat className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Center: Prev / Play / Next */}
            <div className="flex items-center gap-3">
              <button
                onClick={playPrev}
                className="p-1.5 text-slate-300 hover:text-white transition-colors"
                title="Previous"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-slate-900 hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-white/10"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={playNext}
                className="p-1.5 text-slate-300 hover:text-white transition-colors"
                title="Next"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>

            {/* Right: Volume + Like */}
            <div className="flex items-center gap-1.5 w-24 justify-end">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
              >
                {volIcon}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  setIsMuted(false);
                }}
                className="w-16 h-1 appearance-none bg-white/15 rounded-full cursor-pointer accent-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                style={{
                  background: `linear-gradient(to right, rgba(255,255,255,0.8) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.15) ${(isMuted ? 0 : volume) * 100}%)`,
                }}
                title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />
              <button
                onClick={() => toggleLike(track.id)}
                className="p-1.5 transition-colors"
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    liked.has(track.id)
                      ? 'fill-rose-500 text-rose-500'
                      : 'text-slate-500 hover:text-rose-400'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
