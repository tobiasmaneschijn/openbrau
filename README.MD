# OpenBrau

OpenBrau is a self-hosted homebrewing workspace built with SvelteKit, Bun, Drizzle, and PostgreSQL. The project aims to give brewers the convenience of modern brewing apps while keeping recipes, batch logs, and process data under the user's control.

## Current product scope

- Recipe planning with adaptive complexity controls
- Recipe ingredient sections for fermentables, hops, yeast, and other additions
- Remembered ingredient library with autosuggestions and detail pages
- Equipment profiles for batch sizing, efficiency, and losses
- Batch tracking through `Draft -> Brewing -> Fermenting -> Conditioning -> Finished`
- Rich BeerXML import and export for recipe portability, including ingredient metadata
- PostgreSQL trigger-based audit logging for critical domain tables

All physical values are stored in base metric or SI units in the database. Any unit conversion belongs in the display layer.

## Stack

- Runtime and package manager: `bun`
- App framework: `SvelteKit` with `Svelte 5`
- Database: `PostgreSQL 16+`
- ORM: `Drizzle ORM`
- Styling: `Tailwind CSS` with `shadcn-svelte`
- Localization: `@inlang/paraglide-js`

## Quick start

1. Copy the environment template and set your secrets.

```bash
cp .env.example .env
```

2. Install dependencies.

```bash
bun install
```

3. Start the app.

```bash
bun run dev
```

4. If you want local infrastructure for PostgreSQL and MQTT, start the compose services.

```bash
bun run dev:infra
```

## Useful scripts

- `bun run dev` - start the app in development
- `bun run check` - run Svelte and TypeScript checks
- `bun test` - run the unit test suite
- `bun run db:push` - push the Drizzle schema to the database
- `bun run db:generate` - generate SQL migration files from schema changes

## Notes

- `SPEC.MD` is the technical source of truth for the roadmap and architecture.
- `AGENTS.MD` contains project-specific coding rules for AI agents and contributors.
- Audit history is owned by PostgreSQL triggers, not application-level logging code.
