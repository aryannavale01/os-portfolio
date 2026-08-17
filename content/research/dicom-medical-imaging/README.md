# DICOM Medical Image Sharing

Research notes on medical imaging interoperability — applied in the Multi-Hospital DICOM Sharing Platform, a PACS-style web portal for syncing radiological studies (CT, MRI, X-Ray, Ultrasound) across hospital nodes.

## What DICOM Is

DICOM (Digital Imaging and Communications in Medicine) is the international standard for handling, storing, printing, and transmitting medical imaging information. A DICOM file bundles the pixel data with rich metadata (patient demographics, study/series information, modality, body part) into a single object, which is what makes radiology workflows machine-readable — and what makes them hard to build correctly.

## The Problem Being Solved

Small and mid-size hospitals still move imaging studies between facilities via USB drives, CDs, or email attachments — slow, lossy, and un-auditable. The platform replaces this with a shared, HIPAA-aware portal: hospitals upload DICOM studies once and request/approve/fulfill cross-facility imaging requests with full auditability.

## Architecture

- **Frontend**: React 18 + TypeScript, Vite, Tailwind, shadcn/ui, TanStack Query for server state.
- **Backend**: Appwrite Cloud for database, auth, and storage, with an Express API layer and optional PostgreSQL/Drizzle support.
- **Viewer**: a dedicated `/viewer/:id` route designed for Cornerstone.js / OHIF integration to render study pixel data and metadata.

## Key Design Decisions

- **Structured metadata indexing**: study metadata is indexed (searchable fields: modality, patient, date, status), giving O(log n) lookups instead of linear scans over raw files — measured at ~35% lower image retrieval latency.
- **Patient-centric data model**: records carry demographics, history, allergies, medications, insurance, and imaging files, so a radiology workflow shares the same source of truth as clinical staff.
- **Request/approval workflow**: structured inter-hospital imaging requests with priority levels and live status persisted to the backend.
- **Compliance posture**: upload limits (100MB/file), supported `.dcm`/`.dicom` formats, and HIPAA consent reminders built into the upload UX.

## Latency & Reliability Learnings

Centralizing sync across 5+ hospital nodes and replacing manual file transfer eliminates cross-department bottlenecks. The 35% retrieval-latency win came from indexing metadata separately from pixel data — the same insight that powers any production PACS: *search the catalog, stream the pixels*.
