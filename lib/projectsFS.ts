import { ProjectFolder, FileItem } from '@/types/mac';
import { ARYAN_PROFILE, SKILLS_CATEGORIZED, RESUME_PROJECTS, EDUCATION, COURSEWORK, ACHIEVEMENTS } from '@/content/aryan';

export interface ProjectCategory {
  id: 'all' | 'ai-rag' | 'agents' | 'vision-ml' | 'fullstack';
  label: string;
  iconName: string;
}

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  { id: 'all', label: 'All Projects', iconName: 'Folder' },
  { id: 'ai-rag', label: 'AI & RAG Architecture', iconName: 'Database' },
  { id: 'agents', label: 'Autonomous AI Agents', iconName: 'Bot' },
  { id: 'vision-ml', label: 'Vision & Edge ML', iconName: 'Cpu' },
  { id: 'fullstack', label: 'Full-Stack AI Tools', iconName: 'Layers' },
];

const GITHUB_BADGE = `[![GitHub](https://img.shields.io/badge/GitHub-Profile-blue?logo=github)](${ARYAN_PROFILE.github})`;

const resumeContact = `${ARYAN_PROFILE.location} • ${ARYAN_PROFILE.email} • github.com/aryannavale01 • linkedin.com/in/aryan-navale-207961291`;

export const DESKTOP_FILES: FileItem[] = [
  {
    id: 'desktop-resume-pdf',
    name: 'Resume.pdf',
    type: 'pdf',
    size: '1.2 MB',
    modifiedDate: 'Today at 8:30 AM',
    pdfData: {
      totalPages: 2,
      title: 'Aryan_Navale_Resume.pdf',
      subtitle: 'Aspiring AI Engineer — Full-Stack Developer',
      pages: [
        {
          pageNumber: 1,
          title: 'Professional Summary & Technical Skills',
          sections: [
            {
              heading: 'Aryan Navale',
              text: resumeContact,
            },
            {
              heading: 'Executive Summary',
              text: ARYAN_PROFILE.summary,
            },
            {
              heading: 'Technical Skills',
              metrics: SKILLS_CATEGORIZED.map((cat) => ({
                label: cat.category,
                value: cat.skills.join(', '),
              })),
            },
          ],
        },
        {
          pageNumber: 2,
          title: 'Projects, Education & Achievements',
          sections: [
            {
              heading: 'Key Projects',
              bullets: RESUME_PROJECTS.map(
                (p) => `${p.title} — ${p.shortDesc} ${p.metrics.join(' | ')}`
              ),
            },
            {
              heading: 'Education',
              text: `${EDUCATION.degree} — ${EDUCATION.college} (${EDUCATION.years})\nRelevant coursework: ${COURSEWORK.join(', ')}`,
            },
            {
              heading: 'Achievements',
              bullets: ACHIEVEMENTS,
            },
          ],
        },
      ],
    },
  },
];

export const PROJECTS_FS: ProjectFolder[] = [
  {
    id: 'intelligent-ai-assistant',
    name: 'Intelligent AI Assistant',
    category: 'agents',
    categoryLabel: 'Autonomous AI Agents',
    icon: 'Bot',
    date: '2026-03',
    shortDesc: 'Autonomous assistant using LLM function calling to automate 10+ daily tasks.',
    files: [
      {
        id: 'ai-assistant-readme',
        name: 'README.md',
        type: 'md',
        size: '12 KB',
        modifiedDate: 'Mar 15, 2026',
        parentFolderId: 'intelligent-ai-assistant',
        content: `# Intelligent AI Assistant

> Autonomous digital assistant orchestrated with complex LLM function calling for daily task automation.

${GITHUB_BADGE}

---

## ⚙️ What It Does
- **Task Automation:** Automates 10+ daily tasks — email synthesis, calendar management, and system-level control.
- **Async Prompt Pipelines:** Re-architected synchronous chains into parallel async retrieval pipelines.
- **Multi-Modal Input:** Google Vision API for visual data interpretation.

## 📈 Impact
- Reduced manual effort by over 60%.
- Improved average API response time by 25% (1.8s → 1.35s).
- 98% accuracy in visual data interpretation.

## 🛠️ Tech Stack
- Python, LLM APIs, AI Agents, Function Calling, Google Vision API
`,
      },
      {
        id: 'ai-assistant-img',
        name: 'Assistant_Architecture.png',
        type: 'png',
        size: '1.3 MB',
        modifiedDate: 'Mar 12, 2026',
        parentFolderId: 'intelligent-ai-assistant',
        imageUrl: 'https://picsum.photos/seed/ai-assistant/1200/800',
      },
      {
        id: 'ai-assistant-pdf',
        name: 'Intelligent_AI_Assistant_Overview.pdf',
        type: 'pdf',
        size: '1.9 MB',
        modifiedDate: 'Mar 10, 2026',
        parentFolderId: 'intelligent-ai-assistant',
        pdfData: {
          totalPages: 2,
          title: 'Intelligent AI Assistant Overview',
          subtitle: 'LLM Function Calling & Multi-Modal Automation',
          pages: [
            {
              pageNumber: 1,
              title: 'System Overview',
              sections: [
                {
                  heading: 'An Autonomous Assistant',
                  text: 'An agent that uses LLM function calling to control tools — email synthesis, calendar management, and system-level operations.',
                  metrics: [
                    { label: 'Tasks Automated', value: '10+' },
                    { label: 'Manual Effort Saved', value: '60%' },
                    { label: 'Vision Accuracy', value: '98%' },
                  ],
                },
              ],
            },
            {
              pageNumber: 2,
              title: 'Performance & Design',
              sections: [
                {
                  heading: 'Async Retrieval Pipelines',
                  text: 'Parallel async chains replaced synchronous prompt sequences, cutting API latency.',
                  bullets: [
                    'API response time reduced 25% (1.8s → 1.35s).',
                    'Google Vision API enables multi-modal input.',
                    'Function calling drives tool use and system control.',
                  ],
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: 'emergency-response-system',
    name: 'Real-Time Emergency Response System',
    category: 'fullstack',
    categoryLabel: 'Full-Stack AI Tools',
    icon: 'Layers',
    date: '2026-01',
    shortDesc: 'Hospital alert platform with sub-200ms latency and 99.9% uptime across 5+ units.',
    files: [
      {
        id: 'emergency-readme',
        name: 'README.md',
        type: 'md',
        size: '12 KB',
        modifiedDate: 'Jan 22, 2026',
        parentFolderId: 'emergency-response-system',
        content: `# Real-Time Emergency Response System

> End-to-end hospital alert platform with a dual-sync Firebase + local database architecture.

${GITHUB_BADGE}

---

## 🏥 Key Features
- **Sub-200ms Alerts:** Emergency notifications delivered to hospital units in under 200ms.
- **Dual-Sync Architecture:** Cloud and local databases sync live with zero data loss during network degradation.
- **Centralized Dashboard:** Live resource tracking and emergency response allocation.

## 📈 Impact
- 99.9% uptime across 5+ hospital units.
- Synchronized live data streams between cloud and local databases in real time.
- Consolidated resource tracking and response allocation in one dashboard.

## 🛠️ Tech Stack
- JavaScript, Firebase Realtime DB, Cloud Sync
`,
      },
      {
        id: 'emergency-img',
        name: 'Response_Dashboard.png',
        type: 'png',
        size: '1.5 MB',
        modifiedDate: 'Jan 18, 2026',
        parentFolderId: 'emergency-response-system',
        imageUrl: 'https://picsum.photos/seed/emergency-dash/1200/800',
      },
      {
        id: 'emergency-pdf',
        name: 'Emergency_Response_Architecture.pdf',
        type: 'pdf',
        size: '2.0 MB',
        modifiedDate: 'Jan 15, 2026',
        parentFolderId: 'emergency-response-system',
        pdfData: {
          totalPages: 2,
          title: 'Real-Time Emergency Response Architecture',
          subtitle: 'Hospital Alert Platform with Dual-Sync DB',
          pages: [
            {
              pageNumber: 1,
              title: 'System Overview',
              sections: [
                {
                  heading: 'Hospital Alert Platform',
                  text: 'A real-time alerting platform for hospitals with a dual-sync Firebase + local database architecture.',
                  metrics: [
                    { label: 'Latency', value: '< 200ms' },
                    { label: 'Uptime', value: '99.9%' },
                    { label: 'Units', value: '5+' },
                  ],
                },
              ],
            },
            {
              pageNumber: 2,
              title: 'Resilience & Dashboard',
              sections: [
                {
                  heading: 'Zero Data Loss Sync',
                  text: 'Live streams synchronize between cloud and local databases even during network degradation.',
                  bullets: [
                    'Centralized dashboard for live resource tracking.',
                    'Emergency response allocation in real time.',
                    'Dual-sync guarantees zero data loss.',
                  ],
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: 'dicom-sharing-platform',
    name: 'Multi-Hospital DICOM Sharing Platform',
    category: 'vision-ml',
    categoryLabel: 'Vision & Edge ML',
    icon: 'Cpu',
    date: '2025-11',
    shortDesc: 'HIPAA-aware healthcare platform for real-time DICOM image sync across hospitals.',
    files: [
      {
        id: 'dicom-readme',
        name: 'README.md',
        type: 'md',
        size: '13 KB',
        modifiedDate: 'Nov 20, 2025',
        parentFolderId: 'dicom-sharing-platform',
        content: `# Multi-Hospital DICOM Sharing Platform

> Secure, HIPAA-aware healthcare platform for real-time DICOM medical image synchronization.

${GITHUB_BADGE}

---

## 🩺 Key Features
- **Real-Time Sync:** DICOM images sync across 5+ simulated hospital nodes in real time.
- **Structured Indexing:** Metadata indexes replace manual USB/email file transfers.
- **HIPAA-Aware Security:** Designed with healthcare compliance in mind.

## 📈 Impact
- Reduced medical image retrieval latency by 35% via structured metadata indexing (O(log n) lookups vs full-collection scans).
- Eliminated cross-departmental file transfer bottlenecks through workflow digitization.

## 🛠️ Tech Stack
- React.js, Firebase, MySQL, DICOM
`,
      },
      {
        id: 'dicom-img',
        name: 'DICOM_Sync_Network.png',
        type: 'png',
        size: '1.6 MB',
        modifiedDate: 'Nov 16, 2025',
        parentFolderId: 'dicom-sharing-platform',
        imageUrl: 'https://picsum.photos/seed/dicom-network/1200/800',
      },
      {
        id: 'dicom-pdf',
        name: 'DICOM_Platform_CaseStudy.pdf',
        type: 'pdf',
        size: '2.1 MB',
        modifiedDate: 'Nov 12, 2025',
        parentFolderId: 'dicom-sharing-platform',
        pdfData: {
          totalPages: 2,
          title: 'Multi-Hospital DICOM Sharing Platform',
          subtitle: 'HIPAA-Aware Medical Image Sync',
          pages: [
            {
              pageNumber: 1,
              title: 'Problem & Solution',
              sections: [
                {
                  heading: 'Replacing Manual Transfers',
                  text: 'Hospitals shared DICOM images via USB/email. This platform digitizes the workflow with real-time sync across nodes.',
                  metrics: [
                    { label: 'Nodes', value: '5+' },
                    { label: 'Latency Cut', value: '35%' },
                    { label: 'Security', value: 'HIPAA-Aware' },
                  ],
                },
              ],
            },
            {
              pageNumber: 2,
              title: 'Architecture & Results',
              sections: [
                {
                  heading: 'Structured Metadata Indexing',
                  text: 'O(log n) lookups vs full-collection scans cut retrieval latency by 35%.',
                  bullets: [
                    'Real-time DICOM sync across hospital nodes.',
                    'Workflow digitization removed transfer bottlenecks.',
                    'React.js frontend with Firebase + MySQL backend.',
                  ],
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: 'ngo-erp',
    name: 'NGO ERP System',
    category: 'fullstack',
    categoryLabel: 'Full-Stack AI Tools',
    icon: 'Layers',
    date: '2026-04',
    shortDesc: 'Trilingual full-stack ERP for Rupasri Mahila Vikas Sanstha.',
    files: [
      {
        id: 'ngo-erp-readme',
        name: 'README.md',
        type: 'md',
        size: '16 KB',
        modifiedDate: 'Apr 20, 2026',
        parentFolderId: 'ngo-erp',
        content: `# NGO ERP System

> Full-stack management system for Rupasri Mahila Vikas Sanstha, a rural NGO.

${GITHUB_BADGE}

---

## 🏗️ Key Features
- **Trilingual UI:** Hindi, English, and Marathi with seamless language switching.
- **Member & Transaction Management:** Centralized records for members, donations, and activities.
- **Role-Based Access:** Secure authentication and authorization via Better Auth.
- **Reporting Dashboard:** Clear insights for the organization's leadership.

## 🛠️ Tech Stack
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Backend & Data:** Prisma, Supabase, PostgreSQL
- **Auth:** Better Auth

## 📈 Impact
- Built for a real NGO, supporting daily operations across three languages.
`,
      },
      {
        id: 'ngo-erp-img',
        name: 'Dashboard_Preview.png',
        type: 'png',
        size: '1.2 MB',
        modifiedDate: 'Apr 18, 2026',
        parentFolderId: 'ngo-erp',
        imageUrl: 'https://picsum.photos/seed/ngo-erp-dash/1200/800',
      },
      {
        id: 'ngo-erp-pdf',
        name: 'NGO_ERP_CaseStudy.pdf',
        type: 'pdf',
        size: '2.2 MB',
        modifiedDate: 'Apr 15, 2026',
        parentFolderId: 'ngo-erp',
        pdfData: {
          totalPages: 2,
          title: 'NGO ERP System Case Study',
          subtitle: 'Trilingual Management Platform for a Rural NGO',
          pages: [
            {
              pageNumber: 1,
              title: 'Problem & Solution',
              sections: [
                {
                  heading: '1. Problem Overview',
                  text: 'Rupasri Mahila Vikas Sanstha needed a modern system to manage members, transactions, and reporting — usable by staff who work in Hindi, English, and Marathi.',
                },
                {
                  heading: '2. Architectural Solution',
                  text: 'Built a Next.js 15 full-stack app with a Supabase/PostgreSQL data layer via Prisma, Better Auth for role-based access, and a fully trilingual UI.',
                  metrics: [
                    { label: 'Languages', value: 'EN / HI / MR' },
                    { label: 'Data Layer', value: 'Prisma + Supabase' },
                    { label: 'Auth', value: 'Better Auth' },
                  ],
                },
              ],
            },
            {
              pageNumber: 2,
              title: 'Key Modules & Results',
              sections: [
                {
                  heading: 'Core Modules',
                  text: 'Member registry, donation and transaction tracking, activity management, and role-based dashboards.',
                  bullets: [
                    'Trilingual content with instant language switching.',
                    'Secure role-based access control across the organization.',
                    'Responsive dashboard for desktop and mobile use.',
                  ],
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: 'talktwin',
    name: 'TalkTwin',
    category: 'ai-rag',
    categoryLabel: 'AI & RAG Architecture',
    icon: 'Database',
    date: '2025-12',
    shortDesc: 'AI app for text-to-speech, voice cloning, and lip-syncing in 13 languages.',
    files: [
      {
        id: 'talktwin-readme',
        name: 'README.md',
        type: 'md',
        size: '12 KB',
        modifiedDate: 'Dec 10, 2025',
        parentFolderId: 'talktwin',
        content: `# TalkTwin

> AI app that converts text into natural speech, cloned voices, and synchronized lip-sync across 13 languages.

${GITHUB_BADGE}

---

## 🎙️ Key Highlights
- **Text-to-Speech:** Natural, expressive speech synthesis.
- **Voice Cloning:** Recreate a voice from short reference samples.
- **Lip-Sync:** Synchronized visuals for talking characters/avatars.
- **13 Languages:** Broad multilingual coverage out of the box.

## 🛠️ Tech Stack
- AI voice synthesis pipelines
- Flutter app frontend
- Firebase for backend services
`,
      },
      {
        id: 'talktwin-img',
        name: 'TalkTwin_Preview.png',
        type: 'png',
        size: '1.5 MB',
        modifiedDate: 'Dec 08, 2025',
        parentFolderId: 'talktwin',
        imageUrl: 'https://picsum.photos/seed/talktwin-preview/1200/800',
      },
      {
        id: 'talktwin-pdf',
        name: 'TalkTwin_Product_Overview.pdf',
        type: 'pdf',
        size: '1.8 MB',
        modifiedDate: 'Dec 05, 2025',
        parentFolderId: 'talktwin',
        pdfData: {
          totalPages: 2,
          title: 'TalkTwin Product Overview',
          subtitle: 'Voice AI for Text-to-Speech, Cloning & Lip-Sync',
          pages: [
            {
              pageNumber: 1,
              title: 'What TalkTwin Does',
              sections: [
                {
                  heading: 'Voice AI Product',
                  text: 'TalkTwin turns text into speech, clones voices from short samples, and generates lip-synced output for characters and avatars.',
                  metrics: [
                    { label: 'Languages', value: '13' },
                    { label: 'Modes', value: 'TTS + Cloning' },
                    { label: 'Visuals', value: 'Lip-Sync' },
                  ],
                },
              ],
            },
            {
              pageNumber: 2,
              title: 'Use Cases & Architecture',
              sections: [
                {
                  heading: 'Use Cases',
                  text: 'Content creation, accessibility, e-learning, and entertainment.',
                  bullets: [
                    'Multilingual voiceovers for creators.',
                    'Accessible narration for reading tools.',
                    'Avatar/character lip-syncing for video.',
                  ],
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: 'smartcitimanage',
    name: 'SmartCitiManage',
    category: 'agents',
    categoryLabel: 'Autonomous AI Agents',
    icon: 'Bot',
    date: '2026-08',
    shortDesc: 'Final-year multi-agent AI system: RAG + IoT + Digital Twin for smart cities.',
    files: [
      {
        id: 'smartciti-readme',
        name: 'README.md',
        type: 'md',
        size: '14 KB',
        modifiedDate: 'Aug 02, 2026',
        parentFolderId: 'smartcitimanage',
        content: `# SmartCitiManage

> Multi-agent AI platform for smart-city infrastructure, fusing RAG, IoT, and Digital Twin technology.

${GITHUB_BADGE}

---

## 🏙️ What It Does
- **IoT Integration:** Ingests live sensor streams from city infrastructure.
- **RAG Knowledge:** Retrieval-augmented answers grounded in domain documents.
- **Digital Twin:** A visual model of the physical environment for monitoring.
- **Multi-Agent Orchestration:** Specialized AI agents detect issues and surface recommendations.

## 🛠️ Tech Stack
- RAG, LangChain, and AI agent orchestration
- IoT data pipelines
- Digital Twin visualization
- Python

## 👥 Team
Built with a team of four as a final-year B.Tech project.
`,
      },
      {
        id: 'smartciti-img',
        name: 'DigitalTwin_Dashboard.png',
        type: 'png',
        size: '1.7 MB',
        modifiedDate: 'Jul 30, 2026',
        parentFolderId: 'smartcitimanage',
        imageUrl: 'https://picsum.photos/seed/smartciti-twin/1200/800',
      },
      {
        id: 'smartciti-pdf',
        name: 'SmartCitiManage_Architecture.pdf',
        type: 'pdf',
        size: '2.6 MB',
        modifiedDate: 'Jul 28, 2026',
        parentFolderId: 'smartcitimanage',
        pdfData: {
          totalPages: 2,
          title: 'SmartCitiManage System Architecture',
          subtitle: 'Multi-Agent AI for Smart-City Infrastructure',
          pages: [
            {
              pageNumber: 1,
              title: 'System Overview',
              sections: [
                {
                  heading: 'Fusing RAG, IoT & Digital Twins',
                  text: 'IoT sensors stream live data while RAG grounds the AI agents in domain knowledge. A Digital Twin visualizes the physical environment in real time.',
                  metrics: [
                    { label: 'Agents', value: 'Multi-Agent' },
                    { label: 'Data', value: 'IoT Streams' },
                    { label: 'Model', value: 'Digital Twin' },
                  ],
                },
              ],
            },
            {
              pageNumber: 2,
              title: 'Agent Orchestration',
              sections: [
                {
                  heading: 'Specialized Agent Roles',
                  text: 'Each agent handles a domain — monitoring, analysis, and recommendations — coordinated to give operators actionable insights.',
                  bullets: [
                    'RAG-grounded knowledge retrieval for reliable answers.',
                    'IoT anomaly detection across infrastructure.',
                    'Digital Twin visualization for situational awareness.',
                  ],
                },
              ],
            },
          ],
        },
      },
    ],
  },
];
