'use client';

import React, { useState, useRef, useEffect } from 'react';
import { WindowState } from '@/types/mac';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';

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

export function Window({
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

  // Mouse Dragging Header Logic
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (windowState.isMaximized || isMobile) return;
    onFocus();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - windowState.position.x,
      y: e.clientY - windowState.position.y,
    });
  };

  // Resize Handle MouseDown
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
        const minY = 28; // Menu bar height
        const maxY = window.innerHeight - 40;

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

        const minW = 360;
        const minH = 260;

        if (resizeDir.includes('e')) {
          newW = Math.max(minW, resizeStart.width + deltaX);
        }
        if (resizeDir.includes('s')) {
          newH = Math.max(minH, resizeStart.height + deltaY);
        }
        if (resizeDir.includes('w')) {
          const possibleW = resizeStart.width - deltaX;
          if (possibleW >= minW) {
            newW = possibleW;
            newX = resizeStart.posX + deltaX;
          }
        }
        if (resizeDir.includes('n')) {
          const possibleH = resizeStart.height - deltaY;
          if (possibleH >= minH && resizeStart.posY + deltaY >= 28) {
            newH = possibleH;
            newY = resizeStart.posY + deltaY;
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

  // Mobile layout rendering
  if (isMobile) {
    if (windowState.isMinimized) return null;
    return (
      <div className="fixed inset-0 top-7 bottom-16 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
        {/* Mobile Header Bar */}
        <div className="h-11 px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">{windowState.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMinimize}
              className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              title="Minimize"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={onMaximize}
              className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              title={windowState.isMaximized ? 'Restore' : 'Maximize'}
            >
              {windowState.isMaximized ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Mobile Content */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    );
  }

  // Desktop Window styling
  const windowStyle: React.CSSProperties = windowState.isMaximized
    ? {
        position: 'fixed',
        top: '28px',
        left: '0',
        right: '0',
        bottom: '76px',
        width: '100vw',
        height: 'calc(100vh - 104px)',
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
          onClick={onFocus}
          initial={{ scale: 0.85, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{
            scale: 0.1,
            opacity: 0,
            y: typeof window !== 'undefined' ? window.innerHeight - windowState.position.y - 100 : 300,
            x: typeof window !== 'undefined' ? window.innerWidth / 2 - windowState.position.x - windowState.size.width / 2 : 0,
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className={`rounded-xl overflow-hidden flex flex-col font-sans relative ${
            isDragging || resizeDir
              ? 'select-none'
              : 'transition-colors transition-shadow duration-200'
          } ${
            isActive
              ? 'bg-white/85 dark:bg-slate-900/80 backdrop-blur-3xl border border-black/10 dark:border-white/25 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] ring-1 ring-accent-500/40'
              : 'bg-white/70 dark:bg-slate-950/60 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-lg opacity-85 grayscale-[20%]'
          }`}
        >
          {/* Title Bar / Header */}
          <div
            onMouseDown={handleHeaderMouseDown}
            onDoubleClick={onMaximize}
            className={`h-10 px-4 flex items-center justify-between border-b select-none cursor-grab active:cursor-grabbing shrink-0 transition-colors ${
              isActive
                ? 'bg-black/5 border-black/10 dark:bg-white/10 dark:border-white/15'
                : 'bg-black/[0.03] border-black/5 dark:bg-white/5 dark:border-white/5'
            }`}
          >
            <div className="w-20" />

            {/* Title */}
            <div
              className={`text-[13px] font-semibold truncate px-2 text-center flex-1 transition-colors ${
                isActive ? 'text-slate-900 dark:text-white/90' : 'text-slate-400 dark:text-white/40'
              }`}
            >
              {windowState.title}
            </div>

            {/* Traffic Lights / Controls (Right Side) */}
            <div className="flex items-center justify-end gap-2 group w-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMinimize();
                }}
                className={`w-3 h-3 rounded-full flex items-center justify-center text-black/70 hover:text-black transition-colors ${
                  isActive ? 'bg-[#febc2e]' : 'bg-slate-600'
                }`}
                title="Minimize (Cmd+M)"
              >
                <Minus className="w-2 h-2 opacity-0 group-hover:opacity-100 text-black" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMaximize();
                }}
                className={`w-3 h-3 rounded-full flex items-center justify-center text-black/70 hover:text-black transition-colors ${
                  isActive ? 'bg-[#28c840]' : 'bg-slate-600'
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
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className={`w-3 h-3 rounded-full flex items-center justify-center text-black/70 hover:text-black transition-colors ${
                  isActive ? 'bg-[#ff5f57]' : 'bg-slate-600'
                }`}
                title="Close (Cmd+W)"
              >
                <X className="w-2 h-2 opacity-0 group-hover:opacity-100 text-black" />
              </button>
            </div>
          </div>

          {/* Window Body */}
          <div className="flex-1 overflow-hidden relative text-slate-900 dark:text-white">{children}</div>

          {/* 8-Direction Resize Handles */}
          {!windowState.isMaximized && (
            <>
              {/* Top */}
              <div
                onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
                className="absolute top-0 left-3 right-3 h-2 cursor-n-resize z-50"
              />
              {/* Bottom */}
              <div
                onMouseDown={(e) => handleResizeMouseDown(e, 's')}
                className="absolute bottom-0 left-3 right-3 h-2 cursor-s-resize z-50"
              />
              {/* Left */}
              <div
                onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
                className="absolute top-3 bottom-3 left-0 w-2 cursor-w-resize z-50"
              />
              {/* Right */}
              <div
                onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
                className="absolute top-3 bottom-3 right-0 w-2 cursor-e-resize z-50"
              />
              {/* Top-Left */}
              <div
                onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
                className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-50"
              />
              {/* Top-Right */}
              <div
                onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
                className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-50"
              />
              {/* Bottom-Left */}
              <div
                onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
                className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-50"
              />
              {/* Bottom-Right */}
              <div
                onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
                className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-50 flex items-end justify-end p-0.5 opacity-40 hover:opacity-100"
              >
                <div className="w-2 h-2 border-r-2 border-b-2 border-slate-400" />
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
