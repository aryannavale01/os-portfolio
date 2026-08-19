'use client';

import React, { useState, useEffect, useRef, memo } from 'react';
import { PORTFOLIO_INFO, SKILLS_CATEGORIZED, PROJECTS_DATA } from '@/lib/data';
import { useTheme } from '@/components/context/ThemeContext';

interface CommandOutput {
  id: string;
  command: string;
  output: React.ReactNode;
}

export const TerminalApp = memo(function TerminalApp() {
  const { toggleTheme } = useTheme();
  const [history, setHistory] = useState<CommandOutput[]>(() => [
    {
      id: 'init-1',
      command: 'whoami',
      output: (
        <div className="text-on-surface">
          <span className="font-bold text-cyan-300">{PORTFOLIO_INFO.name}</span> — {PORTFOLIO_INFO.role}
          <br />
          <span className="text-on-surface-variant text-xs">{PORTFOLIO_INFO.tagline}</span>
        </div>
      ),
    },
    {
      id: 'init-2',
      command: 'skills --list',
      output: (
        <div className="space-y-2 text-on-surface my-1">
          {SKILLS_CATEGORIZED.map((cat, idx) => (
            <div key={idx} className="border-l-2 border-emerald-500/60 pl-2">
              <span className="text-amber-300 font-semibold">{cat.category}:</span>
              <div className="flex flex-wrap gap-x-2 gap-y-1 mt-0.5 text-xs text-emerald-200">
                {cat.skills.map((skill, sIdx) => (
                  <span key={sIdx} className="bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.5 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ]);
  const [inputVal, setInputVal] = useState<string>('');
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    const cmdLower = cmd.toLowerCase();
    let resultNode: React.ReactNode = null;

    if (cmdLower === 'help') {
      resultNode = (
        <div className="space-y-1 text-on-surface text-xs">
          <p className="text-yellow-300 font-bold">Available Commands:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pl-2">
            <div><span className="text-cyan-400 font-bold">whoami</span> - Display title & one-line summary</div>
            <div><span className="text-cyan-400 font-bold">skills --list</span> - List categorized technical skills</div>
            <div><span className="text-cyan-400 font-bold">projects</span> - Display highlighted projects</div>
            <div><span className="text-cyan-400 font-bold">cat contact.txt</span> - Show email, LinkedIn, GitHub</div>
            <div><span className="text-cyan-400 font-bold">neofetch</span> - Display system specifications</div>
            <div><span className="text-cyan-400 font-bold">theme</span> - Toggle Desktop Light/Dark theme</div>
            <div><span className="text-cyan-400 font-bold">sudo hire</span> - Initiate hiring proposal protocol</div>
            <div><span className="text-cyan-400 font-bold">clear</span> - Clear terminal output</div>
          </div>
        </div>
      );
    } else if (cmdLower === 'whoami') {
      resultNode = (
        <div className="text-on-surface">
          <p className="font-bold text-cyan-300">{PORTFOLIO_INFO.name} — {PORTFOLIO_INFO.role}</p>
          <p className="text-on-surface text-xs mt-0.5">{PORTFOLIO_INFO.tagline}</p>
          <p className="text-on-surface-variant text-xs mt-1">Location: {PORTFOLIO_INFO.location} | Status: {PORTFOLIO_INFO.status}</p>
        </div>
      );
    } else if (cmdLower === 'skills' || cmdLower === 'skills --list' || cmdLower === 'skills --categorized') {
      resultNode = (
        <div className="space-y-2 text-on-surface my-1">
          {SKILLS_CATEGORIZED.map((cat, idx) => (
            <div key={idx} className="border-l-2 border-emerald-500/60 pl-2">
              <span className="text-amber-300 font-semibold">{cat.category}:</span>
              <div className="flex flex-wrap gap-x-2 gap-y-1 mt-0.5 text-xs text-emerald-200">
                {cat.skills.map((skill, sIdx) => (
                  <span key={sIdx} className="bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.5 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    } else if (cmdLower === 'projects') {
      resultNode = (
        <div className="space-y-1.5 text-on-surface">
          <p className="text-amber-300 font-semibold">Top AI/ML Projects:</p>
          {PROJECTS_DATA.map((proj) => (
            <div key={proj.id} className="pl-2 border-l border-cyan-500/40">
              <span className="text-cyan-300 font-bold">{proj.title}</span>
              <p className="text-on-surface-variant text-xs">{proj.shortDesc}</p>
              <span className="text-emerald-400 text-[11px]">{proj.techStack.join(', ')}</span>
            </div>
          ))}
        </div>
      );
    } else if (cmdLower === 'contact' || cmdLower === 'cat contact.txt') {
      resultNode = (
        <div className="space-y-1 text-on-surface">
          <p><span className="text-on-surface-variant">Email:</span> <a href={`mailto:${PORTFOLIO_INFO.email}`} className="text-cyan-400 underline">{PORTFOLIO_INFO.email}</a></p>
          <p><span className="text-on-surface-variant">GitHub:</span> <a href={PORTFOLIO_INFO.github} target="_blank" rel="noreferrer" className="text-cyan-400 underline">{PORTFOLIO_INFO.github}</a></p>
          <p><span className="text-on-surface-variant">LinkedIn:</span> <a href={PORTFOLIO_INFO.linkedin} target="_blank" rel="noreferrer" className="text-cyan-400 underline">{PORTFOLIO_INFO.linkedin}</a></p>
        </div>
      );
    } else if (cmdLower === 'neofetch' || cmdLower === 'systeminfo') {
      resultNode = (
        <div className="font-mono text-xs text-cyan-300 flex flex-col sm:flex-row gap-4 my-2 p-2 bg-surface-container/80 rounded border border-cyan-800/40">
          <pre className="text-emerald-400 font-bold hidden sm:block">
{`    .:'
  __ :'__
.'\`  \`-'  \`'.
:          :
:          :
 :        :
  '..__..'`}
          </pre>
          <div className="space-y-0.5 text-on-surface">
            <p className="text-cyan-400 font-bold">aryan@dev-machine</p>
            <p className="text-on-surface-variant">------------------</p>
            <p><span className="text-amber-300">OS:</span> {PORTFOLIO_INFO.systemSpecs.os}</p>
            <p><span className="text-amber-300">Host:</span> Aryan Dev Workstation</p>
            <p><span className="text-amber-300">Processor:</span> {PORTFOLIO_INFO.systemSpecs.chip}</p>
            <p><span className="text-amber-300">Memory:</span> {PORTFOLIO_INFO.systemSpecs.memory}</p>
            <p><span className="text-amber-300">Storage:</span> {PORTFOLIO_INFO.systemSpecs.storage}</p>
            <p><span className="text-amber-300">Shell:</span> PowerShell 7.4 (x64_amd64_windows)</p>
          </div>
        </div>
      );
    } else if (cmdLower === 'clear') {
      setHistory([]);
      setInputVal('');
      return;
    } else if (cmdLower === 'theme') {
      toggleTheme();
      resultNode = <p className="text-emerald-400">✓ Toggled desktop color theme!</p>;
    } else if (cmdLower === 'sudo hire') {
      resultNode = (
        <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/50 rounded-md text-emerald-300 font-semibold space-y-1">
          <p>🎉 [ACCESS GRANTED] Initiating Hiring Protocol...</p>
          <p className="text-xs font-normal text-emerald-200">
            &gt; Aryan Navale is now flagged as Available. Opening Mail compose window or contact sheet!
          </p>
          <p className="text-xs text-yellow-300 font-bold">
            Email directly at: {PORTFOLIO_INFO.email}
          </p>
        </div>
      );
    } else if (cmdLower.startsWith('echo ')) {
      resultNode = <p className="text-on-surface">{cmd.substring(5)}</p>;
    } else if (cmdLower === 'date') {
      resultNode = <p className="text-on-surface">{new Date().toString()}</p>;
    } else {
      resultNode = (
        <p className="text-red-400">
          zsh: command not found: {cmd}. Type <span className="text-yellow-300 underline font-bold">help</span> for commands.
        </p>
      );
    }

    setHistory((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        command: cmd,
        output: resultNode,
      },
    ]);
    setInputVal('');
  };

  return (
    <div
      ref={terminalContainerRef}
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
      className="h-full w-full bg-surface-container-lowest text-on-surface p-4 font-mono text-xs overflow-y-auto select-text flex flex-col"
    >
      <div className="space-y-3 flex-1">
        {/* Header banner */}
        <div className="text-on-surface-variant border-b border-outline-variant/80 pb-2 mb-3">
          <p className="text-emerald-400 font-bold">
            Windows PowerShell terminal simulator — [Type &apos;help&apos; for menu]
          </p>
        </div>

        {/* Command Output History */}
        {history.map((item) => (
          <div key={item.id} className="space-y-1">
            <div className="flex items-center gap-1.5 text-on-surface">
              <span className="text-emerald-400 font-bold">aryan@dev-machine</span>
              <span className="text-on-surface-variant">~ %</span>
              <span className="text-cyan-300 font-medium">{item.command}</span>
            </div>
            <div className="pl-3">{item.output}</div>
          </div>
        ))}

        {/* Active Command Line Input */}
        <form onSubmit={handleCommandSubmit} className="flex items-center gap-1.5 pt-1">
          <span className="text-emerald-400 font-bold">aryan@dev-machine</span>
          <span className="text-on-surface-variant">~ %</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-cyan-300 font-mono text-xs caret-emerald-400"
          />
        </form>
      </div>
    </div>
  );
});
