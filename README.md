# macOS AI Developer Portfolio

An interactive macOS desktop simulation portfolio — draggable windows, a dock,
Spotlight, and a fully working **Finder** that is driven entirely by folders on
disk. Built with Next.js, React, TypeScript, Tailwind CSS, and Framer Motion.

## Run Locally

**Prerequisites:** Node.js

```bash
npm install
npm run dev        # development server (regenerates project content first)
npm run build      # production build (also regenerates content)
npm run start      # serve the standalone production build
npm run lint       # eslint
```

`npm run dev` and `npm run build` both run the project-content generator first
(`predev`/`prebuild` hooks in `package.json`).

## Filesystem-Driven Projects

Projects are defined entirely by folders under [`content/projects/`](./content/projects):

- Each folder's name is the project's slug.
- `data.json` holds structured metadata, validated against a Zod schema
  ([`content/schema.ts`](./content/schema.ts)).
- `README.md` is the long-form case study, rendered in the Document Reader.
- `NN-*.png|jpg|jpeg` images feed the sliding gallery (numeric prefixes control order).
- `*.pdf` files open as downloadable case studies in Preview.

**Adding a project requires zero code changes** — create one folder and re-run
`npm run dev` or `npm run build`. The generator scans, validates, copies images/PDFs
to `public/projects/<slug>/`, and emits `lib/projects.generated.ts`.

Read **[`content/projects/README.md`](./content/projects/README.md)** for the full
folder structure, schema table, and conventions.

## Filesystem-Driven Documents (CV, Resume, Cover Letter)

Documents shown on the desktop (and in Finder's Documents sidebar / the Document
Reader / Preview) are also filesystem-driven — **no HTML-crafted PDFs**. Drop a
real PDF into a folder under [`content/documents/`](./content/documents) and it
appears on the desktop on the next `npm run dev`:

- Each folder's name is the document's slug.
- The first `*.pdf` inside becomes the document; the PDF filename is the label.
- `scripts/generate-documents.ts` copies the PDF to `/public/documents/<slug>/`
  and emits `lib/documents.generated.ts` (both gitignored).

**You supply the PDFs** — the generator never creates placeholder files. Folders
without a PDF are simply skipped. See
**[`content/documents/README.md`](./content/documents/README.md)**.

## Filesystem-Driven Research Library

The **Research** folder on the desktop opens Finder at a research library driven
entirely by [`content/research/`](./content/research):

- Each folder's name becomes a research topic (kebab-case → Title Case).
- `README.md` holds the notes; its first paragraph is the topic description.
- Optional `*.pdf` files open in Preview; optional images feed the gallery.
- `scripts/generate-research.ts` copies assets to `/public/research/<slug>/` and
  emits `lib/research.generated.ts` (gitignored).

Research topics also appear in Finder's Research Library favorite and the
Document Reader. See
**[`content/research/README.md`](./content/research/README.md)**.

## Tech Stack

- **Next.js 15** (App Router, `output: 'standalone'`)
- **React 19**, TypeScript (strict)
- **Tailwind CSS 4** + `@tailwindcss/typography`
- **Framer Motion** (`motion`) for window/overlay/gallery animations
- **Zod** for build-time data validation
- **react-markdown** for README rendering

## Production Deployment (Vercel)

The repo is Vercel-ready (`vercel.json` included). Set these environment
variables in the Vercel project dashboard:

| Variable      | Required | Purpose                                                                 |
| ------------- | :------: | ----------------------------------------------------------------------- |
| `GROQ_API_KEY`| yes      | Powers the "Ask AI" assistant (create at https://console.groq.com)       |
| `APP_URL`     | yes      | Canonical URL (Open Graph + sitemap). E.g. `https://your-site.vercel.app`|

`vercel.json` opts the `/api/ask-ai` function into Fluid Compute with a 60s
`maxDuration` safety margin for cold starts. No other config is needed — the
content generators run as a `prebuild` hook on every build.

## Local Production Run

```bash
npm run build      # runs content generators, then compiles
npm run start      # runs prestart (copies public/ into standalone) + node server
```

> **Note:** the standalone server defaults to port `3000`. If that port is busy
> locally, run with `$env:PORT=<other>` (PowerShell) or `PORT=<other> npm run
> start`.
