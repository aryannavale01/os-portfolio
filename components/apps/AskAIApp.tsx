'use client';

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';
import { Send, RotateCcw } from 'lucide-react';

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
      <div key={msg.id} className="flex gap-2 items-start">
        <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center overflow-hidden shrink-0 mt-0.5 shadow-sm">
          <Image
            src="/logo.png"
            alt="Aryan Navale"
            width={28}
            height={28}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-[85%] text-xs px-3.5 py-2 rounded-2xl rounded-bl-md bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 shadow-sm whitespace-pre-wrap break-words">
          {display}
          {isRevealing && (
            <span className="ml-0.5 inline-block w-1.5 h-3.5 bg-accent-500 animate-pulse align-middle rounded-sm" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white select-none">
      {/* Subheader */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 shrink-0">
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
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate hidden sm:inline">
            — about Aryan
          </span>
        </div>
        <button
          onClick={handleNewChat}
          title="New chat"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
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
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Projects, skills, experience &amp; more
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left text-[11px] px-3 py-2 rounded-xl border border-accent-500/30 bg-accent-500/5 hover:bg-accent-500/15 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) =>
          msg.role === 'user' ? (
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-[80%] text-xs px-3.5 py-2 rounded-2xl rounded-br-md bg-accent-600 text-white shadow-sm whitespace-pre-wrap break-words">
                {msg.content}
              </div>
            </div>
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
            <div className="px-3.5 py-3 rounded-2xl rounded-bl-md bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 shadow-sm">
              <span className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-bounce"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 shrink-0">
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
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 border border-black/10 dark:border-white/15 focus:outline-none focus:ring-2 focus:ring-accent-500/50 placeholder-slate-400 dark:placeholder-slate-500 min-w-0"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            title="Send"
            className="w-9 h-9 rounded-xl bg-accent-600 hover:bg-accent-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-sm shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500 text-center">
          Ultron answers questions about Aryan and his work only.
        </p>
      </div>
    </div>
  );
});
