'use client';

import React, { useState, useRef, useEffect, memo } from 'react';
import { WindowState } from '@/types/mac';
import { useIsMobile } from '@/hooks/use-mobile';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { getAnimationConfig } from '@/lib/animations';

interface WindowProps {
  windowState: WindowState;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onUpdatePosition: (x: number, y: number) => void;
  onUpdateSize: (width: number, height: number) => void;
  children: React.ReactNode;
}

type ResizeDirection =
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | 'ne'
  | 'nw'
  | 'se'
  | 'sw'
  | null;

export const Window = memo(function Window({
  windowState,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onUpdatePosition,
  onUpdateSize,
  children,
}: WindowProps) {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const animCfg = getAnimationConfig(prefersReducedMotion);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeDir, setResizeDir] = useState<ResizeDirection>(null);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    posX: 0,
    posY: 0,
  });

  const windowRef = useRef<HTMLDivElement>(null);

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (windowState.isMaximized || isMobile) return;
    onFocus();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - windowState.position.x,
      y: e.clientY - windowState.position.y,
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, dir: ResizeDirection) => {
    e.stopPropagation();
    if (windowState.isMaximized || isMobile) return;
    onFocus();
    setResizeDir(dir);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: windowState.size.width,
      height: windowState.size.height,
      posX: windowState.position.x,
      posY: windowState.position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const minX = -windowState.size.width + 120;
        const maxX = window.innerWidth - 120;
        const minY = 28;
        const maxY = window.innerHeight - 60;

        const newX = Math.max(minX, Math.min(maxX, e.clientX - dragOffset.x));
        const newY = Math.max(minY, Math.min(maxY, e.clientY - dragOffset.y));
        onUpdatePosition(newX, newY);
      }

      if (resizeDir) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        let newW = resizeStart.width;
        let newH = resizeStart.height;
        let newX = resizeStart.posX;
        let newY = resizeStart.posY;

        const minW = Math.min(400, Math.max(300, window.innerWidth - 64));
        const minH = Math.min(300, Math.max(250, window.innerHeight - 140));
        const maxW = Math.max(minW, window.innerWidth - resizeStart.posX - 32);
        const maxH = Math.max(minH, window.innerHeight - resizeStart.posY - 60);

        if (resizeDir.includes('e')) {
          newW = Math.min(maxW, Math.max(minW, resizeStart.width + deltaX));
        }
        if (resizeDir.includes('s')) {
          newH = Math.min(maxH, Math.max(minH, resizeStart.height + deltaY));
        }
        if (resizeDir.includes('w')) {
          const possibleW = resizeStart.width - deltaX;
          if (possibleW >= minW && resizeStart.posX + deltaX >= 8) {
            newW = Math.min(possibleW, window.innerWidth - (resizeStart.posX + deltaX) - 32);
            newX = resizeStart.posX + deltaX;
            if (newW < minW) newW = Math.min(minW, resizeStart.width);
          }
        }
        if (resizeDir.includes('n')) {
          const possibleH = resizeStart.height - deltaY;
          if (possibleH >= minH && resizeStart.posY + deltaY >= 28) {
            newH = Math.min(possibleH, window.innerHeight - (resizeStart.posY + deltaY) - 60);
            newY = resizeStart.posY + deltaY;
            if (newH < minH) newH = Math.min(minH, resizeStart.height);
          }
        }

        onUpdateSize(newW, newH);
        if (newX !== windowState.position.x || newY !== windowState.position.y) {
          onUpdatePosition(newX, newY);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setResizeDir(null);
    };

    if (isDragging || resizeDir) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDragging,
    resizeDir,
    dragOffset,
    resizeStart,
    windowState.size,
    windowState.position,
    onUpdatePosition,
    onUpdateSize,
  ]);

  if (!windowState.isOpen) return null;

  if (isMobile) {
    if (windowState.isMinimized) return null;
    return (
      <div className="fixed inset-0 top-7 bottom-16 z-40 bg-surface-container/95 backdrop-blur-2xl text-on-surface flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
        <div className="h-11 px-4 border-b border-white/10 bg-surface-container-low flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">{windowState.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={onMinimize}
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-on-surface" title="Minimize">
              <Minus className="w-4 h-4" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={onMaximize}
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              title={windowState.isMaximized ? 'Restore' : 'Maximize'}>
              {windowState.isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-on-surface" title="Close">
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    );
  }

  const windowStyle: React.CSSProperties = windowState.isMaximized
    ? {
        position: 'absolute',
        top: '28px',
        left: '0',
        right: '0',
        bottom: '76px',
        zIndex: windowState.zIndex,
      }
    : {
        position: 'absolute',
        left: `${windowState.position.x}px`,
        top: `${windowState.position.y}px`,
        width: `${windowState.size.width}px`,
        height: `${windowState.size.height}px`,
        zIndex: windowState.zIndex,
      };

  return (
    <AnimatePresence>
      {!windowState.isMinimized && (
        <motion.div
          ref={windowRef}
          style={windowStyle}
          onMouseDown={onFocus}
          initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0.92, opacity: 0, y: 20 }}
          animate={
            isDragging
              ? { scale: 1.01, opacity: 1, y: 0, filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.55))' }
              : { scale: 1, opacity: 1, y: 0, filter: 'drop-shadow(0 0 0px rgba(0,0,0,0))' }
          }
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : {
                  scale: 0.1,
                  opacity: 0,
                  y: typeof window !== 'undefined' ? window.innerHeight - windowState.position.y - 100 : 300,
                  x: typeof window !== 'undefined' ? window.innerWidth / 2 - windowState.position.x - windowState.size.width / 2 : 0,
                }
          }
          transition={isDragging ? animCfg.snappyTransition : animCfg.windowTransition}
          className={`rounded-xl overflow-hidden flex flex-col font-sans relative ${
            isDragging || resizeDir
              ? 'select-none'
              : 'transition-colors transition-shadow duration-200'
          } ${
            isActive
              ? 'bg-white/[0.08] backdrop-blur-[20px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-secondary/50'
              : 'bg-white/[0.04] backdrop-blur-xl border border-white/5 shadow-lg opacity-85 grayscale-[20%]'
          }`}
        >
          {/* Title Bar */}
          <div
            onMouseDown={handleHeaderMouseDown}
            onDoubleClick={onMaximize}
            className={`h-10 px-4 flex items-center justify-between border-b select-none cursor-grab active:cursor-grabbing shrink-0 transition-colors ${
              isActive ? 'bg-white/10 border-white/15' : 'bg-white/5 border-white/5'
            }`}
          >
            <div className="w-20" />
            <div className={`text-[13px] font-semibold truncate px-2 text-center flex-1 transition-colors ${
              isActive ? 'text-on-surface' : 'text-on-surface-variant/40'
            }`}>
              {windowState.title}
            </div>

            {/* Traffic Lights */}
            <div className="flex items-center justify-end gap-2 group w-20" onMouseDown={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => { e.stopPropagation(); onMinimize(); }}
                className={`w-3 h-3 rounded-full flex items-center justify-center text-black/70 hover:text-black transition-colors ${
                  isActive ? 'bg-[#FFBD2E]' : 'bg-on-surface-variant/30'
                }`}
                title="Minimize (Cmd+M)"
              >
                <Minus className="w-2 h-2 opacity-0 group-hover:opacity-100 text-black" />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); onMaximize(); }}
                className={`w-3 h-3 rounded-full flex items-center justify-center text-black/70 hover:text-black transition-colors ${
                  isActive ? 'bg-[#27C93F]' : 'bg-on-surface-variant/30'
                }`}
                title={windowState.isMaximized ? 'Restore' : 'Maximize'}
              >
                {windowState.isMaximized ? (
                  <Minimize2 className="w-2 h-2 opacity-0 group-hover:opacity-100 text-black" />
                ) : (
                  <Maximize2 className="w-2 h-2 opacity-0 group-hover:opacity-100 text-black" />
                )}
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className={`w-3 h-3 rounded-full flex items-center justify-center text-black/70 hover:text-black transition-colors ${
                  isActive ? 'bg-[#FF5F56]' : 'bg-on-surface-variant/30'
                }`}
                title="Close (Cmd+W)"
              >
                <X className="w-2 h-2 opacity-0 group-hover:opacity-100 text-black" />
              </button>
            </div>
          </div>

          {/* Window Body */}
          <div className="flex-1 overflow-hidden relative text-on-surface min-h-0">{children}</div>

          {/* Resize Handles — thick invisible strips that sit OUTSIDE the overflow-hidden body */}
          {!windowState.isMaximized && (
            <>
              {/* Top — 10px strip */}
              <div
                onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
                className="absolute top-0 left-0 right-0 h-[10px] cursor-n-resize z-50"
              />
              {/* Bottom — 10px strip */}
              <div
                onMouseDown={(e) => handleResizeMouseDown(e, 's')}
                className="absolute bottom-0 left-0 right-0 h-[10px] cursor-s-resize z-50"
              />
              {/* Left — 10px strip */}
              <div
                onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
                className="absolute top-0 bottom-0 left-0 w-[10px] cursor-w-resize z-50"
              />
              {/* Right — 10px strip */}
              <div
                onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
                className="absolute top-0 bottom-0 right-0 w-[10px] cursor-e-resize z-50"
              />
              {/* NW */}
              <div
                onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
                className="absolute top-0 left-0 w-[14px] h-[14px] cursor-nw-resize z-50"
              />
              {/* NE */}
              <div
                onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
                className="absolute top-0 right-0 w-[14px] h-[14px] cursor-ne-resize z-50"
              />
              {/* SW */}
              <div
                onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
                className="absolute bottom-0 left-0 w-[14px] h-[14px] cursor-sw-resize z-50"
              />
              {/* SE */}
              <div
                onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
                className="absolute bottom-0 right-0 w-[14px] h-[14px] cursor-se-resize z-50 flex items-end justify-end p-[3px] opacity-40 hover:opacity-100"
              >
                <div className="w-2 h-2 border-r-2 border-b-2 border-on-surface-variant/40" />
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});
