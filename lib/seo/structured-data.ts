import {ORGANIZATION, SEO} from './config';
import {EDUCATION, SKILLS_CATEGORIZED} from '@/content/aryan';

export function getPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: ORGANIZATION.name,
    jobTitle: ORGANIZATION.title,
    url: SEO.siteUrl,
    image: ORGANIZATION.image,
    email: `mailto:${ORGANIZATION.email}`,
    sameAs: [ORGANIZATION.github, ORGANIZATION.linkedin].filter(Boolean),
    address: {
      '@type': 'PostalAddress',
      addressLocality: ORGANIZATION.location,
    },
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: EDUCATION.college,
    },
    knowsAbout: SKILLS_CATEGORIZED.flatMap((cat) => cat.skills).slice(0, 15),
  };
}

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SEO.siteName,
    url: SEO.siteUrl,
    description: SEO.defaultDescription,
    author: {
      '@type': 'Person',
      name: ORGANIZATION.name,
    },
  };
}
