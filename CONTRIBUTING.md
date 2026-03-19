# Contributing to OpenBrau

Thanks for considering a contribution to OpenBrau. Whether you're fixing a bug, polishing documentation, refining brewing math, or proposing a bigger feature, you're helping build an open-source homebrewing platform that respects user ownership and practical brewing workflows.

## Ways to Contribute

You do **not** need to start with a giant feature branch. Valuable contributions include:

- fixing bugs,
- improving UI clarity,
- expanding tests,
- improving docs,
- tightening brewing calculations,
- reporting reproducible issues, and
- suggesting better defaults for beginner brewers.

## Before You Start

1. Read the high-level product and architecture notes in [`SPEC.MD`](./SPEC.MD).
2. Review project-specific coding guidance in [`AGENTS.MD`](./AGENTS.MD) if you're using an AI coding assistant or want implementation context.
3. Check for existing issues or open discussions before starting major work.

## Local Setup

```bash
cp .env.example .env
bun install
bun run dev
```

If you need local services:

```bash
bun run dev:infra
```

## Development Workflow

### 1. Make a focused change

Prefer small, reviewable pull requests over giant mixed-purpose updates.

### 2. Keep the product philosophy intact

OpenBrau intentionally favors:

- **self-hosted ownership**,
- **progressive disclosure**,
- **metric/SI storage on the backend**,
- **type-safe application code**, and
- **database-owned audit history**.

### 3. Follow the implementation rules

#### Metric-first persistence

Store physical values in base metric/SI units in backend models and database fields.

#### Display-layer conversion

If users need gallons, pounds, or Fahrenheit, convert when rendering or formatting — not when persisting.

#### Svelte 5 patterns

Use modern Svelte 5 conventions and runes-based reactivity where applicable.

#### Audit logging

Do not add application-level audit trails for core entities. PostgreSQL triggers own that responsibility.

## Code Quality Checklist

Before you open a PR, run the relevant checks:

```bash
bun run check
bun run lint
bun test
```

If your change touches database schema behavior, also run the appropriate Drizzle workflow for schema changes.

## Pull Request Tips

A good pull request usually includes:

- a clear summary of what changed,
- a short explanation of why it changed,
- notes on any tradeoffs or follow-up work, and
- screenshots for meaningful UI changes when practical.

## Documentation Contributions

Documentation is first-class work here. Good docs should be:

- clear,
- honest about project maturity,
- consistent with the codebase,
- helpful for both new brewers and experienced contributors, and
- just funny enough to remind everyone this is still about making good beer.

## Feature Proposals

For larger changes, open an issue or discussion first if possible. This is especially helpful for:

- schema changes,
- major UX shifts,
- plugin architecture changes,
- telemetry or IoT flows, and
- anything that could affect adaptive complexity.

## Community Expectations

Please be respectful, constructive, and collaborative. See [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

## Questions?

If something is unclear, open an issue describing:

- what you're trying to do,
- where you got stuck, and
- what you expected to happen.

Clear reproduction details beat vague fermentation vibes every time.
