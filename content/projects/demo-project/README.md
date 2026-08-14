# Demo Project — Web OS Showcase

> A filesystem-driven content test: add a folder, ship a project.

[![GitHub](https://img.shields.io/badge/GitHub-Profile-blue?logo=github)](https://github.com/aryannavale01)

---

## 🧪 What This Verifies
- **Gallery ordering:** images sort alphabetically, so filenames must use numeric prefixes (`01-`, `02-`, `03-`).
- **README rendering:** this markdown renders in the Document Reader's TextEdit-style view.
- **Real PDF preview:** `case-study.pdf` opens in native Preview and can be downloaded.
- **Zero code changes:** the build scans `/content/projects/` automatically.

## 🗂️ Folder Contents
| File | Purpose |
| --- | --- |
| `data.json` | Structured metadata (validated with Zod at build time) |
| `README.md` | Long-form case study, rendered as markdown |
| `01-overview.png` | First gallery image |
| `02-architecture.png` | Second gallery image |
| `03-results.png` | Third gallery image |
| `case-study.pdf` | Downloadable/viewable case study |

## 🛠️ Tech Stack
- Next.js 15, TypeScript, Tailwind CSS, Framer Motion
