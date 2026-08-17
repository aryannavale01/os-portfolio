'use client';

import React, { useState, memo } from 'react';
import { PORTFOLIO_INFO } from '@/lib/data';
import { Send, CheckCircle2, Mail, User, AlertCircle } from 'lucide-react';

export const MailApp = memo(function MailApp() {
  const [fromName, setFromName] = useState<string>('');
  const [fromEmail, setFromEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('Inquiry regarding AI/ML & Full-Stack Opportunities');
  const [body, setBody] = useState<string>(
    `Hi Aryan,\n\nI was impressed by your RAG chatbot and NGO ERP projects! I'd love to connect regarding an exciting opportunity at our team.\n\nBest regards,\n`
  );
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isSent, setIsSent] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromEmail || !fromEmail.includes('@')) {
      setErrorMsg('Please enter a valid return email address.');
      return;
    }
    if (!body.trim()) {
      setErrorMsg('Message body cannot be empty.');
      return;
    }

    setErrorMsg('');
    setIsSending(true);

    const signature = fromName
      ? `\n\n— ${fromName}${fromEmail ? ` (${fromEmail})` : ''}`
      : '';
    const mailtoUrl = `mailto:${PORTFOLIO_INFO.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body + signature)}`;

    window.setTimeout(() => {
      window.location.href = mailtoUrl;
      setIsSending(false);
      setIsSent(true);
    }, 350);
  };

  const handleReset = () => {
    setIsSent(false);
    setFromName('');
    setFromEmail('');
    setBody('');
  };

  return (
    <div className="flex flex-col h-full w-full select-none bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
      {/* Mail Window Header Bar */}
      <div className="h-10 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-100/70 dark:bg-slate-950/40 text-xs">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-500" />
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            Compose New Message
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSend}
            disabled={isSending || isSent}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold text-white transition-all shadow-xs ${
              isSent
                ? 'bg-emerald-600'
                : 'bg-accent-600 hover:bg-accent-500 active:scale-95'
            }`}
          >
            {isSending ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : isSent ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Sent!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Mail Form Body */}
      <div className="flex-1 p-5 overflow-y-auto bg-white/60 dark:bg-slate-900/60 select-text">
        {isSent ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Email Client Opened for {PORTFOLIO_INFO.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              Your message has been prefilled and your email client opened, addressed to {PORTFOLIO_INFO.email}. Just hit send to reach Aryan!
            </p>
            <button
              onClick={handleReset}
              className="mt-2 px-4 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Send Another Email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="max-w-xl mx-auto space-y-3.5">
            {errorMsg && (
              <div className="p-2.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Recipient */}
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
              <span className="w-16 font-semibold text-slate-400">To:</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-accent-500/10 text-accent-600 dark:text-accent-400 font-medium">
                <User className="w-3 h-3" />
                <span>{PORTFOLIO_INFO.name} ({PORTFOLIO_INFO.email})</span>
              </div>
            </div>

            {/* From Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-16 font-semibold text-slate-400">From Name:</span>
                <input
                  type="text"
                  placeholder="Your Name (optional)"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  className="flex-1 bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="w-16 font-semibold text-slate-400">Your Email:</span>
                <input
                  type="email"
                  placeholder="your.email@company.com"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  required
                  className="flex-1 bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
              <span className="w-16 font-semibold text-slate-400">Subject:</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="flex-1 bg-transparent focus:outline-none font-medium text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Message Body */}
            <div className="pt-2">
              <textarea
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message here..."
                className="w-full bg-transparent focus:outline-none text-xs text-slate-800 dark:text-slate-200 resize-none font-sans leading-relaxed"
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
});
