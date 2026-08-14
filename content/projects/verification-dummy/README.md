# Verification Dummy — Content Pipeline Test

> A throwaway project proving the core promise of the filesystem-driven content
> system: adding a project requires **zero code changes** — just a folder.

---

## 🧪 What This Verifies

- **Gallery ordering:** images are sorted alphabetically, so filenames use numeric
  prefixes (`01-`, `02-`, `03-`). The gallery must render them in exactly that order.
- **Category wiring:** this folder's `category` flows into the Finder sidebar filter
  with no hardcoded component changes.
- **README rendering:** this markdown renders in the Document Reader's TextEdit-style view.
- **PDF preview:** `case-study.pdf` opens in native Preview and can be downloaded.

## 🗂️ Folder Contents

| File | Purpose |
| --- | --- |
| `data.json` | Structured metadata (validated with Zod at build time) |
| `README.md` | Long-form case study, rendered as markdown |
| `01-dashboard.png` | First gallery image |
| `02-flow-diagram.png` | Second gallery image |
| `03-results.png` | Third gallery image |
| `case-study.pdf` | Downloadable/viewable case study |

## 🛠️ Tech Stack

- Next.js 15, TypeScript, Tailwind CSS, Framer Motion
