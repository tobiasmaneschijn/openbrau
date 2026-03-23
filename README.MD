# OpenBrau

> The open-source brewing workspace for recipe nerds, batch trackers, and anyone who thinks "just one more hydrometer reading" is a reasonable evening plan.

OpenBrau is a self-hosted homebrewing workspace built for brewers who want modern tooling **without handing their brew log to someone else's cloud**. It combines recipe planning, ingredient memory, equipment-aware calculations, batch tracking, and BeerXML portability in a stack designed for speed and long-term ownership.

Whether you're sketching your first pale ale or obsessing over efficiency losses like they're a championship stat line, OpenBrau aims to keep the workflow approachable, fast, and fully yours.

## Why OpenBrau?

- **Self-hosted by default** — your recipes, ingredient data, and batch history stay under your control.
- **Simple first, advanced when needed** — adaptive complexity keeps the UI friendly for new brewers while leaving room for the serious tinkering.
- **Metric-first data model** — all physical values are stored in base metric/SI units, with conversions handled in the display layer.
- **BeerXML support** — import and export recipes for portability.
- **Batch lifecycle tracking** — move from `Draft` to `Finished` without relying on sticky notes and vague optimism.
- **Ingredient memory** — reuse fermentables, hops, yeasts, and misc additions across recipes.
- **Database-owned audit history** — important changes are tracked with PostgreSQL triggers.

## Current Features

### Recipe workspace

- Build recipes with adaptive complexity controls.
- Configure fermentables, hops, yeast, and misc additions.
- Preview computed brewing stats from the recipe engine.
- Attach recipes to equipment profiles for scaling-aware calculations.
- Import and export BeerXML.

### Ingredient library

- Save commonly used ingredients for reuse.
- Get autosuggestions while editing recipes.
- Browse ingredient details by category.

### Batch tracking

- Track batches through the brewing lifecycle:
  - `Draft`
  - `Brewing`
  - `Fermenting`
  - `Conditioning`
  - `Finished`
- Keep process data in a metric/SI-safe model.

### Platform foundations

- PostgreSQL-trigger-based audit logging for core domain records.
- Localizable UI with `@inlang/paraglide-js`.
- SvelteKit + Bun app stack optimized for a responsive self-hosted workflow.

## Tech Stack

- **Frontend / App:** SvelteKit + Svelte 5
- **Runtime & package manager:** Bun
- **Database:** PostgreSQL 16+
- **ORM:** Drizzle ORM
- **Styling:** Tailwind CSS + shadcn-svelte
- **Localization:** `@inlang/paraglide-js`
- **Infra:** Docker / Compose-style local services
- **Optional messaging:** MQTT via Mosquitto for future hardware integrations

## Quick Start

### 1. Copy the environment file

```bash
cp .env.example .env
```

### 2. Install dependencies

```bash
bun install
```

### 3. Start the app

```bash
bun run dev
```

### 4. Start local infrastructure if needed

This project includes local service definitions for PostgreSQL and MQTT.

```bash
bun run dev:infra
```

Then open the local app URL reported by Vite.

## Common Commands

```bash
bun run dev            # Start the app in development
bun run check          # Run Svelte + TypeScript checks
bun run lint           # Run Prettier and ESLint
bun test               # Run the test suite once
bun run db:push        # Push Drizzle schema changes to the database
bun run db:generate    # Generate migration SQL from schema changes
```

## Development Principles

### Progressive disclosure

OpenBrau is designed so beginners can log recipes without drowning in advanced controls, while experienced brewers can opt into deeper workflows over time.

### Metric-first storage

All physical values belong in the database in base metric/SI units. Unit conversions should happen in the display layer, not in persistence.

### Audit history belongs to PostgreSQL

Application code should not reinvent audit logging. Critical history is owned by database triggers and centralized audit records.

### Portable brewing data

BeerXML support exists so recipes can move between tools instead of getting trapped in one vendor's fermenter.

## Project Status

OpenBrau is an active early-stage project with core functionality already in place for:

- recipe creation and editing,
- ingredient reuse,
- equipment profiles,
- batch tracking,
- BeerXML portability, and
- audit-ready persistence.

Planned and emerging areas include richer telemetry, IoT integrations, and more advanced brewing workflows.

## Important Project Docs

- [`SPEC.MD`](./SPEC.MD) — technical roadmap, architecture, and product specification.
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — how to contribute code, docs, and ideas.
- [`SECURITY.md`](./SECURITY.md) — how to report security issues responsibly.
- [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) — community expectations.
- [`AGENTS.MD`](./AGENTS.MD) — project-specific guidance for AI/code agents.

## Contributing

Issues, documentation improvements, bug fixes, and feature work are all welcome. If you're unsure where to start, documentation and workflow polish are excellent first pours.

Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before opening a pull request.
