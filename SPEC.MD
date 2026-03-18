# OpenBrau - Technical Specification

## 1. Overview
OpenBrau is a containerized, self-hosted web application for managing homebrewing recipes, equipment profiles, and batch logs. The application is designed to be highly responsive, relying on client-side reactivity for complex brewing calculations, while persisting data securely in a local relational database. 

Crucially, OpenBrau is built with **Adaptive Complexity**: it serves as a dead-simple recipe logger for beginners, while hiding advanced features (like water chemistry and custom IoT telemetry) behind user-configurable toggles. It also features an API-first plugin architecture, strict revision auditing, and comprehensive global localization.

## 2. Technology Stack (2026 standard)
* **Runtime:** Bun (optimized for speed, fast dependency resolution, and lightweight VPS footprints)
* **Framework:** SvelteKit (App Router, utilizing Svelte 5's Runes for fine-grained reactivity)
* **i18n / l10n:** `@inlang/paraglide-js` (for type-safe SvelteKit translations) and native JS `Intl` API for dates/numbers.
* **Styling:** Tailwind CSS + shadcn-svelte
* **Database:** PostgreSQL 16+
* **ORM:** Drizzle ORM (type-safe, edge-ready, minimal overhead)
* **Charting:** Apache ECharts (for rendering high-performance IoT telemetry data)
* **Deployment:** Docker & Docker Compose (Multi-container architecture)

## 3. System Architecture
The production deployment utilizes a 2-to-3 container architecture defined in `docker-compose.yml`:
1. **`openbrau-web`**: The Bun/SvelteKit application handling SSR, API routes, and static asset delivery.
2. **`openbrau-db`**: PostgreSQL database storing user, recipe, and log data.
3. **`openbrau-mqtt` (Optional)**: Eclipse Mosquitto broker for users wanting to subscribe to local IoT devices instead of relying purely on HTTP webhooks.

## 4. Core Modules & Logic

### A. Recipe Engine & Adaptive UI (Progressive Disclosure)
* **Complexity Toggles:** The UI adapts to the user's experience level. By default, the recipe builder only shows core inputs (Fermentables, Hops, Yeast, Target Volume). 
* **Opt-in Advanced Features:** Users can enable modules like *Water Chemistry*, *Mash Step Automation*, and *Yeast Starter Calculators* either globally in their profile or on a per-recipe basis. If disabled, the engine relies on safe defaults.
* Must support importing/exporting standard `BeerXML` format.
* **Calculations:** Reactive math for IBU (Tinseth/Rager), SRM (Morey), and Gravity (PPG).

### B. Equipment Profiles
* Recipes are stateless regarding equipment until assigned. Once a recipe is linked to an equipment profile, batch volumes and efficiencies are dynamically scaled. Beginners can select "Generic Bucket Profile" to bypass complex equipment setup.

### C. Batch & Fermentation Tracking
* **State Machine:** Batches follow a strict flow: `Draft` -> `Brewing` -> `Fermenting` -> `Conditioning` -> `Finished`.
* **Telemetry Data:** The system accepts time-series data (Temperature, Specific Gravity) linked to a specific `batch_id`.

### D. Hardware Integration (IoT)
* Exposes unauthenticated (but token-secured) webhook endpoints to receive data from local devices.

### E. Revision Auditing & History
* **Immutable Audit Trail:** All critical state changes are tracked via PostgreSQL triggers into a centralized `audit_logs` table.
* **Version Control UI:** Users can view a "History" tab on any recipe to see who changed what and revert to a previous state using stored JSONB snapshots.

### F. Unit Management & Localization (i18n/l10n)
* **Storage Principle:** All weights, volumes, and temperatures are stored in the database in strict base SI/Metric units (Liters, Kilograms, Celsius) to ensure data consistency.
* **Display Layer:** The UI dynamically converts and formats these values based on the user's `preferences` profile.

### G. Extensibility & Plugin Architecture
* **Event Hooks:** The core application emits lifecycle events (`onBatchStart`, `onRecipeSave`).
* **UI Injection Points:** The frontend exposes specific UI slots for custom widgets.
* **Open REST/GraphQL API:** All core functionality is exposed for headless integration.

## 5. Database Schema (Drizzle Definition Overview)

* **`users`**: `id`, `username`, `password_hash`, `preferences` (JSONB storing target units, locale override, theme, and **`enabled_features` array** to track complexity level).
* **`equipment`**: `id`, `name`, `efficiency`, `boil_off_rate_lph` (always stored in liters-per-hour), etc.
* **`ingredients`**: Base tables for `fermentables`, `hops`, `yeasts`, `misc`, `water_profiles`.
* **`recipes`**: `id`, `name`, `style`, `author_id`, `equipment_id`, `target_og`, `target_ibu`.
* **`recipe_items`**: Junction tables linking recipes to ingredients with `amount_kg` (standardized), `time_min`, `use_phase`.
* **`batches`**: `id`, `recipe_id`, `status`, `brew_date`.
* **`batch_telemetry`**: `id`, `batch_id`, `timestamp`, `gravity`, `temperature_c` (standardized).
* **`plugins_registry`**: `id`, `plugin_name`, `version`, `is_enabled`, `config_json`.
* **`audit_logs`**: `id`, `table_name`, `record_id`, `action`, `changed_by_user_id`, `old_data` (JSONB), `new_data` (JSONB), `created_at`.

## 6. Development Milestones
* **Phase 1:** SvelteKit scaffolding, database migrations, base CRUD, and Unit Conversion utility classes.
* **Phase 2:** The Recipe Engine UI (incorporating Adaptive Complexity toggles).
* **Phase 3:** PostgreSQL Trigger implementation for `audit_logs`.
* **Phase 4:** Batch tracking and BeerXML import/export.
* **Phase 5:** Webhooks, IoT integration, and Charting.
* **Phase 6:** Implement Plugin Event Bus and UI Injection layer.