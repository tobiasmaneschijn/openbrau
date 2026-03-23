import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	jsonb,
	numeric,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid
} from 'drizzle-orm/pg-core';
import type { StoredUserPreferences } from '$lib/settings';
import type { BatchRecipeSnapshot } from '$lib/batches/snapshot';

const timestamps = {
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
};

export const batchStatusEnum = pgEnum('batch_status', [
	'draft',
	'brewing',
	'fermenting',
	'conditioning',
	'finished'
]);

export const hopUsePhaseEnum = pgEnum('hop_use_phase', [
	'mash',
	'first_wort',
	'boil',
	'whirlpool',
	'dry_hop'
]);

export const miscUsePhaseEnum = pgEnum('misc_use_phase', [
	'mash',
	'boil',
	'whirlpool',
	'fermentation',
	'packaging'
]);

export const brewTypeEnum = pgEnum('brew_type', ['beer', 'wine', 'mead']);

export const ibuFormulaEnum = pgEnum('ibu_formula', ['tinseth', 'rager']);

export const auditActionEnum = pgEnum('audit_action', ['insert', 'update', 'delete', 'restore']);

export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	isAdmin: boolean('is_admin').notNull().default(false),
	preferences: jsonb('preferences')
		.$type<StoredUserPreferences>()
		.notNull()
		.default({ units: 'metric', enabled_features: [], advanced_mode: false }),
	...timestamps
});

export const appSettings = pgTable('app_settings', {
	id: text('id').primaryKey().default('global'),
	allowRegistrations: boolean('allow_registrations').notNull().default(true),
	...timestamps
});

export const sessions = pgTable(
	'sessions',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		tokenHash: text('token_hash').notNull().unique(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow().notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		index('sessions_user_idx').on(table.userId),
		index('sessions_expires_at_idx').on(table.expiresAt)
	]
);

export const fermentables = pgTable(
	'fermentables',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		type: text('type').notNull().default('grain'),
		brand: text('brand'),
		origin: text('origin'),
		supplier: text('supplier'),
		sourceUrl: text('source_url'),
		yieldPct: numeric('yield_pct', { precision: 5, scale: 2 }).notNull(),
		colorLovibond: numeric('color_lovibond', { precision: 6, scale: 2 }).notNull().default('0'),
		moisturePct: numeric('moisture_pct', { precision: 5, scale: 2 }),
		coarseFineDiffPct: numeric('coarse_fine_diff_pct', { precision: 5, scale: 2 }),
		diastaticPowerLintner: numeric('diastatic_power_lintner', { precision: 8, scale: 2 }),
		proteinPct: numeric('protein_pct', { precision: 5, scale: 2 }),
		maxInBatchPct: numeric('max_in_batch_pct', { precision: 5, scale: 2 }),
		recommendMash: boolean('recommend_mash').notNull().default(true),
		isExtract: boolean('is_extract').notNull().default(false),
		notes: text('notes'),
		...timestamps
	},
	(table) => [index('fermentables_owner_idx').on(table.ownerId)]
);

export const hops = pgTable(
	'hops',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		origin: text('origin'),
		supplier: text('supplier'),
		sourceUrl: text('source_url'),
		alphaAcidPct: numeric('alpha_acid_pct', { precision: 5, scale: 2 }).notNull(),
		betaAcidPct: numeric('beta_acid_pct', { precision: 5, scale: 2 }),
		form: text('form').notNull().default('pellet'),
		type: text('type').notNull().default('bittering'),
		hsiPct: numeric('hsi_pct', { precision: 5, scale: 2 }),
		cohumulonePct: numeric('cohumulone_pct', { precision: 5, scale: 2 }),
		myrcenePct: numeric('myrcene_pct', { precision: 5, scale: 2 }),
		substitutes: text('substitutes'),
		notes: text('notes'),
		...timestamps
	},
	(table) => [index('hops_owner_idx').on(table.ownerId)]
);

export const yeasts = pgTable(
	'yeasts',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		lab: text('lab'),
		supplier: text('supplier'),
		sourceUrl: text('source_url'),
		productCode: text('product_code'),
		type: text('type').notNull().default('ale'),
		form: text('form').notNull().default('dry'),
		attenuationPct: numeric('attenuation_pct', { precision: 5, scale: 2 }),
		minTemperatureC: numeric('min_temperature_c', { precision: 5, scale: 2 }),
		maxTemperatureC: numeric('max_temperature_c', { precision: 5, scale: 2 }),
		flocculation: text('flocculation'),
		bestFor: text('best_for'),
		maxReuse: integer('max_reuse'),
		inventory: text('inventory'),
		cultureDate: timestamp('culture_date', { withTimezone: true }),
		addToSecondary: boolean('add_to_secondary').notNull().default(false),
		notes: text('notes'),
		...timestamps
	},
	(table) => [index('yeasts_owner_idx').on(table.ownerId)]
);

export const miscs = pgTable(
	'miscs',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		type: text('type').notNull(),
		useFor: text('use_for'),
		supplier: text('supplier'),
		sourceUrl: text('source_url'),
		description: text('description'),
		notes: text('notes'),
		...timestamps
	},
	(table) => [index('miscs_owner_idx').on(table.ownerId)]
);

export const waterProfiles = pgTable(
	'water_profiles',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		calciumPpm: numeric('calcium_ppm', { precision: 8, scale: 2 }).notNull().default('0'),
		magnesiumPpm: numeric('magnesium_ppm', { precision: 8, scale: 2 }).notNull().default('0'),
		sodiumPpm: numeric('sodium_ppm', { precision: 8, scale: 2 }).notNull().default('0'),
		chloridePpm: numeric('chloride_ppm', { precision: 8, scale: 2 }).notNull().default('0'),
		sulfatePpm: numeric('sulfate_ppm', { precision: 8, scale: 2 }).notNull().default('0'),
		bicarbonatePpm: numeric('bicarbonate_ppm', { precision: 8, scale: 2 }).notNull().default('0'),
		...timestamps
	},
	(table) => [index('water_profiles_owner_idx').on(table.ownerId)]
);

export const recipes = pgTable(
	'recipes',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		authorId: uuid('author_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),

		sourceWaterProfileId: uuid('source_water_profile_id').references(() => waterProfiles.id, {
			onDelete: 'set null'
		}),
		name: text('name').notNull(),
		brewType: brewTypeEnum('brew_type').notNull().default('beer'),
		style: text('style'),
		notes: text('notes'),
		advancedMode: boolean('advanced_mode').notNull().default(false),
		enabledModules: jsonb('enabled_modules').$type<string[]>().notNull().default(['core']),
		hiddenFields: jsonb('hidden_fields').$type<string[]>().notNull().default([]),
		targetBatchSizeL: numeric('target_batch_size_l', { precision: 8, scale: 3 }).notNull(),
		boilTimeMin: integer('boil_time_min').notNull().default(60),
		ibuFormula: ibuFormulaEnum('ibu_formula').notNull().default('tinseth'),
		targetOg: numeric('target_og', { precision: 6, scale: 3 }),
		targetFg: numeric('target_fg', { precision: 6, scale: 3 }),
		targetIbu: numeric('target_ibu', { precision: 6, scale: 2 }),
		targetSrm: numeric('target_srm', { precision: 6, scale: 2 }),
		...timestamps
	},
	(table) => [index('recipes_author_idx').on(table.authorId)]
);

export const recipeFermentables = pgTable(
	'recipe_fermentables',
	{
		recipeId: uuid('recipe_id')
			.notNull()
			.references(() => recipes.id, { onDelete: 'cascade' }),
		fermentableId: uuid('fermentable_id')
			.notNull()
			.references(() => fermentables.id, { onDelete: 'restrict' }),
		sortOrder: integer('sort_order').notNull().default(0),
		amountKg: numeric('amount_kg', { precision: 8, scale: 4 }).notNull(),
		usePhase: text('use_phase').notNull().default('mash'),
		notes: text('notes')
	},
	(table) => [primaryKey({ columns: [table.recipeId, table.fermentableId, table.sortOrder] })]
);

export const recipeHops = pgTable(
	'recipe_hops',
	{
		recipeId: uuid('recipe_id')
			.notNull()
			.references(() => recipes.id, { onDelete: 'cascade' }),
		hopId: uuid('hop_id')
			.notNull()
			.references(() => hops.id, { onDelete: 'restrict' }),
		sortOrder: integer('sort_order').notNull().default(0),
		amountKg: numeric('amount_kg', { precision: 8, scale: 4 }).notNull(),
		timeMin: integer('time_min'),
		usePhase: hopUsePhaseEnum('use_phase').notNull().default('boil'),
		notes: text('notes')
	},
	(table) => [primaryKey({ columns: [table.recipeId, table.hopId, table.sortOrder] })]
);

export const recipeYeasts = pgTable(
	'recipe_yeasts',
	{
		recipeId: uuid('recipe_id')
			.notNull()
			.references(() => recipes.id, { onDelete: 'cascade' }),
		yeastId: uuid('yeast_id')
			.notNull()
			.references(() => yeasts.id, { onDelete: 'restrict' }),
		sortOrder: integer('sort_order').notNull().default(0),
		amountKg: numeric('amount_kg', { precision: 8, scale: 4 }),
		amountL: numeric('amount_l', { precision: 8, scale: 4 }),
		amountIsWeight: boolean('amount_is_weight').notNull().default(true),
		cellsBillions: numeric('cells_billions', { precision: 10, scale: 2 }),
		isStarterRequired: boolean('is_starter_required').notNull().default(false),
		notes: text('notes')
	},
	(table) => [primaryKey({ columns: [table.recipeId, table.yeastId, table.sortOrder] })]
);

export const recipeMiscs = pgTable(
	'recipe_miscs',
	{
		recipeId: uuid('recipe_id')
			.notNull()
			.references(() => recipes.id, { onDelete: 'cascade' }),
		miscId: uuid('misc_id')
			.notNull()
			.references(() => miscs.id, { onDelete: 'restrict' }),
		sortOrder: integer('sort_order').notNull().default(0),
		amountKg: numeric('amount_kg', { precision: 8, scale: 4 }),
		amountL: numeric('amount_l', { precision: 8, scale: 4 }),
		amountIsWeight: boolean('amount_is_weight').notNull().default(true),
		timeMin: integer('time_min'),
		usePhase: miscUsePhaseEnum('use_phase').notNull().default('boil'),
		notes: text('notes')
	},
	(table) => [primaryKey({ columns: [table.recipeId, table.miscId, table.sortOrder] })]
);

export const batches = pgTable(
	'batches',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		recipeId: uuid('recipe_id')
			.notNull()
			.references(() => recipes.id, { onDelete: 'cascade' }),

		status: batchStatusEnum('status').notNull().default('draft'),
		name: text('name'),
		brewType: brewTypeEnum('brew_type'),
		style: text('style'),
		snapshot: jsonb('snapshot').$type<BatchRecipeSnapshot | null>(),
		brewDate: timestamp('brew_date', { withTimezone: true }),
		startedAt: timestamp('started_at', { withTimezone: true }),
		finishedAt: timestamp('finished_at', { withTimezone: true }),
		actualBatchSizeL: numeric('actual_batch_size_l', { precision: 8, scale: 3 }),
		notes: text('notes'),
		...timestamps
	},
	(table) => [
		index('batches_recipe_idx').on(table.recipeId),
		index('batches_status_idx').on(table.status)
	]
);

export const batchTelemetry = pgTable(
	'batch_telemetry',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		batchId: uuid('batch_id')
			.notNull()
			.references(() => batches.id, { onDelete: 'cascade' }),
		recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow().notNull(),
		gravity: numeric('gravity', { precision: 6, scale: 3 }),
		temperatureC: numeric('temperature_c', { precision: 5, scale: 2 }),
		notes: text('notes')
	},
	(table) => [
		index('batch_telemetry_batch_idx').on(table.batchId),
		index('batch_telemetry_recorded_at_idx').on(table.recordedAt)
	]
);

export const pluginsRegistry = pgTable('plugins_registry', {
	id: uuid('id').defaultRandom().primaryKey(),
	pluginName: text('plugin_name').notNull().unique(),
	version: text('version').notNull(),
	isEnabled: boolean('is_enabled').notNull().default(false),
	configJson: jsonb('config_json').$type<Record<string, unknown>>().notNull().default({}),
	...timestamps
});

export const auditLogs = pgTable(
	'audit_logs',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tableName: text('table_name').notNull(),
		recordId: text('record_id').notNull(),
		action: auditActionEnum('action').notNull(),
		changedByUserId: uuid('changed_by_user_id').references(() => users.id, {
			onDelete: 'set null'
		}),
		oldData: jsonb('old_data').$type<Record<string, unknown> | null>(),
		newData: jsonb('new_data').$type<Record<string, unknown> | null>(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		index('audit_logs_table_record_idx').on(table.tableName, table.recordId),
		index('audit_logs_changed_by_idx').on(table.changedByUserId)
	]
);

export const usersRelations = relations(users, ({ many }) => ({
	recipes: many(recipes),
	auditLogs: many(auditLogs),
	sessions: many(sessions)
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
	author: one(users, {
		fields: [recipes.authorId],
		references: [users.id]
	}),

	sourceWaterProfile: one(waterProfiles, {
		fields: [recipes.sourceWaterProfileId],
		references: [waterProfiles.id]
	}),
	fermentables: many(recipeFermentables),
	hops: many(recipeHops),
	yeasts: many(recipeYeasts),
	miscs: many(recipeMiscs),
	batches: many(batches)
}));

export const batchesRelations = relations(batches, ({ one, many }) => ({
	recipe: one(recipes, {
		fields: [batches.recipeId],
		references: [recipes.id]
	}),

	telemetry: many(batchTelemetry)
}));
