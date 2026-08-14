import { NoteItem } from '@/types/mac';

// Email is assembled from parts so a naive source/bundle scrape of the repo
// does not pick up a contiguous address string (the UI still renders it whole).
const EMAIL_LOCAL = 'aryannavale99';
const EMAIL_DOMAIN = 'gmail';
const EMAIL_TLD = 'com';

export const ARYAN_PROFILE = {
  name: 'Aryan Navale',
  title: 'Aspiring AI Engineer — Full-Stack Developer',
  role: 'Aspiring AI Engineer — Full-Stack Developer',
  tagline:
    'AI & Data Science student building AI-powered applications, intelligent assistants, and real-time systems with Python and modern web technologies.',
  location: 'Maharashtra, India',
  email: `${EMAIL_LOCAL}@${EMAIL_DOMAIN}.${EMAIL_TLD}`,
  github: 'https://github.com/aryannavale01',
  linkedin: 'https://linkedin.com/in/aryan-navale-207961291',
  twitter: 'https://x.com',
  status: 'Open to AI/ML & Software Development opportunities',
  avatar: '/logo.png',
  summary: `Artificial Intelligence & Data Science student with a strong foundation in data analysis, statistics, and machine learning. Experienced in building AI-powered applications, intelligent assistants, and real-time systems using Python and modern web technologies. Focused on engineering high-impact, automated systems to solve complex real-world challenges through practical and scalable solutions.`,
  systemSpecs: {
    chip: 'AMD Ryzen 7 7840HS (8-core, 16-thread)',
    memory: '16 GB DDR5-5600',
    storage: '1 TB NVMe Gen4 SSD',
    os: 'Windows 11 Pro (Build 26100)',
  },
};

export const CONTACT = {
  email: ARYAN_PROFILE.email,
  github: ARYAN_PROFILE.github,
  linkedin: ARYAN_PROFILE.linkedin,
};

export const EDUCATION = {
  degree: 'B.Tech in Artificial Intelligence & Data Science',
  college:
    "Vidya Pratishthan's Kamalnayan Bajaj Institute of Engineering & Technology (VPKBIET), Baramati, India",
  years: '2023 – 2027',
};

export const COURSEWORK = [
  'Machine Learning',
  'Data Structures & Algorithms',
  'Database Systems',
  'Computer Vision',
  'Statistics for Data Science',
];

export const ACHIEVEMENTS = [
  'Ranked in the top 5% at university-level technical hackathons focused on AI-driven automation and healthcare accessibility.',
  'Deployed 3+ full-stack production applications on Vercel and Firebase, managing real-world user data with secure auth flows and structured database rules.',
  'Built all three major projects end-to-end independently, demonstrating full-stack ownership.',
];

export const SKILLS_CATEGORIZED = [
  {
    category: 'Languages',
    skills: ['Python', 'C++', 'JavaScript', 'SQL', 'HTML5', 'CSS3'],
  },
  {
    category: 'Frameworks & Libraries',
    skills: ['React.js', 'Tailwind CSS', 'Flask', 'Streamlit', 'Pandas', 'NumPy'],
  },
  {
    category: 'AI / ML',
    skills: [
      'Machine Learning',
      'Statistical Analysis',
      'Feature Engineering',
      'Large Language Models (LLMs)',
      'Retrieval-Augmented Generation (RAG)',
      'AI Agents',
      'Function Calling',
      'LLM API Integration',
      'Exploratory Data Analysis (EDA)',
      'Model Evaluation',
    ],
  },
  {
    category: 'Databases & Cloud',
    skills: ['MySQL', 'MongoDB', 'Firebase', 'Vercel'],
  },
  {
    category: 'Developer Tools',
    skills: ['VS Code', 'Git', 'GitHub', 'Docker', 'Jupyter Notebook', 'MySQL Workbench'],
  },
  {
    category: 'Soft Skills',
    skills: ['Problem-Solving', 'Technical Communication', 'Analytical Thinking'],
  },
];

export const RESUME_PROJECT_IDS = [
  'intelligent-ai-assistant',
  'emergency-response-system',
  'dicom-sharing-platform',
];

// NOTE: project content no longer lives here. It is read from
// /content/projects/<slug>/data.json at build time (see lib/getProjects.ts) and
// surfaced to the UI as PROJECTS_DATA / RESUME_PROJECTS via lib/data.ts.

export const NOTES_DATA: NoteItem[] = [
  {
    id: 'about-me',
    title: 'About Me',
    date: 'Aug 13, 2026 at 10:42 AM',
    category: 'PINNED',
    folderId: 'notes',
    isPinned: true,
    sortOrder: 0,
    content: `Hi there! I'm Aryan Navale, an aspiring AI Engineer and full-stack developer from Maharashtra, India, pursuing my B.Tech in Artificial Intelligence & Data Science at VPKBIET, Baramati.

${ARYAN_PROFILE.summary}

### What Drives Me
> "The most interesting problems live where AI meets real-world products — models are only useful when they ship."

### Primary Focus Areas
- **AI & ML:** Machine learning, LLMs, RAG, AI agents, function calling, and statistical analysis.
- **Full-Stack:** React.js, Next.js, Flask, Streamlit, Firebase, and Vercel.
- **Languages:** Python, C++, JavaScript, SQL.

### Highlights
- Ranked in the top 5% at university-level technical hackathons.
- Deployed 3+ full-stack production applications on Vercel and Firebase.
- Built all three major projects end-to-end independently.

### Connect With Me
- [GitHub — @aryannavale01](${ARYAN_PROFILE.github})
- [LinkedIn — Aryan Navale](${ARYAN_PROFILE.linkedin})

Feel free to explore the Finder, run commands in the Terminal, or reach out via Mail!`,
  },
  {
    id: 'quick-ideas',
    title: 'Build Checklist',
    date: 'Today at 9:15 AM',
    category: 'QUICK_NOTES',
    folderId: 'quick-notes',
    isPinned: true,
    content: `# Current Build Checklist
- [x] Ship Intelligent AI Assistant (LLM function calling + Google Vision)
- [x] Ship Real-Time Emergency Response System
- [x] Ship Multi-Hospital DICOM Sharing Platform
- [ ] Wrap up SmartCitiManage digital-twin demo
- [ ] Publish project write-ups for all six projects`,
  },
  {
    id: 'education-research',
    title: 'Education & Achievements',
    date: 'Yesterday at 3:15 PM',
    category: 'NOTES',
    folderId: 'work',
    content: `### Education
- **B.Tech in Artificial Intelligence & Data Science**
  *VPKBIET, Baramati, India* | 2023 – 2027

### Relevant Coursework
- Machine Learning, Data Structures & Algorithms, Database Systems, Computer Vision, Statistics for Data Science

### Achievements
- Ranked in the top 5% at university-level technical hackathons focused on AI-driven automation and healthcare accessibility.
- Deployed 3+ full-stack production applications on Vercel and Firebase, managing real-world user data with secure auth flows and structured database rules.
- Built all three major projects end-to-end independently, demonstrating full-stack ownership.`,
  },
  {
    id: 'current-interests',
    title: 'Current Interests',
    date: 'Mon at 8:20 AM',
    category: 'NOTES',
    folderId: 'work',
    content: `### What I'm currently working on:
1. **LLMs & AI Agents:** Function calling, RAG pipelines, and agentic automation.
2. **Smart Cities:** My final-year project fusing RAG, IoT sensor streams, and Digital Twin modeling.
3. **Voice AI:** Extending TalkTwin's text-to-speech and voice-cloning pipelines.
4. **Healthcare Tech:** DICOM-based medical imaging workflows and emergency response platforms.`,
  },
  {
    id: 'tech-stack-summary',
    title: 'Tech Stack & Tooling',
    date: 'Oct 12, 2025 at 4:10 PM',
    category: 'NOTES',
    folderId: 'notes',
    content: `### Languages
- Python, C++, JavaScript, SQL, HTML5, CSS3

### Frameworks & Libraries
- React.js, Tailwind CSS, Flask, Streamlit, Pandas, NumPy

### AI / ML
- Machine Learning, Statistical Analysis, Feature Engineering, LLMs, RAG, AI Agents, Function Calling, EDA, Model Evaluation

### Databases & Cloud
- MySQL, MongoDB, Firebase, Vercel

### Developer Tools
- VS Code, Git, GitHub, Docker, Jupyter Notebook, MySQL Workbench`,
  },
];

export const PORTFOLIO_INFO = ARYAN_PROFILE;
