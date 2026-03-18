# OpenBrau AI Agent Guidelines

This file provides context, architectural rules, and coding standards for AI assistants working on the **OpenBrau** codebase. Read this carefully before generating code, suggesting refactors, or writing database schemas.

## 1. Project Context
OpenBrau is a modern, self-hosted, containerized homebrewing management platform. It is designed to be a fully open-source alternative to tools like Brewfather or BeerSmith. 
- **Core Philosophy:** User data ownership, progressive disclosure (simple by default, advanced via toggles), and high performance.
- **Environment:** Deployed via Docker Compose (Web App, PostgreSQL DB, MQTT Broker).

## 2. Tech Stack
- **Runtime & Package Manager:** Bun (v1+)
- **Framework:** SvelteKit (using **Svelte 5** and Svelte Runes)
- **Database:** PostgreSQL 16+
- **ORM:** Drizzle ORM
- **Styling:** Tailwind CSS + shadcn-svelte
- **i18n/l10n:** `@inlang/paraglide-js` + native JS `Intl` API
- **Charts:** Apache ECharts

## 3. Strict Architectural Rules
Do not violate these rules unless explicitly instructed by the user.

### A. Data Storage & Units (The Golden Rule)
- **Backend:** The database MUST ONLY store values in base Metric/SI units (`liters`, `kilograms`, `celsius`, `minutes`). 
- **Frontend:** Unit conversion (e.g., to Gallons, Pounds, Fahrenheit) happens strictly in the display layer based on user preferences. 
- **Naming Convention:** Append the unit to the database column or backend interface (e.g., `amount_kg`, `temperature_c`, `boil_off_lph`) to avoid confusion.

### B. UI & Progressive Disclosure
- Always design components for "Adaptive Complexity." 
- Default to the simplest possible view for beginner brewers. Advanced inputs (water chemistry, mash pH, hop stand utilization) should be hidden behind state toggles (`if (user.preferences.advanced_mode) { ... }`).

### C. Auditing & History
- **Do not write application-level audit logging.** - All historical tracking of recipes, equipment, and ingredients is handled by PostgreSQL triggers writing to an `audit_logs` table (using `JSONB` for `old_data` and `new_data`). Assume the database handles the history automatically.

### D. Hardware & Telemetry
- Telemetry endpoints (webhooks) must be blazingly fast and non-blocking. Use optimized inserts for time-series data (`batch_telemetry` table).

## 4. Coding Standards

### TypeScript & Svelte 5
- Use strict TypeScript for all files.
- **Crucial:** We are using **Svelte 5**. You must use **Runes** (`$state`, `$derived`, `$effect`, `$props`) for reactivity. Do NOT use Svelte 4 syntax (`export let`, `$:`, or `svelte/store` unless interfacing with legacy code).
- Keep client-side state reactive for real-time brewing math (e.g., adjusting a hop weight should instantly update the derived IBU state without a server trip).

### Drizzle ORM
- Write explicit, type-safe schemas. 
- Avoid raw SQL strings unless optimizing a highly complex time-series query for telemetry data.
- Do not use Prisma or any other ORM.

### Tailwind & Styling
- Rely on Tailwind utility classes.
- Use `shadcn-svelte` components for UI consistency (buttons, dialogs, forms, dropdowns). Do not build custom UI elements if a shadcn equivalent exists.

## 5. Agent Workflow Directives

- **When asked to create a database table:** Always define it in Drizzle ORM syntax (`schema.ts`). Ensure metric suffixes are used for physical properties.
- **When writing a Svelte component:** Default to `<script lang="ts">` and use Svelte 5 Runes.
- **When writing brewing math/calculators:** Modularize the logic into pure, testable TypeScript functions in a `/lib/math` directory. Never hardcode math directly inside a Svelte component template.
- **When modifying the recipe structure:** Remember the plugin architecture. Emit standard lifecycle events if altering the core save/load flow.