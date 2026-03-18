import { and, asc, eq, max } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { withAuditContext } from '$lib/server/db/audit';
import { db } from '$lib/server/db';
import * as m from '$lib/paraglide/messages';
import {
	fermentables,
	hops,
	miscs,
	recipeFermentables,
	recipeHops,
	recipeMiscs,
	recipes,
	recipeYeasts,
	yeasts
} from '$lib/server/db/schema';
import {
	createFermentable,
	createHop,
	createMisc,
	createYeast,
	findFermentableByName,
	findHopByName,
	findMiscByName,
	findYeastByName
} from './ingredients';

export type RecipeFermentableItem = {
	recipeId: string;
	fermentableId: string;
	sortOrder: number;
	amountKg: string;
	usePhase: string;
	notes: string | null;
	ingredient: typeof fermentables.$inferSelect;
};

export type RecipeHopItem = {
	recipeId: string;
	hopId: string;
	sortOrder: number;
	amountKg: string;
	timeMin: number | null;
	usePhase: typeof recipeHops.$inferSelect.usePhase;
	notes: string | null;
	ingredient: typeof hops.$inferSelect;
};

export type RecipeYeastItem = {
	recipeId: string;
	yeastId: string;
	sortOrder: number;
	amountKg: string | null;
	amountL: string | null;
	amountIsWeight: boolean;
	cellsBillions: string | null;
	isStarterRequired: boolean;
	notes: string | null;
	ingredient: typeof yeasts.$inferSelect;
};

export type RecipeMiscItem = {
	recipeId: string;
	miscId: string;
	sortOrder: number;
	amountKg: string | null;
	amountL: string | null;
	amountIsWeight: boolean;
	timeMin: number | null;
	usePhase: typeof recipeMiscs.$inferSelect.usePhase;
	notes: string | null;
	ingredient: typeof miscs.$inferSelect;
};

export type RecipeIngredients = {
	fermentables: RecipeFermentableItem[];
	hops: RecipeHopItem[];
	yeasts: RecipeYeastItem[];
	miscs: RecipeMiscItem[];
};

async function ensureRecipeOwned(recipeId: string, ownerId: string) {
	const [recipe] = await db
		.select({ id: recipes.id })
		.from(recipes)
		.where(and(eq(recipes.id, recipeId), eq(recipes.authorId, ownerId)))
		.limit(1);

	if (!recipe) {
		throw fail(404, { message: m.recipe_not_found() });
	}

	return recipe;
}

async function nextSortOrder(
	table: typeof recipeFermentables | typeof recipeHops | typeof recipeYeasts | typeof recipeMiscs,
	recipeId: string
) {
	const [row] = await db
		.select({ value: max(table.sortOrder) })
		.from(table)
		.where(eq(table.recipeId, recipeId));

	return (row?.value ?? -1) + 1;
}

export async function listRecipeIngredientsForAuthor(
	recipeId: string,
	ownerId: string
): Promise<RecipeIngredients> {
	await ensureRecipeOwned(recipeId, ownerId);

	const [fermentableRows, hopRows, yeastRows, miscRows] = await Promise.all([
		db
			.select({ item: recipeFermentables, ingredient: fermentables })
			.from(recipeFermentables)
			.innerJoin(fermentables, eq(recipeFermentables.fermentableId, fermentables.id))
			.where(eq(recipeFermentables.recipeId, recipeId))
			.orderBy(asc(recipeFermentables.sortOrder)),
		db
			.select({ item: recipeHops, ingredient: hops })
			.from(recipeHops)
			.innerJoin(hops, eq(recipeHops.hopId, hops.id))
			.where(eq(recipeHops.recipeId, recipeId))
			.orderBy(asc(recipeHops.sortOrder)),
		db
			.select({ item: recipeYeasts, ingredient: yeasts })
			.from(recipeYeasts)
			.innerJoin(yeasts, eq(recipeYeasts.yeastId, yeasts.id))
			.where(eq(recipeYeasts.recipeId, recipeId))
			.orderBy(asc(recipeYeasts.sortOrder)),
		db
			.select({ item: recipeMiscs, ingredient: miscs })
			.from(recipeMiscs)
			.innerJoin(miscs, eq(recipeMiscs.miscId, miscs.id))
			.where(eq(recipeMiscs.recipeId, recipeId))
			.orderBy(asc(recipeMiscs.sortOrder))
	]);

	return {
		fermentables: fermentableRows.map((row) => ({ ...row.item, ingredient: row.ingredient })),
		hops: hopRows.map((row) => ({ ...row.item, ingredient: row.ingredient })),
		yeasts: yeastRows.map((row) => ({ ...row.item, ingredient: row.ingredient })),
		miscs: miscRows.map((row) => ({ ...row.item, ingredient: row.ingredient }))
	};
}

export async function addFermentableToRecipe(input: {
	userId: string;
	recipeId: string;
	name: string;
	amountKg: string;
	usePhase?: string | null;
	notes?: string | null;
	type?: string | null;
	brand?: string | null;
	origin?: string | null;
	supplier?: string | null;
	yieldPct: string;
	colorLovibond?: string | null;
	moisturePct?: string | null;
	coarseFineDiffPct?: string | null;
	diastaticPowerLintner?: string | null;
	proteinPct?: string | null;
	maxInBatchPct?: string | null;
	recommendMash?: boolean;
	isExtract?: boolean;
}) {
	await ensureRecipeOwned(input.recipeId, input.userId);
	const ingredient =
		(await findFermentableByName(input.userId, input.name)) ??
		(await createFermentable({
			ownerId: input.userId,
			name: input.name,
			type: input.type ?? 'grain',
			brand: input.brand ?? null,
			origin: input.origin ?? null,
			supplier: input.supplier ?? null,
			yieldPct: input.yieldPct,
			colorLovibond: input.colorLovibond ?? '0',
			moisturePct: input.moisturePct ?? null,
			coarseFineDiffPct: input.coarseFineDiffPct ?? null,
			diastaticPowerLintner: input.diastaticPowerLintner ?? null,
			proteinPct: input.proteinPct ?? null,
			maxInBatchPct: input.maxInBatchPct ?? null,
			recommendMash: input.recommendMash ?? true,
			isExtract: input.isExtract ?? false
		}));

	return withAuditContext(input.userId, async (tx) => {
		const [item] = await tx
			.insert(recipeFermentables)
			.values({
				recipeId: input.recipeId,
				fermentableId: ingredient.id,
				sortOrder: await nextSortOrder(recipeFermentables, input.recipeId),
				amountKg: input.amountKg,
				usePhase: input.usePhase ?? 'mash',
				notes: input.notes ?? null
			})
			.returning();

		return item;
	});
}

export async function addHopToRecipe(input: {
	userId: string;
	recipeId: string;
	name: string;
	amountKg: string;
	alphaAcidPct: string;
	timeMin?: number | null;
	usePhase?: typeof recipeHops.$inferSelect.usePhase;
	notes?: string | null;
	origin?: string | null;
	supplier?: string | null;
	form?: string | null;
	type?: string | null;
	betaAcidPct?: string | null;
	hsiPct?: string | null;
	cohumulonePct?: string | null;
	myrcenePct?: string | null;
	substitutes?: string | null;
}) {
	await ensureRecipeOwned(input.recipeId, input.userId);
	const ingredient =
		(await findHopByName(input.userId, input.name)) ??
		(await createHop({
			ownerId: input.userId,
			name: input.name,
			alphaAcidPct: input.alphaAcidPct,
			origin: input.origin ?? null,
			supplier: input.supplier ?? null,
			form: input.form ?? 'pellet',
			type: input.type ?? 'bittering',
			betaAcidPct: input.betaAcidPct ?? null,
			hsiPct: input.hsiPct ?? null,
			cohumulonePct: input.cohumulonePct ?? null,
			myrcenePct: input.myrcenePct ?? null,
			substitutes: input.substitutes ?? null
		}));

	return withAuditContext(input.userId, async (tx) => {
		const [item] = await tx
			.insert(recipeHops)
			.values({
				recipeId: input.recipeId,
				hopId: ingredient.id,
				sortOrder: await nextSortOrder(recipeHops, input.recipeId),
				amountKg: input.amountKg,
				timeMin: input.timeMin ?? null,
				usePhase: input.usePhase ?? 'boil',
				notes: input.notes ?? null
			})
			.returning();

		return item;
	});
}

export async function addYeastToRecipe(input: {
	userId: string;
	recipeId: string;
	name: string;
	attenuationPct?: string | null;
	amountKg?: string | null;
	amountL?: string | null;
	amountIsWeight?: boolean;
	cellsBillions?: string | null;
	isStarterRequired?: boolean;
	notes?: string | null;
	lab?: string | null;
	supplier?: string | null;
	form?: string | null;
	type?: string | null;
	productCode?: string | null;
	minTemperatureC?: string | null;
	maxTemperatureC?: string | null;
	flocculation?: string | null;
	bestFor?: string | null;
	maxReuse?: number | null;
	inventory?: string | null;
	cultureDate?: Date | null;
	addToSecondary?: boolean;
}) {
	await ensureRecipeOwned(input.recipeId, input.userId);
	const ingredient =
		(await findYeastByName(input.userId, input.name)) ??
		(await createYeast({
			ownerId: input.userId,
			name: input.name,
			lab: input.lab ?? null,
			supplier: input.supplier ?? null,
			form: input.form ?? 'dry',
			type: input.type ?? 'ale',
			productCode: input.productCode ?? null,
			attenuationPct: input.attenuationPct ?? null,
			minTemperatureC: input.minTemperatureC ?? null,
			maxTemperatureC: input.maxTemperatureC ?? null,
			flocculation: input.flocculation ?? null,
			bestFor: input.bestFor ?? null,
			maxReuse: input.maxReuse ?? null,
			inventory: input.inventory ?? null,
			cultureDate: input.cultureDate ?? null,
			addToSecondary: input.addToSecondary ?? false,
			notes: input.notes ?? null
		}));

	return withAuditContext(input.userId, async (tx) => {
		const [item] = await tx
			.insert(recipeYeasts)
			.values({
				recipeId: input.recipeId,
				yeastId: ingredient.id,
				sortOrder: await nextSortOrder(recipeYeasts, input.recipeId),
				amountKg: input.amountIsWeight === false ? null : (input.amountKg ?? null),
				amountL: input.amountIsWeight === false ? (input.amountL ?? null) : null,
				amountIsWeight: input.amountIsWeight ?? true,
				cellsBillions: input.cellsBillions ?? null,
				isStarterRequired: input.isStarterRequired ?? false,
				notes: input.notes ?? null
			})
			.returning();

		return item;
	});
}

export async function addMiscToRecipe(input: {
	userId: string;
	recipeId: string;
	name: string;
	type: string;
	amountKg?: string | null;
	amountL?: string | null;
	amountIsWeight?: boolean;
	timeMin?: number | null;
	usePhase?: typeof recipeMiscs.$inferSelect.usePhase;
	notes?: string | null;
	description?: string | null;
	useFor?: string | null;
	supplier?: string | null;
}) {
	await ensureRecipeOwned(input.recipeId, input.userId);
	const ingredient =
		(await findMiscByName(input.userId, input.name)) ??
		(await createMisc({
			ownerId: input.userId,
			name: input.name,
			type: input.type,
			useFor: input.useFor ?? null,
			supplier: input.supplier ?? null,
			description: input.description ?? null,
			notes: input.notes ?? null
		}));

	return withAuditContext(input.userId, async (tx) => {
		const [item] = await tx
			.insert(recipeMiscs)
			.values({
				recipeId: input.recipeId,
				miscId: ingredient.id,
				sortOrder: await nextSortOrder(recipeMiscs, input.recipeId),
				amountKg: input.amountIsWeight === false ? null : (input.amountKg ?? null),
				amountL: input.amountIsWeight === false ? (input.amountL ?? null) : null,
				amountIsWeight: input.amountIsWeight ?? true,
				timeMin: input.timeMin ?? null,
				usePhase: input.usePhase ?? 'boil',
				notes: input.notes ?? null
			})
			.returning();

		return item;
	});
}

export async function removeFermentableFromRecipe(input: {
	userId: string;
	recipeId: string;
	fermentableId: string;
	sortOrder: number;
}) {
	await ensureRecipeOwned(input.recipeId, input.userId);

	return withAuditContext(input.userId, async (tx) => {
		const [record] = await tx
			.delete(recipeFermentables)
			.where(
				and(
					eq(recipeFermentables.recipeId, input.recipeId),
					eq(recipeFermentables.fermentableId, input.fermentableId),
					eq(recipeFermentables.sortOrder, input.sortOrder)
				)
			)
			.returning();

		return record ?? null;
	});
}

export async function removeHopFromRecipe(input: {
	userId: string;
	recipeId: string;
	hopId: string;
	sortOrder: number;
}) {
	await ensureRecipeOwned(input.recipeId, input.userId);

	return withAuditContext(input.userId, async (tx) => {
		const [record] = await tx
			.delete(recipeHops)
			.where(
				and(
					eq(recipeHops.recipeId, input.recipeId),
					eq(recipeHops.hopId, input.hopId),
					eq(recipeHops.sortOrder, input.sortOrder)
				)
			)
			.returning();

		return record ?? null;
	});
}

export async function removeYeastFromRecipe(input: {
	userId: string;
	recipeId: string;
	yeastId: string;
	sortOrder: number;
}) {
	await ensureRecipeOwned(input.recipeId, input.userId);

	return withAuditContext(input.userId, async (tx) => {
		const [record] = await tx
			.delete(recipeYeasts)
			.where(
				and(
					eq(recipeYeasts.recipeId, input.recipeId),
					eq(recipeYeasts.yeastId, input.yeastId),
					eq(recipeYeasts.sortOrder, input.sortOrder)
				)
			)
			.returning();

		return record ?? null;
	});
}

export async function removeMiscFromRecipe(input: {
	userId: string;
	recipeId: string;
	miscId: string;
	sortOrder: number;
}) {
	await ensureRecipeOwned(input.recipeId, input.userId);

	return withAuditContext(input.userId, async (tx) => {
		const [record] = await tx
			.delete(recipeMiscs)
			.where(
				and(
					eq(recipeMiscs.recipeId, input.recipeId),
					eq(recipeMiscs.miscId, input.miscId),
					eq(recipeMiscs.sortOrder, input.sortOrder)
				)
			)
			.returning();

		return record ?? null;
	});
}
