'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-surface text-on-surface flex flex-col items-center justify-center gap-5 p-6 text-center select-none">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
        <span className="text-2xl font-bold">&#9888;</span>
      </div>
      <div>
        <h1 className="text-lg font-bold">Something went wrong</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          An unexpected error occurred. Try reloading the session.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-xl bg-primary-container hover:bg-secondary-container text-on-primary-container text-xs font-semibold transition-colors"
        >
          Try again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
        >
          Reload
        </button>
      </div>
    </div>
  );
}
