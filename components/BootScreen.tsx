'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { PORTFOLIO_INFO } from '@/lib/data';

interface BootScreenProps {
  onBootComplete?: () => void;
}

export function BootScreen({ onBootComplete }: BootScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const completedRef = useRef(false);

  const complete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsVisible(false);
    onBootComplete?.();
  }, [onBootComplete]);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(100, prev + 12);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (progress < 100) return;
    const t = setTimeout(complete, 300);
    return () => clearTimeout(t);
  }, [progress, complete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] bg-surface-container-lowest text-on-surface flex flex-col items-center justify-center select-none font-sans"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-3 mb-10"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-2xl backdrop-blur-md overflow-hidden">
              <Image
                src="/logo.png"
                alt={PORTFOLIO_INFO.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="text-center space-y-0.5">
              <h1 className="text-lg font-bold tracking-tight text-white">
                AN OS
              </h1>
              <p className="text-xs text-on-surface-variant font-mono">
                {PORTFOLIO_INFO.role} • v2.6
              </p>
            </div>
          </motion.div>

          {/* Progress Bar Container */}
          <div className="w-56 h-1.5 bg-surface-container-high rounded-full overflow-hidden shadow-inner border border-white/10">
            <motion.div
              className="h-full bg-secondary rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>

          <p className="mt-4 text-[11px] text-on-surface-variant/60 font-mono">
            {progress < 40
              ? 'Initializing AN OS...'
              : progress < 80
              ? 'Loading Portfolio Applications...'
              : 'Launching macOS Desktop...'}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
