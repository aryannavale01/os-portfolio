'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { FileItem } from '@/types/mac';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface QuickLookProps {
  images: FileItem[];
  initialIndex: number;
  onClose: () => void;
}

export function QuickLook({ images, initialIndex, onClose }: QuickLookProps) {
  const [index, setIndex] = useState(initialIndex);
  const total = images.length;
  const active = images[Math.max(0, Math.min(index, total - 1))];

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(images.length - 1, i + 1));
  }, [images.length]);

  // Keep Desktop's Escape handler from closing the host window while open.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('os:overlay-change', { detail: true }));
    return () => {
      window.dispatchEvent(new CustomEvent('os:overlay-change', { detail: false }));
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goNext, goPrev, onClose]);

  if (total === 0) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex flex-col font-sans select-none animate-in fade-in duration-150"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 h-12 shrink-0 text-white">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold truncate">{active?.name}</span>
          <span className="text-[11px] text-slate-400 shrink-0">
            {Math.max(0, Math.min(index, total - 1)) + 1} of {total}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          title="Close Quick Look (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Image Stage */}
      <div
        className="flex-1 relative overflow-hidden flex items-center justify-center px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={active?.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative w-full h-full"
          >
            {active?.imageUrl && (
              <Image
                src={active.imageUrl}
                alt={active.name}
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />
            )}
          </motion.div>
        </AnimatePresence>

        {total > 1 && (
          <>
            <button
              onClick={goPrev}
              disabled={Math.max(0, Math.min(index, total - 1)) === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white disabled:opacity-25 disabled:hover:bg-white/10 transition-colors"
              title="Previous (←)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goNext}
              disabled={Math.max(0, Math.min(index, total - 1)) === total - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white disabled:opacity-25 disabled:hover:bg-white/10 transition-colors"
              title="Next (→)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-3 shrink-0">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === Math.max(0, Math.min(index, total - 1))
                  ? 'w-5 bg-white'
                  : 'w-1.5 bg-white/30 hover:bg-white/60'
              }`}
              title={img.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
