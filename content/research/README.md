# /content/research — How to Add a Research Topic

This is the **meta-readme** for the filesystem-driven Research library. Every
folder you create here becomes a topic inside the desktop **Research** folder
(and Finder's Research sidebar entry). Zero code changes required.

## Folder Structure

Each topic is a subfolder named with its slug (kebab-case, lowercase):

```
content/research/
  llm-rag/
    README.md           <- topic overview / notes (rendered in Document Reader)
    01-architecture.png <- optional images (alphabetical order for the gallery)
    paper.pdf           <- optional PDFs (open in Preview)
```

- The **folder name becomes the topic title** (kebab-case → Title Case).
- `README.md` is optional — its first paragraph is used as the description and
  it is always openable from the folder.
- Any `*.pdf` becomes an openable/downloadable document; any `*.png|jpg|jpeg`
  feeds the gallery.

## Lifecycle

- `npm run dev` / `npm run build` runs `scripts/generate-research.ts`
  (a predev/prebuild hook): scan folders → copy assets to
  `/public/research/<slug>/` → emit `lib/research.generated.ts`.
- `lib/research.generated.ts` and `public/research/` are gitignored derived
  artifacts.

To add a topic: create a folder here with a README (and optional images/PDFs),
then re-run `npm run dev`.
