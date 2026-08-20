'use client';

import React, {useState, useCallback, memo} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {PORTFOLIO_INFO} from '@/lib/data';
import {
  Send,
  CheckCircle2,
  Mail,
  AlertCircle,
  RotateCcw,
  Paperclip,
} from 'lucide-react';

export const MailApp = memo(function MailApp() {
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [subject, setSubject] = useState(
    'Inquiry regarding AI/ML & Full-Stack Opportunities',
  );
  const [body, setBody] = useState(
    `Hi Aryan,\n\nI was impressed by your RAG chatbot and NGO ERP projects! I'd love to connect regarding an exciting opportunity at our team.\n\nBest regards,\n`,
  );
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSend = useCallback(
    async (e: React.FormEvent) => {
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

      try {
        const res = await fetch('/api/send-email', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            name: fromName || undefined,
            email: fromEmail,
            subject,
            message: body,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErrorMsg(
            data.error || 'Failed to send email. Please try again.',
          );
          return;
        }

        setIsSent(true);
      } catch {
        setErrorMsg(
          'Network error. Please check your connection and try again.',
        );
        return;
      } finally {
        setIsSending(false);
      }
    },
    [fromName, fromEmail, subject, body],
  );

  const handleReset = useCallback(() => {
    setIsSent(false);
    setFromName('');
    setFromEmail('');
    setSubject('Inquiry regarding AI/ML & Full-Stack Opportunities');
    setBody(
      `Hi Aryan,\n\nI was impressed by your RAG chatbot and NGO ERP projects! I'd love to connect regarding an exciting opportunity at our team.\n\nBest regards,\n`,
    );
    setErrorMsg('');
  }, []);

  return (
    <div className="flex flex-col h-full w-full select-none bg-white dark:bg-[#1e1e1e] text-[#1d1d1f] dark:text-[#e5e5e7] overflow-hidden font-sans">
      {/* macOS-style toolbar */}
      <div className="h-11 px-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between bg-[#f6f6f6]/80 dark:bg-[#2d2d2d]/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Mail className="w-4 h-4 text-[#007AFF]" />
          <span className="text-[13px] font-semibold tracking-[-0.01em]">
            New Message
          </span>
        </div>

        <motion.button
          whileTap={{scale: 0.96}}
          onClick={isSent ? handleReset : handleSend}
          disabled={isSending}
          className="flex items-center gap-1.5 px-3.5 py-[5px] rounded-md text-[11px] font-semibold transition-all
            bg-[#007AFF] hover:bg-[#0063D1] text-white shadow-[0_1px_2px_rgba(0,0,0,0.12)]
            disabled:opacity-50 disabled:cursor-not-allowed
            dark:bg-[#0A84FF] dark:hover:bg-[#409CFF]"
        >
          {isSending ? (
            <>
              <div className="w-3 h-3 border-[1.5px] border-white/80 border-t-transparent rounded-full animate-spin" />
              <span>Sending</span>
            </>
          ) : isSent ? (
            <>
              <RotateCcw className="w-3 h-3" />
              <span>New</span>
            </>
          ) : (
            <>
              <Send className="w-3 h-3" />
              <span>Send</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Mail Form Body */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {isSent ? (
            <motion.div
              key="success"
              initial={{opacity: 0, scale: 0.95}}
              animate={{opacity: 1, scale: 1}}
              exit={{opacity: 0, scale: 0.95}}
              transition={{duration: 0.2}}
              className="flex flex-col items-center justify-center h-full text-center px-6"
            >
              <div className="w-16 h-16 rounded-full bg-[#34C759]/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-9 h-9 text-[#34C759]" />
              </div>
              <h2 className="text-[17px] font-semibold mb-1.5">
                Message Sent
              </h2>
              <p className="text-[13px] text-[#86868b] dark:text-[#98989d] max-w-xs leading-relaxed">
                Your message has been delivered to{' '}
                <strong className="text-[#007AFF]">
                  {PORTFOLIO_INFO.email}
                </strong>
                .
                {fromName
                  ? ` Aryan will get back to you soon, ${fromName}.`
                  : ' Aryan will get back to you soon.'}
              </p>
              <motion.button
                whileTap={{scale: 0.97}}
                onClick={handleReset}
                className="mt-5 px-5 py-2 text-[12px] font-semibold bg-[#F2F2F7] dark:bg-[#3A3A3C] text-[#1d1d1f] dark:text-[#e5e5e7] rounded-lg hover:bg-[#E5E5EA] dark:hover:bg-[#48484A] transition-colors"
              >
                Compose Another
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
            >
              {/* Error Banner */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{height: 0, opacity: 0}}
                    animate={{height: 'auto', opacity: 1}}
                    exit={{height: 0, opacity: 0}}
                    className="overflow-hidden"
                  >
                    <div className="mx-4 mt-3 p-3 rounded-lg bg-[#FF3B30]/8 border border-[#FF3B30]/20 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-[#FF3B30] mt-0.5 shrink-0" />
                      <span className="text-[12px] text-[#FF3B30] leading-relaxed">
                        {errorMsg}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Headers */}
              <div className="border-b border-black/[0.06] dark:border-white/[0.06]">
                {/* To */}
                <div className="flex items-center px-4 py-2.5 border-b border-black/[0.04] dark:border-white/[0.04]">
                  <span className="w-[42px] text-[12px] font-medium text-[#86868b] dark:text-[#98989d] shrink-0">
                    To
                  </span>
                  <div className="flex items-center gap-1.5 text-[13px]">
                    <span className="text-[#1d1d1f] dark:text-[#e5e5e7] font-medium">
                      {PORTFOLIO_INFO.name}
                    </span>
                    <span className="text-[#86868b] dark:text-[#98989d]">
                      &lt;{PORTFOLIO_INFO.email}&gt;
                    </span>
                  </div>
                </div>

                {/* From */}
                <div className="flex items-center px-4 py-2.5 border-b border-black/[0.04] dark:border-white/[0.04]">
                  <span className="w-[42px] text-[12px] font-medium text-[#86868b] dark:text-[#98989d] shrink-0">
                    From
                  </span>
                  <div className="flex-1 flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={fromName}
                      onChange={(e) => setFromName(e.target.value)}
                      className="w-[120px] bg-transparent focus:outline-none text-[13px] text-[#1d1d1f] dark:text-[#e5e5e7] placeholder-[#c7c7cc] dark:placeholder-[#636366]"
                    />
                    <input
                      type="email"
                      placeholder="your.email@company.com"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      required
                      className="flex-1 bg-transparent focus:outline-none text-[13px] text-[#1d1d1f] dark:text-[#e5e5e7] placeholder-[#c7c7cc] dark:placeholder-[#636366]"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="flex items-center px-4 py-2.5">
                  <span className="w-[42px] text-[12px] font-medium text-[#86868b] dark:text-[#98989d] shrink-0">
                    Subject
                  </span>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="flex-1 bg-transparent focus:outline-none text-[13px] font-medium text-[#1d1d1f] dark:text-[#e5e5e7]"
                  />
                </div>
              </div>

              {/* Message Body */}
              <div className="p-4">
                <textarea
                  rows={12}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full bg-transparent focus:outline-none text-[13px] text-[#1d1d1f] dark:text-[#e5e5e7] resize-none leading-[1.65] tracking-[-0.01em]"
                />
              </div>

              {/* Bottom toolbar */}
              <div className="px-4 py-2.5 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center gap-3">
                <button className="flex items-center gap-1.5 text-[12px] text-[#86868b] dark:text-[#98989d] hover:text-[#1d1d1f] dark:hover:text-[#e5e5e7] transition-colors">
                  <Paperclip className="w-3.5 h-3.5" />
                </button>
                <div className="flex-1" />
                <span className="text-[11px] text-[#c7c7cc] dark:text-[#636366]">
                  {body.length > 0
                    ? `${body.split(/\s+/).filter(Boolean).length} words`
                    : ''}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
