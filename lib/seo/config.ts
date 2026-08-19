import {ARYAN_PROFILE, CONTACT} from '@/content/aryan';

export const SITE_URL =
  process.env.APP_URL || 'http://localhost:3000';

export const SITE_NAME = 'Aryan Navale Portfolio';

export const SITE_DESCRIPTION =
  'Interactive macOS-desktop portfolio of Aryan Navale — final-year B.Tech (AI & Data Science) student at VPKBIET and Software Development Intern at MKCL. Explore projects in LLMs, RAG, AI agents, and full-stack development.';

export const DEFAULT_OG_IMAGE = '/og.png';

export const ORGANIZATION = {
  name: ARYAN_PROFILE.name,
  title: ARYAN_PROFILE.title,
  url: SITE_URL,
  image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
  description: SITE_DESCRIPTION,
  email: CONTACT.email,
  github: CONTACT.github,
  linkedin: CONTACT.linkedin,
  location: ARYAN_PROFILE.location,
} as const;

export const SEO = {
  siteUrl: SITE_URL,
  siteName: SITE_NAME,
  defaultTitle: `${ARYAN_PROFILE.name} — ${ARYAN_PROFILE.title}`,
  titleTemplate: `%s | ${ARYAN_PROFILE.name}`,
  defaultDescription: SITE_DESCRIPTION,
  defaultOgImage: DEFAULT_OG_IMAGE,
  locale: 'en_IN' as const,
  twitterHandle: undefined as string | undefined,
} as const;
