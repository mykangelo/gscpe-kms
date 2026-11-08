# GSCPE Knowledge Management System

A web-based knowledge management system for the **PUP Graduate School — Computer Engineering (GSCPE)** program. It brings policies, guidelines, procedures, forms, enrollment steps, and program information into one searchable place, with a university assistant and document summaries.

> **Status: UI prototype.**
> The interface is fully navigable, but data currently lives in React state and is not yet connected to Supabase. The "Staff access" control is a UI toggle, **not real authentication**.

## Contents

- [Overview](#overview)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Current views](#current-views)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Local Supabase](#local-supabase)
- [Environment variables](#environment-variables)
- [Roadmap](#roadmap)
- [Conventions](#conventions)

## Overview

The app is a pnpm monorepo. The user-facing product lives in `apps/web`, a Next.js App Router application. The original design prototype is kept at [`docs/mock/3.html`](docs/mock/3.html) as a reference; the live UI is a React port of that prototype.

Current capabilities:

- Landing page with search and feature index
- Document repository with keyword search, category filters, and simulated AI summaries
- University Assistant chat with suggested questions
- Enrollment checklist with per-step progress
- Policies accordion
- Program information
- Staff document management (add/remove) behind a prototype toggle

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | Node.js **26.13.0** (`.node-version`) |
| Package manager | pnpm **12.18.0** (`packageManager`) |
| Web framework | Next.js **16.4.5** (App Router, Turbopack) |
| UI | React **19.3.0**, TypeScript **5** |
| Styling | Tailwind CSS **4** + custom scoped CSS (`gscpe.css`) |
| Fonts | DM Sans + Instrument Serif via `next/font` |
| Database / Auth / Storage | Supabase (local config committed, schema pending) |
| Ingestion service | `services/ingest` (reserved, not implemented) |

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│ Browser                                                  │
│   /  → one page, hash-based views for now                │
└───────────────────────────┬──────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────┐
│ apps/web — Next.js 16 / React 19                         │
│                                                          │
│   src/app/page.tsx    client UI + in-memory view state   │
│   src/app/gscpe.css   scoped design system               │
│   src/app/layout.tsx  fonts, metadata, HTML shell        │
│                                                          │
│   Planned: route-per-view, Server Components,            │
│            Server Actions / Route Handlers               │
└───────────────┬──────────────────────────────┬───────────┘
                │                              │
┌───────────────▼──────────────┐  ┌────────────▼───────────┐
│ Supabase (local)             │  │ services/ingest        │
│ Postgres · Auth · Storage    │  │ (planned)              │
│ Studio · Edge runtime        │  │ document ingestion     │
└──────────────────────────────┘  └────────────────────────┘
```

**Data flow today:** the browser holds all state in the `page.tsx` client component. There are no API calls and no persistence. Reloading resets the app.

**Planned data flow:** Next.js Server Components fetch data from Supabase; interactive pieces remain client components; writes go through Server Actions or Route Handlers with Supabase Auth + Row Level Security; uploaded files live in Supabase Storage and are indexed by `services/ingest`.

## Repository layout

```
gscpe-kms/
├── apps/
│   └── web/                     # Next.js app (the product)
│       ├── public/              # Static assets (GSCPE seal, etc.)
│       └── src/app/             # App Router routes, layout, styles
│           ├── layout.tsx       # Root HTML shell + fonts + metadata
│           ├── page.tsx         # Current single-page prototype UI
│           ├── gscpe.css        # Scoped UI styles
│           └── globals.css      # Tailwind entry + base tokens
├── packages/
│   └── db/                      # Reserved: database schema/client
├── services/
│   └── ingest/                  # Reserved: document ingestion
├── supabase/
│   ├── config.toml              # Local Supabase stack configuration
│   └── seed.sql                 # Placeholder seed file
├── docs/
│   ├── mock/3.html              # Original design prototype
│   └── installation-windows.md  # Windows setup guide
├── pnpm-workspace.yaml
├── package.json                 # Workspace-level scripts
└── .node-version
```

## Current views

All views currently share the single `/` route and are switched client-side via the URL hash:

| URL | View |
|---|---|
| `/` or `/#home` | Home |
| `/#assistant` | University Assistant |
| `/#documents` | Document Repository |
| `/#enrollment` | Enrollment Guide |
| `/#policies` | Policies & Guidelines |
| `/#program` | Program Information |
| `/#admin` | Document Management (gate unless staff toggle is on) |

Hash routing is intentional for the prototype. It will be replaced with real App Router routes (`/documents`, `/assistant`, …) when the data layer is introduced.

## Getting started

### Requirements

- Node.js `26.13.0`
- pnpm `12.18.0`
- Git

The repo pins the Node version in `.node-version` and the pnpm version in `package.json`.

### Linux / macOS

```bash
git clone https://github.com/mykangelo/gscpe-kms.git
cd gscpe-kms
pnpm install
pnpm dev
```

Open **http://localhost:3000**.

If `pnpm` is not installed, enable Corepack (bundled with Node):

```bash
corepack enable
corepack prepare pnpm@12.18.0 --activate
```

### Windows

See the dedicated guide: **[docs/installation-windows.md](docs/installation-windows.md)**.

## Scripts

Run these from the repository root:

| Command | Description |
|---|---|
| `pnpm dev` | Start the dev server on `http://localhost:3000` |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build (run `pnpm build` first) |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run `tsc --noEmit` |

You can also work inside `apps/web` directly with `pnpm dev`, `pnpm build`, etc.

## Local Supabase

The Supabase CLI is a root dev dependency, and the local stack is pre-configured in `supabase/config.toml`.

```bash
pnpm exec supabase start     # start Postgres, Auth, Storage, Studio
pnpm exec supabase status    # show local URLs and keys
pnpm exec supabase stop      # stop the stack
```

- Supabase Studio: `http://127.0.0.1:54323`
- API: `http://127.0.0.1:54321`
- Postgres: `127.0.0.1:54322`

**Requirements:** Docker (Docker Desktop on Windows/macOS, Docker Engine on Linux).

> The database schema and migrations have not been added yet, so the local database starts empty. `supabase/seed.sql` is a placeholder.

## Environment variables

No environment variables are required to run the UI prototype. Once Supabase is wired into the app, create `apps/web/.env.local` using the values from `pnpm exec supabase status`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local anon key>
```

Never commit `.env` files or keys. `.env` and `.env.*` are already ignored at the repo root.

## Roadmap

1. Split the single page into real App Router routes (`/documents`, `/assistant`, …).
2. Add the database schema, migrations, seed data, and RLS policies.
3. Add Supabase Auth with student / staff / admin roles.
4. Replace in-memory document state with Supabase queries and Storage uploads.
5. Implement real search (Postgres full-text, then `pgvector`).
6. Build `services/ingest` for document parsing and indexing.
7. Make the assistant retrieval-based with citations and a safe "not found" path.
8. Add tests (Vitest + Playwright) and CI.
9. Add security headers, env validation, and deployment configuration.

## Conventions

- Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`).
- Run `pnpm lint` and `pnpm typecheck` before committing.
- Keep the design reference (`docs/mock/3.html`) unchanged; update the React implementation.
- Create feature branches and open a pull request against `main`.
