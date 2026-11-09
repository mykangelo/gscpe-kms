# GRADKnow — GSCPE Knowledge Management System

**GRADKnow** is a web-based knowledge management system for the **PUP Graduate School — Computer Engineering (GSCPE)** program. It centralizes official program information, policies, enrollment guidance, forms, and academic documents in a searchable repository, with a university assistant that retrieves answers from the available knowledge base.

> **Status: Working application prototype.**
> The project has real Next.js routes, API route handlers, file-backed content, document retrieval, and an admin area. Supabase configuration, schema migration, and seed data are included, but the application data layer currently reads and writes local files; Supabase is not yet the active runtime database. Admin access uses a shared password and is not yet integrated with Supabase Auth.

## Contents

- [Overview](#overview)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Current views and API routes](#current-views-and-api-routes)
- [Get the code](#get-the-code)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Local Supabase](#local-supabase)
- [Environment variables](#environment-variables)
- [Roadmap](#roadmap)
- [Conventions](#conventions)

## Overview

GRADKnow is organized as a pnpm workspace monorepo. The user-facing application lives in `apps/web` and uses the Next.js App Router. The application has separate routes for its main views, server-side data access through a central repository module, and API route handlers for chat, document operations, summarization, and admin functions.

The application currently includes:

- Home page and navigation for the GSCPE knowledge system
- Document repository with document listing, category-oriented browsing, and download links
- University Assistant with English and Filipino keyword support
- Retrieval-based answers using document chunks and TF-IDF scoring
- Source-aware answers with a fallback when the knowledge base does not contain an answer
- Document summarization endpoint, with optional conversational AI integration when configured
- Enrollment guide backed by editable JSON content
- Policies and guidelines view
- Program information view
- Admin area for document and site-content management
- Logging of unanswered assistant questions

The design references are retained in `docs/mock/`. The current React/Next.js application is the implementation; the mock HTML files are references rather than the running application.

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | Node.js **26.13.0** (`.node-version`) |
| Package manager | pnpm **12.18.0** (`packageManager`) |
| Web framework | Next.js **16.4.5** (App Router, Route Handlers) |
| UI | React **19.3.0**, TypeScript **5** |
| Styling | Tailwind CSS **4** + custom application styles (`gradknow.css`, `globals.css`) |
| Fonts | Manrope + Montserrat (application typography) |
| Retrieval | Local document chunking, keyword normalization, and TF-IDF ranking (`src/lib/retrieval.ts`) |
| Data layer today | File-backed repository using Markdown, JSON, JSONL, and files on disk (`src/lib/repo.ts`) |
| Database / Auth / Storage target | Supabase Postgres, Auth, and Storage (configuration, migration, and seed included; not yet wired into the runtime repository) |
| Optional AI provider | Anthropic-compatible conversational mode and summaries, configured with `GRADKNOW_AI_KEY` |
| Ingestion service | `services/ingest` (reserved; document parsing pipeline not implemented) |

## Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│ Browser                                                      │
│ Next.js App Router pages                                     │
│ /  /ask  /documents  /enrollment  /policies  /program  /admin│
└──────────────────────────────┬───────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────┐
│ apps/web — Next.js 16 / React 19 / TypeScript                │
│                                                              │
│ src/app/          route pages and API Route Handlers         │
│ src/components/   shared UI components                       │
│ src/lib/repo.ts   central file-backed data repository        │
│ src/lib/retrieval.ts  chunking, keyword mapping, TF-IDF      │
│ src/lib/admin-auth.ts shared-password prototype auth         │
└──────────────────────────────┬───────────────────────────────┘
                               │
              ┌────────────────┴─────────────────┐
              │                                  │
┌─────────────▼────────────────┐   ┌─────────────▼──────────────┐
│ Local application content    │   │ Supabase (configured target)│
│ apps/web/content/             │   │ Postgres · Auth · Storage   │
│ Markdown · JSON · JSONL logs  │   │ migration + seed included   │
│ public/files/                 │   │ not active in runtime yet   │
└──────────────────────────────┘   └────────────────────────────┘

              services/ingest — planned document ingestion
```

**Data flow today:** Next.js server-side code reads and writes the content files through `src/lib/repo.ts`. Knowledge documents are stored as Markdown, site and enrollment content as JSON, unanswered-question records as JSONL, and downloadable documents under `public/files/`. The assistant retrieves relevant content using chunking, keyword normalization (including Filipino terms), and TF-IDF ranking. API Route Handlers expose the chat, document, summarization, and admin operations.

**Planned data flow:** Replace the file-backed implementation in `src/lib/repo.ts` with Supabase queries and Storage operations. The included migration defines the intended database structure and roles. Supabase Auth and Row Level Security will replace the shared-password admin prototype. The planned ingestion service will extract text from uploaded document formats and add it to the searchable knowledge base.

## Repository layout

```text
gscpe-kms/
├── apps/
│   └── web/                         # Next.js application
│       ├── public/
│       │   ├── files/                # Downloadable GSCPE documents and forms
│       │   └── logos/                # PUP and GSCPE seals
│       ├── content/
│       │   ├── data/                 # Site and enrollment JSON data
│       │   ├── knowledge/            # Markdown knowledge-base records
│       │   └── logs/                 # Unanswered-question logs
│       └── src/
│           ├── app/                  # App Router pages and API routes
│           │   ├── api/              # Chat, documents, summarize, admin APIs
│           │   ├── admin/            # Admin page
│           │   ├── ask/              # University Assistant page
│           │   ├── documents/        # Document repository page
│           │   ├── enrollment/       # Enrollment guide page
│           │   ├── policies/         # Policies and guidelines page
│           │   ├── program/          # Program information page
│           │   ├── layout.tsx       # Root layout and metadata
│           │   ├── page.tsx         # Home page
│           │   └── gradknow.css     # GRADKnow application styles
│           ├── components/           # Navigation, views, admin and shared UI
│           └── lib/
│               ├── admin-auth.ts     # Shared-password prototype authentication
│               ├── repo.ts          # Central file-backed data access
│               ├── retrieval.ts     # Knowledge retrieval and ranking
│               └── types.ts         # Shared TypeScript types
├── packages/
│   └── db/                          # Reserved database package
├── services/
│   └── ingest/                      # Reserved document-ingestion service
├── supabase/
│   ├── migrations/                  # GRADKnow database schema migration
│   ├── config.toml                  # Local Supabase configuration
│   └── seed.sql                     # Initial database seed data
├── docs/
│   ├── mock/                        # Original GRADKnow student/admin HTML designs
│   └── installation-windows.md      # Windows setup guide
├── pnpm-workspace.yaml
├── package.json                     # Workspace scripts and package manager
└── .node-version                    # Pinned Node.js version
```

## Current views and API routes

The main views use separate Next.js App Router routes:

| URL | View |
|---|---|
| `/` | Home |
| `/ask` | University Assistant |
| `/documents` | Document Repository |
| `/enrollment` | Enrollment Guide |
| `/policies` | Policies and Guidelines |
| `/program` | Program Information |
| `/admin` | Admin / staff management area |

The application also exposes API Route Handlers:

| Endpoint | Purpose |
|---|---|
| `/api/chat` | Assistant question handling and retrieval |
| `/api/documents` | Document listing and document data operations |
| `/api/summarize` | Document summarization |
| `/api/admin/login` | Admin password login |
| `/api/admin/docs` | Admin document operations |
| `/api/admin/content` | Admin site/enrollment content operations |
| `/api/admin/stats` | Admin dashboard statistics |

Admin access is currently protected by the configured shared `ADMIN_PASSWORD` and a signed cookie. This is prototype authentication; it is not a replacement for individual accounts, Supabase Auth, or production-grade role-based access control.

## Get the code

The repository is public:

[**https://github.com/mykangelo/gscpe-kms**](https://github.com/mykangelo/gscpe-kms)

You need **Git** installed to clone it. A GitHub account is only required to contribute (push branches or open pull requests), not to clone or run the app. Windows users should follow the full guide in [`docs/installation-windows.md`](docs/installation-windows.md), which covers Git installation and authentication in detail.

### Clone with GitHub CLI (recommended)

The GitHub CLI handles authentication for you.

```bash
# Install: https://cli.github.com/ (Windows: winget install --id GitHub.cli -e)
gh auth login
gh repo clone mykangelo/gscpe-kms
cd gscpe-kms
```

### Clone with HTTPS

Works everywhere. Git will ask you to sign in the first time. GitHub does **not** accept your account password for Git operations; use the browser sign-in prompt or a [personal access token](https://github.com/settings/tokens).

```bash
git clone https://github.com/mykangelo/gscpe-kms.git
cd gscpe-kms
```

> **Windows:** Git for Windows includes Git Credential Manager, which opens a browser sign-in window automatically.
>
> **Linux:** install a credential helper (`git-credential-libsecret` or `git-credential-manager`) or use a personal access token when prompted.

### Clone with SSH (optional)

Use this if you already have an SSH key on GitHub:

```bash
git clone git@github.com:mykangelo/gscpe-kms.git
cd gscpe-kms
```

No key yet? Create one and add it to GitHub:

```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
cat ~/.ssh/id_ed25519.pub
# Copy the output into https://github.com/settings/keys
ssh -T git@github.com   # verify
```

### Download a ZIP (no Git)

On GitHub: **Code → Download ZIP**, then extract it. This is fine for a quick look, but it has no Git history and cannot receive `git pull` updates. Use a real clone for development.

### Keep your copy up to date

```bash
git switch main
git pull --ff-only
pnpm install   # only needed when dependencies change
```

### Contribute changes

The repository is public, so you can fork it and open a pull request without being added as a collaborator. If you are a team member who needs direct push access, ask the owner to add you under **GitHub → Settings → Collaborators and teams**.

```bash
git switch -c feat/short-description
# make your changes
pnpm lint && pnpm typecheck
git add -A
git commit -m "feat: short description"
git push -u origin feat/short-description
# open a pull request on GitHub
```

## Getting started

### Requirements

- Node.js `26.13.0` (see `.node-version`)
- pnpm `12.18.0`
- Git

The repository declares pnpm `12.18.0` in the root `package.json`.

### Windows

1. Install the required Node.js version.
2. Clone the repository (see [Get the code](#get-the-code)) and open PowerShell in the `gscpe-kms` project root.
3. Enable Corepack and activate the required pnpm version:

```powershell
corepack enable
corepack prepare pnpm@12.18.0 --activate
```

4. Install dependencies:

```powershell
pnpm install
```

5. Create the local environment file:

```powershell
Copy-Item apps/web/.env.example apps/web/.env.local
```

6. Edit `apps/web/.env.local` and set a private `ADMIN_PASSWORD` value before using the admin page.
7. Start the development server:

```powershell
pnpm dev
```

Open **http://localhost:3000**.

See [`docs/installation-windows.md`](docs/installation-windows.md) for the extended Windows setup guide.

### Linux / macOS

```bash
git clone https://github.com/mykangelo/gscpe-kms.git
cd gscpe-kms
corepack enable
corepack prepare pnpm@12.18.0 --activate
pnpm install
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local`, set `ADMIN_PASSWORD`, then run:

```bash
pnpm dev
```

Open **http://localhost:3000**.

## Scripts

Run these commands from the repository root:

| Command | Description |
|---|---|
| `pnpm dev` | Start the Next.js development server at `http://localhost:3000` |
| `pnpm build` | Create a production build |
| `pnpm start` | Start the production server (run `pnpm build` first) |
| `pnpm lint` | Run ESLint in the web application |
| `pnpm typecheck` | Run TypeScript type checking (`tsc --noEmit`) |

The root scripts delegate to the `web` workspace package in `apps/web`.

## Local Supabase

The Supabase CLI is included as a root development dependency, and the local stack is configured in `supabase/config.toml`.

```bash
pnpm exec supabase start
pnpm exec supabase status
pnpm exec supabase db reset
pnpm exec supabase stop
```

The repository includes a schema migration under `supabase/migrations/` and seed data in `supabase/seed.sql`. Docker is required to run the local Supabase stack.

**Important:** Supabase is prepared as the intended database/auth/storage backend, but the current application repository module (`apps/web/src/lib/repo.ts`) still uses local files. Starting Supabase does not by itself switch the application to database-backed storage.

## Environment variables

Create `apps/web/.env.local` from the example file:

```bash
cp apps/web/.env.example apps/web/.env.local
```

| Variable | Required | Purpose |
|---|---|---|
| `ADMIN_PASSWORD` | Yes for admin login | Shared password used by the prototype admin login |
| `ADMIN_SECRET` | Optional | Secret used to sign the admin session cookie; falls back to `ADMIN_PASSWORD` |
| `GRADKNOW_AI_KEY` | Optional | Enables the configured conversational AI/summarization mode |
| `GRADKNOW_AI_MODEL` | Optional | Selects the AI model; the example defaults to `claude-sonnet-4-5` |
| `NEXT_PUBLIC_SUPABASE_URL` | Not currently used by the active file repository | Intended Supabase project/API URL for the future database integration |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Not currently used by the active file repository | Intended Supabase anon key for the future database integration |

Do not commit `.env.local` files, passwords, API keys, or Supabase secrets to version control. Use strong private values for any environment exposed beyond local development.

## Roadmap

1. Replace the file-backed repository in `src/lib/repo.ts` with Supabase Postgres queries and Supabase Storage.
2. Enable Supabase Auth with student, staff, and admin roles; replace the shared `ADMIN_PASSWORD` prototype login.
3. Apply and validate Row Level Security policies for role-based access.
4. Implement `services/ingest` for PDF, DOCX, XLSX, and PPTX text extraction and indexing.
5. Improve retrieval with Postgres full-text search, then evaluate `pgvector` for semantic retrieval.
6. Expand the admin interface with form-based editors for site and enrollment content.
7. Complete and validate the remaining official GSCPE program information, curriculum, policies, and forms.
8. Add automated tests (Vitest and Playwright) and continuous integration.
9. Add production deployment configuration, security headers, environment validation, and operational monitoring.

## Conventions

- Use Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`).
- Run `pnpm lint` and `pnpm typecheck` before committing changes.
- Keep the original design references in `docs/mock/` as references; update the Next.js implementation for application changes.
- Keep data access centralized in `src/lib/repo.ts` so the storage backend can be replaced without changing every page or API handler.
- Do not commit environment files, credentials, or private keys.
- Create feature branches and open a pull request against `main`.
