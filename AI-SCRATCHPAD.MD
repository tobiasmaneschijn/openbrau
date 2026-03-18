# AI State & Scratchpad

> Rule for AI Agents: Read this file to understand the current context. Update the completed work, next actions, and notes as the recipe engine evolves.

## Current Objective

The recipe layer now covers the current BeerXML and ingredient-library scope:

- Track batches through the brew-day and fermentation lifecycle.
- Support BeerXML import and export from the recipe library with ingredient-level details.
- Remember fermentables, hops, yeasts, and misc ingredients across recipes.
- Surface autosuggestions and ingredient detail pages from the saved ingredient library.
- Keep batch data and telemetry in base metric/SI units.
- Preserve PostgreSQL-owned auditing for batch and recipe state changes.

## Completed Steps (Current Session)

- [x] Phase 1 scaffolding is in place.
- [x] Core Drizzle schema exists for users, equipment, recipes, recipe ingredients, batches, telemetry, plugins, and audit logs.
- [x] Base unit conversion helpers exist.
- [x] Initial brewing math exists in `src/lib/math/brewing.ts` for gravity points, SG, ABV, SRM, Tinseth IBU, Rager IBU, attenuation-based FG, and fermentable MCU.
- [x] Typed recipe domain model now exists in `src/lib/recipes/domain.ts`.
- [x] Recipe engine summary pipeline now exists in `src/lib/math/recipe-engine.ts`.
- [x] Recipe-to-engine mapping now exists in `src/lib/recipes/engine.ts`.
- [x] Recipe form now supports brew type presets, field visibility toggles, advanced mode, selectable IBU formulas, and recipe modules.
- [x] Recipes now persist `enabled_modules` and `ibu_formula` through Drizzle schema and migration `drizzle/0003_narrow_power_man.sql`.
- [x] Recipe detail page now exposes engine preview stats, scaling data, active modules, and engine warnings.
- [x] BeerXML boundary mapping now exists in `src/lib/recipes/beerxml.ts`.
- [x] Unit coverage now includes recipe summaries, generic equipment fallback, extract handling, hop phase behavior, and BeerXML edge mapping.
- [x] PostgreSQL audit trigger infrastructure now exists for core domain tables, and recipe/equipment mutations set the acting user id for `audit_logs`.
- [x] Batch tracking server helpers now exist in `src/lib/server/batches.ts`.
- [x] Batch state-flow helpers now exist in `src/lib/batches/config.ts`.
- [x] Batch list, create, and detail pages now exist under `src/routes/app/batches`.
- [x] Recipe library now supports BeerXML import and export entry points.
- [x] Recipe pages now support persisted fermentables, hops, yeasts, and misc additions.
- [x] Recipe pages now suggest remembered ingredients from the saved library while editing.
- [x] Ingredient library list and detail pages now exist under `src/routes/app/ingredients`.
- [x] BeerXML parsing and serialization now include richer fermentable, hop, yeast, and misc fields.
- [x] BeerXML imports now persist ingredient records and recipe ingredient links instead of recipe targets alone.
- [x] Workspace navigation and dashboard now surface batches as a first-class area.
- [x] Workspace navigation now surfaces ingredients as a first-class area.
- [x] README now reflects the current product shape instead of the initial scaffold text.

## Next Actions

- [x] Define a typed recipe engine domain model separate from raw DB rows.
  - Normalized recipe definitions, process settings, targets, additions, equipment, and modules are now explicit.
- [x] Build a calculation pipeline in `src/lib/math`.
  - Gravity aggregates from fermentables using metric-first inputs.
  - Color aggregates from fermentables rather than only exposing raw `mcu`.
  - Hop aggregation supports selectable Tinseth or Rager formulas.
  - FG and ABV can be derived from yeast attenuation.
- [x] Introduce recipe-engine summaries/derived outputs.
  - A single pure function returns computed OG, FG, ABV, IBU, SRM, totals, and warnings.
  - UI feedback now surfaces mismatches between target and computed values.
- [x] Connect equipment profiles to scaling logic.
  - Equipment efficiency, losses, and boil-off feed the derived batch summary.
  - A generic/default equipment path exists for beginner-friendly fallback behavior.
- [x] Formalize adaptive complexity modules.
  - `core`, `water_chemistry`, `mash_steps`, and `yeast_starter` are formalized.
  - Modules are optional per recipe and gated by advanced mode in the form.
- [x] Expand tests before deep UI work.
  - Unit tests now cover full summaries, edge cases, equipment scaling, extract recipes, and hop phase handling.
- [x] Plan import/export boundaries.
  - Internal engine shape remains metric-first.
  - BeerXML mapping lives at the edge in dedicated adapters.
- [x] Add persistent ingredient memory and recipe item editing.
  - Recipe pages now manage ingredient composition directly from the browser.
  - Ingredient records are reused by name and exposed through a dedicated library.
- [x] Expand BeerXML coverage for ingredient objects.
  - Fermentables, hops, yeasts, and misc additions now round-trip richer metadata.
  - Recipe import/export now preserves ingredient-level detail where supported by the schema.

## Blockers / Open Questions / Notes

- `recipes.target_og`, `target_fg`, `target_ibu`, and `target_srm` are still treated as user-facing targets; computed values remain derived by the engine.
- Plugin/event hooks should still be considered before reworking recipe save/load flows beyond the current form and preview path.
- Local workflow note: `db:push` is the reliable schema-sync path in this project. Custom trigger SQL still needs explicit migration-style SQL, but the schema itself should be pushed with Drizzle.
- Phase 4 currently covers manual batch tracking plus BeerXML portability. Hardware webhooks and fermentation charting still belong to the next phase.
- Ingredient details currently emphasize supplier, sourcing, and BeerXML-relevant technical fields. Inventory, pricing, or purchasing workflow can be layered on later without changing the core model.
