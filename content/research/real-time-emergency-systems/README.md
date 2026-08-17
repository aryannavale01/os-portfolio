# Real-Time Emergency Response Systems

Research notes on low-latency hospital alerting — applied in the Real-Time Emergency Response System, a hospital platform streaming live data to a centralized dashboard.

## The Problem

When an accident is detected or a critical alert fires, every second matters. Hospitals need to see live resource status (ambulances, doctors, patients, blood bank), dispatch responses, and survive network degradation without losing events. A traditional request/response backend fails on both counts: it polls slowly, and a dropped connection means lost alerts.

## Architecture: Dual-Sync Cloud + Local Database

The system uses a **dual-sync architecture** — live data streams synchronize between a cloud database (Firebase Realtime Database) and a local database in real time:

- Cloud layer handles cross-unit coordination and central state.
- Local layer keeps each hospital operational even when the network degrades.
- A sync layer reconciles both, so **zero data loss** occurs during network degradation.

## Measured Outcomes

- **Sub-200ms notification latency** — alerts propagate to the dashboard and operators within a fifth of a second.
- **99.9% uptime across 5+ hospital units** — the platform stays available across facilities.
- **Zero data loss during network degradation** — the local-first buffer absorbs disconnects and replays on reconnect.

## What Made the Latency Possible

1. **Event-driven streams over polling** — data is pushed the moment it changes.
2. **Dual-write local + cloud** — reads never block on the network path.
3. **Reconciliation on reconnect** — the local buffer guarantees at-least-once delivery, de-duplicated on apply.

## Transferable Patterns

- **Local-first + sync**: write locally, sync in background — the same pattern that powers offline-capable mobile and desktop apps.
- **Operational dashboards for resource tracking**: a centralized view of live resources (ambulances, doctors, appointments, blood bank) is what lets a small team run a big operation.
- **SLA-driven design**: picking sub-200ms and 99.9% as explicit targets shaped every architecture decision, from transport to storage.
