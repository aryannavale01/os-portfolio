# /content/projects — How to Add a Project

This is the **meta-readme** for the filesystem-driven project system. Adding a new
project requires **zero code changes**: create one folder below this directory and
run `npm run dev` (or `npm run build`) — the prebuild generator scans, validates,
and wires everything into Finder, Spotlight, the Document Reader, and Resume.

## Folder Structure

Every project is a subfolder named with its slug (kebab-case, lowercase):

```
content/projects/
  your-project-slug/
    data.json          <- structured metadata only (schema below)
    README.md          <- long-form case study / write-up (rendered as markdown)
    01-overview.png    <- gallery images ...
    02-architecture.png<- ... sorted ALPHABETICALLY by filename
    case-study.pdf     <- optional downloadable/viewable case study
```

The **folder name is the project's slug/id** — never add an `id` field to data.json.

## data.json Schema

Validated with Zod at build time (see `content/schema.ts`). Invalid data fails the
build with a message naming the project and offending field.

| Field       | Type     | Required | Notes                                        |
| ----------- | -------- | :------: | -------------------------------------------- |
| `title`      | string   | yes      | Display name used across the OS              |
| `category`   | enum     | yes      | `ai-rag`, `agents`, `vision-ml`, `fullstack` |
| `techStack`  | string[] | yes      | At least one entry                           |
| `githubUrl`  | url/null | yes      | `null` if unpublished                        |
| `liveUrl`    | url/null | yes      | `null` if there is no live deployment        |
| `highlights` | string[] | yes      | Impact/metrics bullets                       |
| `shortDesc`  | string   | no       | Falls back to `highlights[0]`                |
| `fullDesc`   | string   | no       | Falls back to the README's first paragraph   |
| `date`       | string   | no       | `YYYY-MM`; falls back to folder mtime       |
| `featured`   | boolean  | no       | Defaults to `false`                          |

## Image Ordering — READ THIS

Gallery images are **sorted alphabetically by filename**, so filenames MUST use
numeric prefixes to control order:

```
01-dashboard.png   <- first in the gallery
02-flow.png        <- second
03-results.png     <- third
```

Supported: `.png`, `.jpg`, `.jpeg`. Images are copied to
`/public/projects/<slug>/` by the generator (never commit that folder).
Opening the active image launches the Quick Look overlay; arrow keys navigate.

## PDFs

Any `*.pdf` in the folder becomes an openable/downloadable case study. Name it
`case-study.pdf` for consistency. It opens in native Preview (iframe) and can be
downloaded from there.

## Error Handling / Conventions

- No `data.json` → build fails, naming the folder.
- Invalid schema field → build fails, naming the folder and field.
- No `README.md` → build warning only (placeholder write-up is rendered).
- Zero images → the gallery renders nothing gracefully (fine to omit).
- No PDF → no PDF entry (fine to omit).

## Lifecycle

- `npm run dev` / `npm run build` runs `scripts/generate-projects.ts`
  (a predev/prebuild hook): scan → validate → copy assets to `/public/projects`
  → emit `lib/projects.generated.ts`.
- Both `lib/projects.generated.ts` and `public/projects/` are gitignored
  derived artifacts.
