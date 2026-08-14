'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type CycleStyle = 'typewriter' | 'slide';

// Toggle between the two rotation styles without touching layout code.
export const CYCLE_STYLE: CycleStyle = 'slide';

export const INTRO_ROLES = [
  'AI/ML Engineer',
  'Full-Stack Developer',
  'RAG & Agent Builder',
  'Final-Year AI & DS Student',
];

const SLIDE_INTERVAL_MS = 2600;

// Typewriter effect: types in, holds, deletes out, then advances to the next
// phrase via onComplete. All state updates happen inside scheduled callbacks.
function useTypewriter(text: string, active: boolean, onComplete: () => void) {
  const [display, setDisplay] = useState(active ? '' : text);
  const [showCaret, setShowCaret] = useState(true);

  useEffect(() => {
    if (!active) return;
    let i = 0;
    let timer: number | undefined;

    const schedule = (fn: () => void, ms: number) => {
      timer = window.setTimeout(fn, ms);
    };

    const deleteTick = () => {
      i -= 1;
      setDisplay(text.slice(0, i));
      if (i <= 0) {
        onComplete();
        return;
      }
      schedule(deleteTick, 32);
    };

    const typeTick = () => {
      i += 1;
      setDisplay(text.slice(0, i));
      if (i >= text.length) {
        schedule(deleteTick, 1500); // hold the fully typed phrase briefly
      } else {
        schedule(typeTick, 55);
      }
    };

    // Clear stale text, then begin typing after a short pause.
    schedule(() => {
      setDisplay('');
      schedule(typeTick, 350);
    }, 50);

    return () => window.clearTimeout(timer);
  }, [text, active, onComplete]);

  // Blinking caret — only while actively typing.
  useEffect(() => {
    if (!active) return;
    const iv = window.setInterval(() => setShowCaret((c) => !c), 500);
    return () => window.clearInterval(iv);
  }, [active]);

  return { display, showCaret };
}

interface RotatingTextProps {
  active?: boolean;
  className?: string;
  caretClassName?: string;
  centered?: boolean;
}

export function RotatingText({
  active = true,
  className = '',
  caretClassName = '',
  centered = false,
}: RotatingTextProps) {
  const [index, setIndex] = useState(0);

  const advance = useCallback(() => setIndex((i) => (i + 1) % INTRO_ROLES.length), []);

  // Slide mode: advance on a fixed interval.
  useEffect(() => {
    if (!active || CYCLE_STYLE !== 'slide') return;
    const iv = window.setInterval(advance, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(iv);
  }, [active, advance]);

  const typing = active && CYCLE_STYLE === 'typewriter';
  const { display, showCaret } = useTypewriter(INTRO_ROLES[index], typing, advance);

  if (CYCLE_STYLE === 'typewriter') {
    return (
      <span className={`block ${centered ? 'text-center ' : ''}${className}`}>
        {display}
        {active && showCaret && (
          <span
            className={`ml-0.5 inline-block w-px h-[1.1em] translate-y-[2px] ${caretClassName}`}
          />
        )}
      </span>
    );
  }

  // Slide (slot/odometer) mode: outgoing phrase slides up + fades while the
  // next slides up into place from below. popLayout keeps the entering phrase
  // in normal flow (no absolute positioning), so it always renders visibly.
  return (
    <span className={`block ${centered ? 'text-center ' : ''}${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={index}
          initial={{ y: '0.5em', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-0.5em', opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="inline-block whitespace-nowrap"
        >
          {INTRO_ROLES[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
