'use client';

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Send, RotateCcw } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { springSnappy, getAnimationConfig } from '@/lib/animations';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  'What projects has Aryan built?',
  'What is his tech stack?',
  'Tell me about his internship',
  'How can I contact him?',
];

const FALLBACK_MESSAGE = 'Something went wrong — try again in a moment.';

let messageSeq = 0;
const nextId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `msg-${++messageSeq}`;

export const AskAIApp = memo(function AskAIApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [revealTarget, setRevealTarget] = useState('');
  const [revealedText, setRevealedText] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const revealTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const prefersReducedMotion = useReducedMotion();
  const animCfg = getAnimationConfig(prefersReducedMotion);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, revealedText, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!revealTarget) return;
    let i = 0;
    revealTimerRef.current = setInterval(() => {
      i += 1;
      setRevealedText(revealTarget.slice(0, i));
      if (i >= revealTarget.length && revealTimerRef.current) {
        clearInterval(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    }, 12);
    return () => {
      if (revealTimerRef.current) {
        clearInterval(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    };
  }, [revealTarget]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setRevealTarget('');
    setRevealedText('');
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [...prev, { id: nextId(), role: 'user', content: trimmed }]);
    setInput('');
    setIsLoading(true);

    let reply = FALLBACK_MESSAGE;
    try {
      const res = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json().catch(() => null);
      reply = data?.reply && typeof data.reply === 'string' ? data.reply : FALLBACK_MESSAGE;
    } catch {
      reply = FALLBACK_MESSAGE;
    } finally {
      setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', content: reply }]);
      setRevealTarget(reply);
      setIsLoading(false);
    }
  }, [isLoading]);

  const renderAssistantBubble = (msg: Message, isLast: boolean) => {
    const isRevealing = isLast && msg.content === revealTarget && revealedText.length < msg.content.length;
    const display = isRevealing ? revealedText : msg.content;
    return (
      <motion.div
        key={msg.id}
        className="flex gap-2 items-start"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={animCfg.snappyTransition}
      >
        <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center overflow-hidden shrink-0 mt-0.5 shadow-sm">
          <Image
            src="/logo.png"
            alt="Aryan Navale"
            width={28}
            height={28}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-[85%] text-xs px-3.5 py-2 rounded-2xl rounded-bl-md bg-surface-container-low dark:bg-surface-container-high border border-outline-variant shadow-sm whitespace-pre-wrap break-words">
          {display}
          {isRevealing && (
            <span className="ml-0.5 inline-block w-1.5 h-3.5 bg-primary animate-pulse align-middle rounded-sm" />
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-surface-container-low dark:bg-surface-container-lowest/60 text-on-surface select-none">
      {/* Subheader */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-outline-variant bg-surface-container-low/70 dark:bg-white/5 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-white/10 border border-white/15 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
            <Image
              src="/logo.png"
              alt="Aryan Navale"
              width={24}
              height={24}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xs font-semibold truncate">Ultron</span>
          <span className="text-[10px] text-on-surface-variant truncate hidden sm:inline">
            — about Aryan
          </span>
        </div>
        <motion.button
          onClick={handleNewChat}
          title="New chat"
          whileTap={{ scale: 0.9 }}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/10 hover:text-on-surface transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center gap-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center overflow-hidden shadow-lg">
              <Image
                src="/logo.png"
                alt="Aryan Navale"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold">Ask me anything about Aryan</p>
              <p className="text-[11px] text-on-surface-variant mt-1">
                Projects, skills, experience &amp; more
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm">
              {SUGGESTED_QUESTIONS.map((q) => (
                <motion.button
                  key={q}
                  onClick={() => sendMessage(q)}
                  whileTap={{ scale: 0.97 }}
                  className="text-left text-[11px] px-3 py-2 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/15 text-on-surface transition-colors"
                >
                  {q}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) =>
          msg.role === 'user' ? (
            <motion.div
              key={msg.id}
              className="flex justify-end"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={animCfg.snappyTransition}
            >
              <div className="max-w-[80%] text-xs px-3.5 py-2 rounded-2xl rounded-br-md bg-primary-container text-on-surface shadow-sm whitespace-pre-wrap break-words">
                {msg.content}
              </div>
            </motion.div>
          ) : (
            renderAssistantBubble(msg, idx === messages.length - 1)
          )
        )}

        {isLoading && (
          <div className="flex gap-2 items-start">
            <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center overflow-hidden shrink-0 mt-0.5 shadow-sm">
              <Image
                src="/logo.png"
                alt="Aryan Navale"
                width={28}
                height={28}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="px-3.5 py-3 rounded-2xl rounded-bl-md bg-surface-container-low dark:bg-surface-container-high border border-outline-variant shadow-sm">
              <span className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-outline-variant bg-surface-container-low/70 dark:bg-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            maxLength={300}
            placeholder="Ask Ultron about Aryan's projects, skills, or background..."
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-surface-container-low dark:bg-white/10 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-on-surface-variant min-w-0"
          />
          <motion.button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            title="Send"
            whileTap={{ scale: 0.9 }}
            className="w-9 h-9 rounded-xl bg-primary-container hover:bg-primary disabled:opacity-40 disabled:cursor-not-allowed text-on-surface flex items-center justify-center transition-colors shadow-sm shrink-0"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
        <p className="mt-1.5 text-[10px] text-on-surface-variant text-center">
          Ultron answers questions about Aryan and his work only.
        </p>
      </div>
    </div>
  );
});
