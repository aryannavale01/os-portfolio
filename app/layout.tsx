import type {Metadata, Viewport} from 'next';
import './globals.css'; // Global styles

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Aryan Navale — AI/ML & Full-Stack Developer Portfolio',
    template: '%s | Aryan Navale',
  },
  description:
    'Interactive macOS-desktop portfolio of Aryan Navale — final-year B.Tech (AI & Data Science) student at VPKBIET and Software Development Intern at MKCL. Explore projects in LLMs, RAG, AI agents, and full-stack development.',
  keywords: [
    'Aryan Navale',
    'AI/ML Developer',
    'Full-Stack Developer',
    'RAG',
    'LLM',
    'AI Agents',
    'Next.js',
    'Portfolio',
    'VPKBIET',
    'MKCL',
  ],
  authors: [{name: 'Aryan Navale'}],
  creator: 'Aryan Navale',
  publisher: 'Aryan Navale',
  applicationName: 'Aryan Navale Portfolio',
  generator: 'Next.js',
  category: 'Portfolio',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: APP_URL,
    siteName: 'Aryan Navale Portfolio',
    title: 'Aryan Navale — AI/ML & Full-Stack Developer Portfolio',
    description:
      'Interactive macOS-desktop portfolio with projects in LLMs, RAG, AI agents, and full-stack development, plus an AI assistant (Ultron) that answers questions about Aryan.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Aryan Navale — AI/ML & Full-Stack Developer Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aryan Navale — AI/ML & Full-Stack Developer Portfolio',
    description:
      'Interactive macOS-desktop portfolio with projects in LLMs, RAG, AI agents, and full-stack development.',
    images: ['/og.png'],
  },
  icons: {
    icon: [
      {url: '/favicon.svg', type: 'image/svg+xml'},
      {url: '/favicon.ico', sizes: 'any'},
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    {media: '(prefers-color-scheme: light)', color: '#f1f5f9'},
    {media: '(prefers-color-scheme: dark)', color: '#0f172a'},
  ],
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/logo.png" as="image" />
        <link rel="preload" href="/og.png" as="image" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var K='os_recovery_ts';function check(m){if(!m||typeof m!=='string')return;if(!/(reading 'call')|(is not a function)|originalFactory|__webpack_modules__|client manifest|module factory/i.test(m))return;try{var now=Date.now();var last=parseInt(localStorage.getItem(K)||'0',10);if(now-last<30000)return;localStorage.setItem(K,String(now))}catch(e){return}location.reload()}window.addEventListener('error',function(e){check(e.error&&e.error.message)});window.addEventListener('unhandledrejection',function(e){check(e.reason&&(e.reason.message||String(e.reason)))})})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=JSON.parse(localStorage.getItem('macos_portfolio_settings_v1'));if(s){var r=document.documentElement;if(s.theme==='dark'){r.classList.add('dark');r.classList.remove('light')}else{r.classList.add('light');r.classList.remove('dark')}if(s.accentColor){r.dataset.accent=s.accentColor}}}catch(e){}})();`,
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
