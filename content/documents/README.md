# /content/documents — How to Add a Document

This is the **meta-readme** for the filesystem-driven document system. Every PDF
you drop here appears automatically as a desktop icon and in Finder's
**Documents** sidebar, the **Document Reader** library, and the **Preview**
viewer. No code changes, no hardcoded HTML documents.

## Folder Structure

Each document is a subfolder named with its slug (kebab-case, lowercase):

```
content/documents/
  resume/
    Resume.pdf          <- the real PDF (name it whatever you like)
  cv/
    CV.pdf
  cover-letter/
    CoverLetter.pdf
```

- The **folder name is the document's slug/id**.
- The first `*.pdf` inside the folder becomes the document.
- The **PDF's filename is what shows on the desktop** (like a real Finder).
- Drop your real files in — the generator only copies what exists, and folders
  without a PDF are simply skipped. No placeholder PDFs are ever generated.

## Lifecycle

- `npm run dev` / `npm run build` runs `scripts/generate-documents.ts`
  (a predev/prebuild hook): scan folders → copy each PDF to
  `/public/documents/<slug>/` → emit `lib/documents.generated.ts`.
- Both `lib/documents.generated.ts` and `public/documents/` are gitignored
  derived artifacts.

To add a document: create a folder here, drop a PDF into it, re-run `npm run dev`.
