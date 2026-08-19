import type {Metadata, Viewport} from 'next';
import './globals.css';
import {SEO} from '@/lib/seo/config';
import {getPersonSchema, getWebSiteSchema} from '@/lib/seo/structured-data';
import {StructuredData} from '@/components/seo/StructuredData';

export const metadata: Metadata = {
  metadataBase: new URL(SEO.siteUrl),
  title: {
    default: SEO.defaultTitle,
    template: SEO.titleTemplate,
  },
  description: SEO.defaultDescription,
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
    locale: SEO.locale,
    url: SEO.siteUrl,
    siteName: SEO.siteName,
    title: SEO.defaultTitle,
    description:
      'Interactive macOS-desktop portfolio with projects in LLMs, RAG, AI agents, and full-stack development, plus an AI assistant (Ultron) that answers questions about Aryan.',
    images: [
      {
        url: SEO.defaultOgImage,
        width: 1200,
        height: 630,
        alt: SEO.defaultTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.defaultTitle,
    description:
      'Interactive macOS-desktop portfolio with projects in LLMs, RAG, AI agents, and full-stack development.',
    images: [SEO.defaultOgImage],
    ...(SEO.twitterHandle ? {site: SEO.twitterHandle, creator: SEO.twitterHandle} : {}),
  },
  icons: {
    icon: [
      {url: '/favicon-96.png', type: 'image/png', sizes: '96x96'},
      {url: '/favicon-48.png', type: 'image/png', sizes: '48x48'},
      {url: '/favicon-32.png', type: 'image/png', sizes: '32x32'},
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
        <StructuredData data={getPersonSchema()} />
        <StructuredData data={getWebSiteSchema()} />
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
