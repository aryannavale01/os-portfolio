'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Shield,
  Compass,
  Github,
  Linkedin,
  ExternalLink,
} from 'lucide-react';

const BLOCKED_DOMAINS = [
  'github.com',
  'linkedin.com',
  'facebook.com',
  'twitter.com',
  'x.com',
  'instagram.com',
  'youtube.com',
  'reddit.com',
  'tiktok.com',
  'pinterest.com',
  'threads.net',
  'snapchat.com',
];

interface FavoriteTile {
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

const FAVORITES: FavoriteTile[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/aryannavale01',
    icon: <Github className="w-6 h-6 text-white" />,
    color: 'from-slate-700 to-slate-900',
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/aryan-navale-207961291',
    icon: <Linkedin className="w-6 h-6 text-white" />,
    color: 'from-sky-500 to-blue-700',
  },
  {
    name: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Main_Page',
    icon: <span className="text-xl font-serif font-bold text-on-surface">W</span>,
    color: 'from-slate-100 to-slate-300',
  },
  {
    name: 'MDN Web Docs',
    url: 'https://developer.mozilla.org/en-US/',
    icon: <span className="text-sm font-bold text-white">MDN</span>,
    color: 'from-slate-700 to-black',
  },
  {
    name: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    icon: <span className="text-lg font-bold text-white">SO</span>,
    color: 'from-orange-500 to-orange-700',
  },
  {
    name: 'Hacker News',
    url: 'https://news.ycombinator.com',
    icon: <span className="text-lg font-bold text-on-surface">Y</span>,
    color: 'from-orange-400 to-orange-500',
  },
];

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
}

function isBlockedSite(url: string): boolean {
  const domain = getDomain(url);
  return BLOCKED_DOMAINS.some(
    (d) => domain === d || domain.endsWith('.' + d)
  );
}

function sanitizeUrl(input: string): string | null {
  let trimmed = input.trim();
  if (!trimmed) return null;
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'https://' + trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

function getFaviconUrl(url: string): string {
  const domain = getDomain(url);
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

interface SafariAppProps {
  navigateToUrl?: string | null;
  onNavigated?: () => void;
}

export const SafariApp = memo(function SafariApp({
  navigateToUrl,
  onNavigated,
}: SafariAppProps) {
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [addressBarInput, setAddressBarInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigateToRef = useRef<(url: string) => void>(() => {});

  const currentUrl =
    historyIndex >= 0 && historyIndex < historyStack.length
      ? historyStack[historyIndex]
      : null;

  const blocked = currentUrl ? isBlockedSite(currentUrl) : false;

  const clearLoadTimer = useCallback(() => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  }, []);

  const startLoadTimer = useCallback(
    (url: string) => {
      clearLoadTimer();
      if (!isBlockedSite(url)) {
        loadTimeoutRef.current = setTimeout(() => {
          setIsLoading(false);
          setLoadError(true);
        }, 6000);
      }
    },
    [clearLoadTimer]
  );

  const navigateTo = useCallback(
    (url: string) => {
      const sanitized = sanitizeUrl(url);
      if (!sanitized) return;

      clearLoadTimer();
      setLoadError(false);

      if (isBlockedSite(sanitized)) {
        setHistoryStack((prev) => {
          const trimmed = prev.slice(0, historyIndex + 1);
          trimmed.push(sanitized);
          setHistoryIndex(trimmed.length - 1);
          setAddressBarInput(sanitized);
          setIsLoading(false);
          return trimmed;
        });
        return;
      }

      setHistoryStack((prev) => {
        const trimmed = prev.slice(0, historyIndex + 1);
        trimmed.push(sanitized);
        setHistoryIndex(trimmed.length - 1);
        setAddressBarInput(sanitized);
        setIsLoading(true);
        setIframeKey((k) => k + 1);
        return trimmed;
      });
      startLoadTimer(sanitized);
    },
    [historyIndex, clearLoadTimer, startLoadTimer]
  );

  useEffect(() => {
    navigateToRef.current = navigateTo;
  });

  useEffect(() => {
    if (navigateToUrl) {
      navigateToRef.current(navigateToUrl);
      onNavigated?.();
    }
  }, [navigateToUrl, onNavigated]);

  useEffect(() => {
    return () => clearLoadTimer();
  }, [clearLoadTimer]);

  const handleBack = useCallback(() => {
    if (historyIndex <= 0) return;
    clearLoadTimer();
    setLoadError(false);
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    const prevUrl = historyStack[newIndex];
    setAddressBarInput(prevUrl);
    setIframeKey((k) => k + 1);
    setIsLoading(!isBlockedSite(prevUrl));
    startLoadTimer(prevUrl);
  }, [historyIndex, historyStack, clearLoadTimer, startLoadTimer]);

  const handleForward = useCallback(() => {
    if (historyIndex >= historyStack.length - 1) return;
    clearLoadTimer();
    setLoadError(false);
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    const nextUrl = historyStack[newIndex];
    setAddressBarInput(nextUrl);
    setIframeKey((k) => k + 1);
    setIsLoading(!isBlockedSite(nextUrl));
    startLoadTimer(nextUrl);
  }, [historyIndex, historyStack, clearLoadTimer, startLoadTimer]);

  const handleReload = useCallback(() => {
    if (!currentUrl) return;
    clearLoadTimer();
    setLoadError(false);
    if (blocked) {
      setIsLoading(false);
      return;
    }
    setIframeKey((k) => k + 1);
    setIsLoading(true);
    startLoadTimer(currentUrl);
  }, [currentUrl, blocked, clearLoadTimer, startLoadTimer]);

  const handleHome = useCallback(() => {
    clearLoadTimer();
    setHistoryStack([]);
    setHistoryIndex(-1);
    setAddressBarInput('');
    setIsLoading(false);
    setLoadError(false);
  }, [clearLoadTimer]);

  const handleAddressSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const sanitized = sanitizeUrl(addressBarInput);
      if (sanitized) {
        navigateTo(sanitized);
      }
    },
    [addressBarInput, navigateTo]
  );

  const handleIframeLoad = useCallback(() => {
    clearLoadTimer();
    setIsLoading(false);
  }, [clearLoadTimer]);

  const handleIframeError = useCallback(() => {
    clearLoadTimer();
    setIsLoading(false);
    setLoadError(true);
  }, [clearLoadTimer]);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < historyStack.length - 1;
  const isStartPage = historyIndex === -1;
  const showFallback = (blocked || loadError) && currentUrl;

  return (
    <div className="h-full flex flex-col bg-surface-container-low dark:bg-surface-container text-on-surface select-none">
      {/* Browser Chrome */}
      <div className="shrink-0 border-b border-outline-variant bg-surface-container-lowest dark:bg-surface-container-high/80">
        {/* Navigation Controls */}
        <div className="flex items-center gap-1.5 px-3 py-2">
          {/* Back */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleBack}
            disabled={!canGoBack}
            className="p-1.5 rounded-lg hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-default transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.button>

          {/* Forward */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleForward}
            disabled={!canGoForward}
            className="p-1.5 rounded-lg hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-default transition-colors"
            title="Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          {/* Reload / Stop */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleReload}
            className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors"
            title={isLoading ? 'Stop' : 'Reload'}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isLoading ? (
                <motion.div
                  key="reload-spin"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <RotateCw className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div key="reload-static">
                  <RotateCw className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Home */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleHome}
            className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors"
            title="Home"
          >
            <Home className="w-4 h-4" />
          </motion.button>

          {/* Address Bar */}
          <form onSubmit={handleAddressSubmit} className="flex-1 mx-1.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low dark:bg-surface-container-high/60 border border-outline-variant focus-within:border-sky-400 dark:focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-400/40 transition-all">
              {!isStartPage && currentUrl && (
                <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              )}
              {isStartPage && (
                <Compass className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
              )}
              <input
                type="text"
                value={addressBarInput}
                onChange={(e) => setAddressBarInput(e.target.value)}
                placeholder="Search or enter website name"
                className="flex-1 bg-transparent text-xs text-on-surface placeholder-on-surface-variant outline-none font-medium"
                spellCheck={false}
              />
            </div>
          </form>
        </div>

        {/* Progress Bar */}
        <div className="h-[2px] relative overflow-hidden">
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                exit={{ opacity: 0 }}
                transition={{
                  x: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' },
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-400 to-transparent"
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {/* Start Page */}
        {isStartPage && (
          <div className="h-full overflow-y-auto">
            <StartPage onNavigate={navigateTo} />
          </div>
        )}

        {/* Blocked Site Fallback */}
        {showFallback && (
          <div className="h-full flex items-center justify-center p-6">
            <BlockedSiteCard url={currentUrl} />
          </div>
        )}

        {/* Iframe for Embeddable Sites */}
        {!isStartPage && currentUrl && !showFallback && (
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={currentUrl}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            className="w-full h-full border-0"
            title="Web Content"
          />
        )}
      </div>
    </div>
  );
});

function StartPage({ onNavigate }: { onNavigate: (url: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-surface-container-low to-surface-container-high dark:from-surface-container dark:to-surface-container-lowest">
      <div className="mb-8 text-center">
        <Compass className="w-10 h-10 text-sky-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-on-surface">
          Safari
        </h2>
        <p className="text-xs text-on-surface-variant mt-1">
          Browse the web
        </p>
      </div>

      <div className="w-full max-w-md">
        <h3 className="text-[10px] font-semibold tracking-wider text-on-surface-variant uppercase mb-3 text-center">
          Favorites
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {FAVORITES.map((fav) => (
            <motion.button
              key={fav.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate(fav.url)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition-colors group"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-b ${fav.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}
              >
                {fav.icon}
              </div>
              <span className="text-[10px] font-medium text-on-surface truncate w-full text-center">
                {fav.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlockedSiteCard({ url }: { url: string }) {
  const domain = getDomain(url);
  const faviconUrl = getFaviconUrl(url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full max-w-sm bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-8 shadow-2xl text-center"
    >
      {/* Favicon / Logo */}
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/15 flex items-center justify-center overflow-hidden shadow-lg">
        {faviconUrl ? (
          <img // eslint-disable-line @next/next/no-img-element
            src={faviconUrl}
            alt={domain}
            className="w-10 h-10 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <Compass className="w-8 h-8 text-white/40" />
        )}
      </div>

      {/* Domain */}
      <h3 className="text-base font-bold text-on-surface mb-1">
        {domain}
      </h3>

      {/* URL */}
      <p className="text-[10px] text-on-surface-variant truncate mb-4">
        {url}
      </p>

      {/* Message */}
      <p className="text-xs text-on-surface mb-6 leading-relaxed">
        This site doesn&apos;t allow embedded browsing.
        <br />
        Open it in a real browser tab to view the full experience.
      </p>

      {/* Open in New Tab Button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => window.open(url, '_blank')}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-lg shadow-sky-500/25 transition-colors"
      >
        Open in New Tab
        <ExternalLink className="w-3.5 h-3.5" />
      </motion.button>
    </motion.div>
  );
}
