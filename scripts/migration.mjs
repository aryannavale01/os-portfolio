// One-off migration: turns the previously hardcoded project data in
// lib/projectsFS.ts + content/aryan.ts into real folders under
// /content/projects. Generates gradient PNG placeholders (dependency-free PNG
// encoder) and real text-based case-study.pdf files. Safe to delete once run.
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'projects');
const GITHUB = 'https://github.com/aryannavale01';
const BADGE = `[![GitHub](https://img.shields.io/badge/GitHub-Profile-blue?logo=github)](${GITHUB})`;

/* ---------------------------- PNG generation ---------------------------- */

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'latin1');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

const lerp = (a, b, t) => a + (b - a) * t;

function gradientPng(width, height, c1, c2, c3, c4) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  const rowLen = width * 3;
  const raw = Buffer.alloc((rowLen + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (rowLen + 1);
    raw[rowStart] = 0;
    const ty = height <= 1 ? 0 : y / (height - 1);
    for (let x = 0; x < width; x++) {
      const tx = width <= 1 ? 0 : x / (width - 1);
      const top = [lerp(c1[0], c2[0], tx), lerp(c1[1], c2[1], tx), lerp(c1[2], c2[2], tx)];
      const bottom = [lerp(c3[0], c4[0], tx), lerp(c3[1], c4[1], tx), lerp(c3[2], c4[2], tx)];
      const i = rowStart + 1 + x * 3;
      raw[i] = Math.round(lerp(top[0], bottom[0], ty));
      raw[i + 1] = Math.round(lerp(top[1], bottom[1], ty));
      raw[i + 2] = Math.round(lerp(top[2], bottom[2], ty));
    }
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ----------------------------- PDF generation --------------------------- */

function escapePdfText(text) {
  // Helvetica (WinAnsi) can't render emoji/arrows — strip to printable Latin-1.
  const cleaned = String(text)
    .replace(/[^\x20-\x7e\u00a0-\u00ff]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrapText(text, max = 90) {
  const words = escapePdfText(text).split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > max) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines.length ? lines : [''];
}

function renderContent(lines) {
  let out = 'BT\n/F1 10 Tf\n50 730 Td\n14 TL\n';
  for (const line of lines) {
    out += `(${line}) Tj\nT*\n`;
  }
  out += 'ET\n';
  return Buffer.from(out, 'latin1');
}

function buildPdf(pages, { title }) {
  const count = pages.length;
  const pageObjStart = 3;
  const contentObjStart = pageObjStart + count;
  const fontObjIndex = contentObjStart + count; // 1-based object number

  const objects = [];
  objects.push(Buffer.from('<</Type/Catalog/Pages 2 0 R>>'));
  const kids = [];
  for (let i = 0; i < count; i++) kids.push(`${pageObjStart + i} 0 R`);
  objects.push(Buffer.from(`<</Type/Pages/Kids[${kids.join(' ')}]/Count ${count}>>`));
  for (let i = 0; i < count; i++) {
    objects.push(
      Buffer.from(
        `<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 ${fontObjIndex} 0 R>>>>/Contents ${contentObjStart + i} 0 R>>`
      )
    );
  }
  for (let i = 0; i < count; i++) {
    const stream = renderContent(pages[i]);
    objects.push(
      Buffer.concat([
        Buffer.from(`<</Length ${stream.length}>>\nstream\n`),
        stream,
        Buffer.from('\nendstream'),
      ])
    );
  }
  objects.push(Buffer.from('<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>'));

  let pdf = Buffer.from('%PDF-1.4\n');
  const offsets = [];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf = Buffer.concat([pdf, Buffer.from(`${offsets.length} 0 obj\n`), obj, Buffer.from('\nendobj\n')]);
  }
  const xrefStart = pdf.length;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) xref += String(off).padStart(10, '0') + ' 00000 n \n';
  pdf = Buffer.concat([
    pdf,
    Buffer.from(xref),
    Buffer.from(`trailer\n<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF\n`),
  ]);
  return pdf;
}

/* ------------------------- case-study page builders ---------------------- */

function pageLinesFromSections({ title, sections }) {
  const lines = [];
  if (title) {
    lines.push('');
    lines.push(title.toUpperCase());
    lines.push('--------------------------------------------------');
    lines.push('');
  }
  for (const sec of sections) {
    if (sec.heading) lines.push(sec.heading.toUpperCase());
    if (sec.text) lines.push(...wrapText(sec.text));
    if (sec.metrics) {
      for (const m of sec.metrics) lines.push(`* ${m.label}: ${m.value}`);
    }
    if (sec.bullets) {
      for (const b of sec.bullets) lines.push(...wrapText(`- ${b}`));
    }
    lines.push('');
  }
  return lines;
}

function caseStudyPdf(meta, pages) {
  const doc = [];
  doc.push(`CASE STUDY`);
  doc.push(meta.title.toUpperCase());
  doc.push('');
  doc.push('--------------------------------------------------');
  const header = [meta.shortDesc || '', `Category: ${meta.category}`, `Tech: ${meta.techStack.join(', ')}`];
  for (const h of header) doc.push(...wrapText(h));
  doc.push('');
  doc.push('--------------------------------------------------');
  const body = pages.map((p) => pageLinesFromSections(p));
  const pageCount = body.length;
  const pagesOut = body.map((lines, i) => [
    ...doc,
    ...lines,
    `--- Page ${i + 1} of ${pageCount} ---`,
  ]);
  return buildPdf(pagesOut, { title: meta.title });
}

/* ------------------------------- project data ---------------------------- */

const PROJECTS = [
  {
    slug: 'intelligent-ai-assistant',
    title: 'Intelligent AI Assistant',
    category: 'agents',
    shortDesc: 'Autonomous assistant using LLM function calling to automate 10+ daily tasks.',
    fullDesc:
      'An autonomous digital assistant orchestrated with complex LLM function calling that automates daily workflows — email synthesis, calendar management, and system-level control. Re-architected synchronous prompt chains into parallel async retrieval pipelines for faster responses, and integrated Google Vision API for multi-modal input.',
    techStack: ['Python', 'LLM APIs', 'AI Agents', 'Function Calling', 'Google Vision API'],
    highlights: [
      'Automates 10+ daily tasks, 60% less manual effort',
      'API response time reduced 25% (1.8s → 1.35s)',
      '98% accuracy in visual data interpretation',
    ],
    date: '2026-03',
    colors: [
      [59, 130, 246],
      [99, 102, 241],
      [30, 27, 75],
      [67, 56, 202],
    ],
    readme: `# Intelligent AI Assistant

> Autonomous digital assistant orchestrated with complex LLM function calling for daily task automation.

${BADGE}

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
    pdfPages: [
      {
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
  {
    slug: 'emergency-response-system',
    title: 'Real-Time Emergency Response System',
    category: 'fullstack',
    shortDesc: 'Hospital alert platform with sub-200ms notification latency across 5+ units.',
    fullDesc:
      'An end-to-end hospital alert platform using a dual-sync Firebase + local DB architecture. Live data streams synchronize between cloud and local databases in real time with zero data loss during network degradation, backed by a centralized dashboard for live resource tracking and emergency response allocation.',
    techStack: ['JavaScript', 'Firebase Realtime DB', 'Cloud Sync', 'Dashboard'],
    highlights: [
      'Sub-200ms notification latency',
      '99.9% uptime across 5+ hospital units',
      'Zero data loss during network degradation',
    ],
    date: '2026-01',
    colors: [
      [244, 63, 94],
      [249, 115, 22],
      [69, 10, 10],
      [127, 29, 29],
    ],
    readme: `# Real-Time Emergency Response System

> End-to-end hospital alert platform with a dual-sync Firebase + local database architecture.

${BADGE}

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
    pdfPages: [
      {
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
  {
    slug: 'dicom-sharing-platform',
    title: 'Multi-Hospital DICOM Sharing Platform',
    category: 'fullstack',
    shortDesc: 'HIPAA-aware healthcare platform for real-time DICOM image sync across hospitals.',
    fullDesc:
      'A secure, HIPAA-aware healthcare platform enabling real-time DICOM medical image synchronization across 5+ simulated hospital nodes, replacing manual USB/email transfers. Structured metadata indexing cut medical image retrieval latency by 35% and workflow digitization eliminated cross-departmental file transfer bottlenecks.',
    techStack: ['React.js', 'Firebase', 'MySQL', 'DICOM'],
    highlights: [
      'Real-time DICOM sync across 5+ hospital nodes',
      '35% lower image retrieval latency (O(log n) lookups)',
      'HIPAA-aware security',
    ],
    date: '2025-11',
    colors: [
      [45, 212, 191],
      [56, 189, 248],
      [15, 23, 42],
      [8, 145, 178],
    ],
    readme: `# Multi-Hospital DICOM Sharing Platform

> Secure, HIPAA-aware healthcare platform for real-time DICOM medical image synchronization.

${BADGE}

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
    pdfPages: [
      {
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
  {
    slug: 'ngo-erp',
    title: 'NGO ERP System',
    category: 'fullstack',
    shortDesc: 'Full-stack ERP for Rupasri Mahila Vikas Sanstha with trilingual (Hindi, English, Marathi) support.',
    fullDesc:
      'A production-grade management system built for Rupasri Mahila Vikas Sanstha, a rural NGO. Handles member records, transactions, and reporting with role-based access via Better Auth, a Postgres/Supabase data layer with Prisma, and a responsive Next.js 15 dashboard that works in three languages.',
    techStack: ['Next.js 15', 'Prisma', 'Supabase', 'Better Auth', 'PostgreSQL', 'Tailwind CSS'],
    highlights: ['3 languages supported (EN/HI/MR)', 'Real-world NGO deployment'],
    date: '2026-04',
    colors: [
      [52, 211, 153],
      [16, 185, 129],
      [6, 78, 59],
      [4, 120, 87],
    ],
    readme: `# NGO ERP System

> Full-stack management system for Rupasri Mahila Vikas Sanstha, a rural NGO.

${BADGE}

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
    pdfPages: [
      {
        title: 'Problem & Architectural Solution',
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
  {
    slug: 'talktwin',
    title: 'TalkTwin',
    category: 'ai-rag',
    shortDesc: 'AI app for text-to-speech, voice cloning, and lip-syncing across 13 languages.',
    fullDesc:
      'TalkTwin turns text into natural speech and cloned voices with synchronized lip-sync in 13 languages. Built for creators and accessibility use cases, it couples a modern app frontend with AI voice synthesis pipelines and a clean, usable interface.',
    techStack: ['AI Voice Synthesis', 'Text-to-Speech', 'Lip-Sync', 'Flutter', 'Firebase'],
    highlights: ['13 languages supported', 'Voice cloning from short samples'],
    date: '2025-12',
    colors: [
      [168, 85, 247],
      [217, 70, 239],
      [76, 5, 105],
      [112, 26, 117],
    ],
    readme: `# TalkTwin

> AI app that converts text into natural speech, cloned voices, and synchronized lip-sync across 13 languages.

${BADGE}

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
    pdfPages: [
      {
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
  {
    slug: 'smartcitimanage',
    title: 'SmartCitiManage',
    category: 'agents',
    shortDesc: 'Final-year multi-agent AI system combining RAG, IoT and Digital Twin technology for smart cities.',
    fullDesc:
      'SmartCitiManage is a multi-agent AI platform for urban infrastructure monitoring. It fuses IoT sensor streams with RAG-powered knowledge retrieval and a Digital Twin visual model, letting a team of specialized AI agents detect issues and surface recommendations. Built with a team of four.',
    techStack: ['RAG', 'IoT', 'Digital Twin', 'LangChain', 'AI Agents', 'Python'],
    highlights: ['Team of 4 builders', 'RAG + IoT + Digital Twin fusion'],
    date: '2026-08',
    colors: [
      [99, 102, 241],
      [59, 130, 246],
      [30, 58, 138],
      [15, 23, 42],
    ],
    readme: `# SmartCitiManage

> Multi-agent AI platform for smart-city infrastructure, fusing RAG, IoT, and Digital Twin technology.

${BADGE}

---

## 🏙️ What It Does
- **IoT Integration:** Ingestes live sensor streams from city infrastructure.
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
    pdfPages: [
      {
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
];

const DEMO_PROJECT = {
  slug: 'demo-project',
  title: 'Demo Project — Web OS Showcase',
  category: 'fullstack',
  shortDesc: 'A test project validating the filesystem-driven content pipeline.',
  fullDesc:
    'A throwaway project folder used to prove the core promise of this portfolio: adding a project requires zero code changes — just drop a folder with data.json, a README, and optional images + a case-study PDF. This project exercises gallery ordering (numeric prefixes), README rendering, and real-PDF preview in one shot.',
  techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
  highlights: [
    'Zero-code project onboarding from a single folder',
    'Verifies gallery ordering, README rendering & PDF preview',
    'Ships a real case-study.pdf opened via native Preview',
  ],
  date: '2026-08',
  featured: false,
  colors: [
    [129, 140, 248],
    [244, 114, 182],
    [30, 27, 75],
    [76, 29, 149],
  ],
  readme: `# Demo Project — Web OS Showcase

> A filesystem-driven content test: add a folder, ship a project.

${BADGE}

---

## 🧪 What This Verifies
- **Gallery ordering:** images sort alphabetically, so filenames must use numeric prefixes (\`01-\`, \`02-\`, \`03-\`).
- **README rendering:** this markdown renders in the Document Reader's TextEdit-style view.
- **Real PDF preview:** \`case-study.pdf\` opens in native Preview and can be downloaded.
- **Zero code changes:** the build scans \`/content/projects/\` automatically.

## 🗂️ Folder Contents
| File | Purpose |
| --- | --- |
| \`data.json\` | Structured metadata (validated with Zod at build time) |
| \`README.md\` | Long-form case study, rendered as markdown |
| \`01-overview.png\` | First gallery image |
| \`02-architecture.png\` | Second gallery image |
| \`03-results.png\` | Third gallery image |
| \`case-study.pdf\` | Downloadable/viewable case study |

## 🛠️ Tech Stack
- Next.js 15, TypeScript, Tailwind CSS, Framer Motion
`,
  pdfPages: [
    {
      title: 'What This Project Proves',
      sections: [
        {
          heading: 'Zero-Code Onboarding',
          text: 'Adding this project required no component changes. The build-time generator scanned the folder, validated data.json, and wired it into Finder, Spotlight, and the Document Reader.',
          metrics: [
            { label: 'Code Changes', value: 'None' },
            { label: 'Images', value: '3' },
            { label: 'Source', value: 'One Folder' },
          ],
        },
      ],
    },
    {
      title: 'Content System Details',
      sections: [
        {
          heading: 'How It Works',
          text: 'data.json is validated against a Zod schema. Images are served from /public/projects/<slug>/ and sorted alphabetically. The README renders as markdown and the case-study.pdf opens in a native iframe.',
          bullets: [
            'Numeric prefixes (01-, 02-) control gallery order.',
            'Missing README.md only logs a build warning.',
            'Invalid data.json fails the build with a clear message.',
          ],
        },
      ],
    },
  ],
};

/* --------------------------------- main ---------------------------------- */

function dataJsonFor(project) {
  return JSON.stringify(
    {
      title: project.title,
      category: project.category,
      techStack: project.techStack,
      githubUrl: GITHUB,
      liveUrl: null,
      highlights: project.highlights,
      shortDesc: project.shortDesc,
      fullDesc: project.fullDesc,
      date: project.date,
      featured: project.featured ?? true,
    },
    null,
    2
  );
}

function writeProject(project, { imageCount = 2 } = {}) {
  const dir = path.join(CONTENT_DIR, project.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'data.json'), dataJsonFor(project) + '\n', 'utf8');
  fs.writeFileSync(path.join(dir, 'README.md'), project.readme, 'utf8');

  const [c1, c2, c3, c4] = project.colors;
  for (let i = 1; i <= imageCount; i++) {
    fs.writeFileSync(
      path.join(dir, `${String(i).padStart(2, '0')}-${i === 1 ? 'overview' : i === 2 ? 'architecture' : 'results'}.png`),
      gradientPng(1200, 750, c1, c2, c3, c4)
    );
  }

  fs.writeFileSync(path.join(dir, 'case-study.pdf'), caseStudyPdf(project, project.pdfPages));
  console.log(`[migrate] wrote content/projects/${project.slug}/`);
}

fs.mkdirSync(CONTENT_DIR, { recursive: true });

for (const project of PROJECTS) writeProject(project, { imageCount: 2 });
writeProject(DEMO_PROJECT, { imageCount: 3 });

fs.writeFileSync(
  path.join(CONTENT_DIR, 'README.md'),
  `# /content/projects — How to Add a Project

This is the **meta-readme** for the filesystem-driven project system. Adding a new
project requires **zero code changes**: create one folder below this directory and
run \`npm run dev\` (or \`npm run build\`) — the prebuild generator scans, validates,
and wires everything into Finder, Spotlight, the Document Reader, and Resume.

## Folder Structure

Every project is a subfolder named with its slug (kebab-case, lowercase):

\`\`\`
content/projects/
  your-project-slug/
    data.json          <- structured metadata only (schema below)
    README.md          <- long-form case study / write-up (rendered as markdown)
    01-overview.png    <- gallery images ...
    02-architecture.png<- ... sorted ALPHABETICALLY by filename
    case-study.pdf     <- optional downloadable/viewable case study
\`\`\`

The **folder name is the project's slug/id** — never add an \`id\` field to data.json.

## data.json Schema

Validated with Zod at build time (see \`content/schema.ts\`). Invalid data fails the
build with a message naming the project and offending field.

| Field       | Type     | Required | Notes                                        |
| ----------- | -------- | :------: | -------------------------------------------- |
| \`title\`      | string   | yes      | Display name used across the OS              |
| \`category\`   | enum     | yes      | \`ai-rag\`, \`agents\`, \`vision-ml\`, \`fullstack\` |
| \`techStack\`  | string[] | yes      | At least one entry                           |
| \`githubUrl\`  | url/null | yes      | \`null\` if unpublished                        |
| \`liveUrl\`    | url/null | yes      | \`null\` if there is no live deployment        |
| \`highlights\` | string[] | yes      | Impact/metrics bullets                       |
| \`shortDesc\`  | string   | no       | Falls back to \`highlights[0]\`                |
| \`fullDesc\`   | string   | no       | Falls back to the README's first paragraph   |
| \`date\`       | string   | no       | \`YYYY-MM\`; falls back to folder mtime       |
| \`featured\`   | boolean  | no       | Defaults to \`false\`                          |

## Image Ordering — READ THIS

Gallery images are **sorted alphabetically by filename**, so filenames MUST use
numeric prefixes to control order:

\`\`\`
01-dashboard.png   <- first in the gallery
02-flow.png        <- second
03-results.png     <- third
\`\`\`

Supported: \`.png\`, \`.jpg\`, \`.jpeg\`. Images are copied to
\`/public/projects/<slug>/\` by the generator (never commit that folder).
Opening the active image launches the Quick Look overlay; arrow keys navigate.

## PDFs

Any \`*.pdf\` in the folder becomes an openable/downloadable case study. Name it
\`case-study.pdf\` for consistency. It opens in native Preview (iframe) and can be
downloaded from there.

## Error Handling / Conventions

- No \`data.json\` → build fails, naming the folder.
- Invalid schema field → build fails, naming the folder and field.
- No \`README.md\` → build warning only (placeholder write-up is rendered).
- Zero images → the gallery renders nothing gracefully (fine to omit).
- No PDF → no PDF entry (fine to omit).

## Lifecycle

- \`npm run dev\` / \`npm run build\` runs \`scripts/generate-projects.ts\`
  (a predev/prebuild hook): scan → validate → copy assets to \`/public/projects\`
  → emit \`lib/projects.generated.ts\`.
- Both \`lib/projects.generated.ts\` and \`public/projects/\` are gitignored
  derived artifacts.
`,
  'utf8'
);
console.log('[migrate] wrote content/projects/README.md (meta-readme)');
console.log('[migrate] done.');
