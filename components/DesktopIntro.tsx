'use client';

import React from 'react';
import { motion } from 'motion/react';
import { PORTFOLIO_INFO } from '@/lib/data';
import { useTheme } from '@/components/context/ThemeContext';
import { RotatingText } from '@/components/RotatingText';

export type IntroStage = 'pending' | 'entering' | 'done';

interface DesktopIntroProps {
  stage: IntroStage;
  playEntrance: boolean;
}

export function DesktopIntro({ stage, playEntrance }: DesktopIntroProps) {
  const { wallpaper } = useTheme();
  const isLight = wallpaper === 'glass-light';
  const shown = stage !== 'pending';

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-36 px-4 text-center select-none">
      <motion.h1
        initial={playEntrance ? { y: 28, opacity: 0 } : false}
        animate={shown ? { y: 0, opacity: 1 } : { y: 28, opacity: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: playEntrance ? 0.4 : 0 }}
        className={`text-[clamp(2.75rem,7vw,6rem)] font-bold tracking-tight text-center text-on-surface drop-shadow-[0_1px_12px_rgba(0,0,0,0.5)]`}
      >
        {PORTFOLIO_INFO.name}
      </motion.h1>

      <motion.div
        initial={playEntrance ? { opacity: 0 } : false}
        animate={{ opacity: shown ? 1 : 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: playEntrance ? 1.0 : 0 }}
        className="mt-3 h-10 sm:h-12 overflow-hidden"
      >
        <RotatingText
          active={shown}
          centered
          className={`text-[clamp(1.125rem,3.5vw,1.5rem)] font-medium tracking-wide ${
            isLight ? 'text-on-surface' : 'text-on-surface-variant'
          } drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]`}
          caretClassName="bg-current"
        />
      </motion.div>
    </div>
  );
}
