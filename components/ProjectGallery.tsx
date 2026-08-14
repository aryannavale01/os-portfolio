'use client';

import React, { useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { FileItem } from '@/types/mac';
import { ChevronLeft, ChevronRight, Images } from 'lucide-react';

interface ProjectGalleryProps {
  images: FileItem[];
  onOpenImage: (index: number) => void;
}

export function ProjectGallery({ images, onOpenImage }: ProjectGalleryProps) {
  const [index, setIndex] = useState(0);
  const [prevImages, setPrevImages] = useState(images);
  const total = images.length;
  const dragStartX = useRef<number | null>(null);

  // Reset position whenever a different folder's images are loaded.
  if (images !== prevImages) {
    setPrevImages(images);
    setIndex(0);
  }

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(images.length - 1, i + 1));
  }, [images.length]);

  if (total === 0) return null;

  const activeIndex = Math.max(0, Math.min(index, total - 1));
  const active = images[activeIndex];

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Images className="w-4 h-4 text-accent-500" />
        <h3 className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
          Screenshots & Gallery
        </h3>
        <span className="text-[10px] text-slate-400 font-medium">
          {activeIndex + 1} of {total}
        </span>
      </div>

      <div
        className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 shadow-lg group select-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          dragStartX.current = null;
        }}
      >
        <div className="relative w-full aspect-[16/9] cursor-zoom-in" onClick={() => onOpenImage(activeIndex)}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={active?.id}
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -48 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              {active?.imageUrl && (
                <Image
                  src={active.imageUrl}
                  alt={active.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {total > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              disabled={activeIndex === 0}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/75 disabled:opacity-0 transition-opacity"
              title="Previous Image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              disabled={activeIndex >= total - 1}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/75 disabled:opacity-0 transition-opacity"
              title="Next Image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Dots */}
        {total > 1 && (
          <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIndex
                    ? 'w-5 bg-white'
                    : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
                title={img.name}
              />
            ))}
          </div>
        )}

        <span className="absolute bottom-2.5 right-2.5 text-[9px] font-semibold text-white/80 bg-black/50 px-1.5 py-0.5 rounded">
          Click to Quick Look
        </span>
      </div>
    </div>
  );
}
