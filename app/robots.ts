import type { MetadataRoute } from 'next';

// Generated route (replaces public/robots.txt) so the Sitemap line can carry an
// absolute URL — the robots spec requires it, and a relative one fails
// Lighthouse's robots.txt audit.
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
