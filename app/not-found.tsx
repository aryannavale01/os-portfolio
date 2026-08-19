import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-white flex flex-col items-center justify-center gap-6 p-6 text-center select-none font-sans">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
        <span className="text-3xl font-bold">?</span>
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">404 — Page Not Found</h1>
        <p className="text-sm text-slate-400 mt-2 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist. This is an interactive
          macOS desktop portfolio — try exploring from the home screen.
        </p>
      </div>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors"
      >
        Back to Desktop
      </Link>
    </div>
  );
}
