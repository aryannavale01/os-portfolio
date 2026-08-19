'use client';

import React from 'react';
import {motion} from 'motion/react';
import {PORTFOLIO_INFO} from '@/lib/data';
import {useTheme} from '@/components/context/ThemeContext';
import {RotatingText} from '@/components/RotatingText';

export type IntroStage = 'pending' | 'entering' | 'done';

interface DesktopIntroProps {
  stage: IntroStage;
  playEntrance: boolean;
}

const NAME = PORTFOLIO_INFO.name;

export function DesktopIntro({stage, playEntrance}: DesktopIntroProps) {
  const {wallpaper} = useTheme();
  const isLight = wallpaper === 'glass-light';
  const shown = stage !== 'pending';

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-36 px-4 text-center select-none">
      {/* Name — per-character stagger reveal */}
      <h1 className="text-[clamp(2.75rem,7vw,6rem)] font-extrabold tracking-tight text-center font-display leading-none">
        {NAME.split('').map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            initial={playEntrance ? {y: 40, opacity: 0, filter: 'blur(8px)'} : false}
            animate={
              shown
                ? {y: 0, opacity: 1, filter: 'blur(0px)'}
                : {y: 40, opacity: 0, filter: 'blur(8px)'}
            }
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
              delay: playEntrance ? 0.3 + i * 0.04 : 0,
            }}
            className={
              char === ' '
                ? 'inline-block w-[0.3em]'
                : isLight
                  ? 'inline-block bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent'
                  : 'inline-block bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent drop-shadow-[0_1px_12px_rgba(0,0,0,0.5)]'
            }
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </h1>

      {/* Ambient glow behind the name */}
      {shown && (
        <motion.div
          initial={{opacity: 0, scale: 0.8}}
          animate={{opacity: 1, scale: 1}}
          transition={{duration: 1.2, ease: 'easeOut', delay: playEntrance ? 0.8 : 0}}
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-32 -z-10 pointer-events-none"
        >
          <div className="mx-auto w-[60%] h-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
        </motion.div>
      )}

      {/* Rotating tech roles */}
      <motion.div
        initial={playEntrance ? {opacity: 0, y: 12} : false}
        animate={shown ? {opacity: 1, y: 0} : {opacity: 0, y: 12}}
        transition={{duration: 0.5, ease: 'easeOut', delay: playEntrance ? 1.2 : 0}}
        className="mt-4 h-10 sm:h-12 overflow-hidden"
      >
        <RotatingText
          active={shown}
          centered
          className={`text-[clamp(1.125rem,3.5vw,1.5rem)] font-medium tracking-wide font-tech ${
            isLight ? 'text-on-surface/80' : 'text-on-surface-variant'
          } drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]`}
          caretClassName="bg-current"
        />
      </motion.div>
    </div>
  );
}
