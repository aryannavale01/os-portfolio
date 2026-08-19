'use client';

import React, {useState, memo} from 'react';
import {motion} from 'motion/react';
import {PORTFOLIO_INFO} from '@/lib/data';
import {Send, CheckCircle2, Mail, User, AlertCircle, RotateCcw} from 'lucide-react';

export const MailApp = memo(function MailApp() {
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [subject, setSubject] = useState('Inquiry regarding AI/ML & Full-Stack Opportunities');
  const [body, setBody] = useState(
    `Hi Aryan,\n\nI was impressed by your RAG chatbot and NGO ERP projects! I'd love to connect regarding an exciting opportunity at our team.\n\nBest regards,\n`,
  );
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSend = async (e: React.FormEvent) => {
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
        setErrorMsg(data.error || 'Failed to send email. Please try again.');
        return;
      }

      setIsSent(true);
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    setIsSent(false);
    setFromName('');
    setFromEmail('');
    setBody('');
    setErrorMsg('');
  };

  return (
    <div className="flex flex-col h-full w-full select-none bg-surface-container-low dark:bg-surface-container text-on-surface overflow-hidden font-sans">
      {/* Mail Window Header Bar */}
      <div className="h-10 px-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low/70 dark:bg-surface-container-lowest/40 text-xs">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-500" />
          <span className="font-semibold text-on-surface">Compose New Message</span>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{scale: 0.97}}
            onClick={isSent ? handleReset : handleSend}
            disabled={isSending}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold text-white transition-all shadow-xs ${
              isSent
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-primary-container hover:bg-primary'
            }`}
          >
            {isSending ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : isSent ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Main Mail Form Body */}
      <div className="flex-1 p-5 overflow-y-auto bg-surface-container-low/60 dark:bg-surface-container/60 select-text">
        {isSent ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-on-surface">Message Sent!</h2>
            <p className="text-xs text-on-surface-variant max-w-sm">
              Your message has been delivered to <strong>{PORTFOLIO_INFO.email}</strong>.
              {fromName ? ` Aryan will get back to you soon, ${fromName}.` : ' Aryan will get back to you soon.'}
            </p>
            <motion.button
              whileTap={{scale: 0.97}}
              onClick={handleReset}
              className="mt-2 px-4 py-1.5 text-xs font-semibold bg-surface-container-high dark:bg-surface-container-high text-on-surface rounded-md hover:bg-surface-container-highest dark:hover:bg-surface-container-highest transition-colors"
            >
              Send Another Message
            </motion.button>
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
            <div className="flex items-center gap-3 border-b border-outline-variant pb-2 text-xs">
              <span className="w-16 font-semibold text-on-surface-variant">To:</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                <User className="w-3 h-3" />
                <span>
                  {PORTFOLIO_INFO.name} ({PORTFOLIO_INFO.email})
                </span>
              </div>
            </div>

            {/* From Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-outline-variant pb-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-16 font-semibold text-on-surface-variant">From Name:</span>
                <input
                  type="text"
                  placeholder="Your Name (optional)"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  className="flex-1 bg-transparent focus:outline-none text-on-surface placeholder-on-surface-variant"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="w-16 font-semibold text-on-surface-variant">Your Email:</span>
                <input
                  type="email"
                  placeholder="your.email@company.com"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  required
                  className="flex-1 bg-transparent focus:outline-none text-on-surface placeholder-on-surface-variant"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="flex items-center gap-3 border-b border-outline-variant pb-2 text-xs">
              <span className="w-16 font-semibold text-on-surface-variant">Subject:</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="flex-1 bg-transparent focus:outline-none font-medium text-on-surface"
              />
            </div>

            {/* Message Body */}
            <div className="pt-2">
              <textarea
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message here..."
                className="w-full bg-transparent focus:outline-none text-xs text-on-surface resize-none font-sans leading-relaxed"
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
});
