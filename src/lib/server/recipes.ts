import { and, asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { withAuditContext } from '$lib/server/db/audit';
import { recipes } from '$lib/server/db/schema';

export type RecipeSummary = typeof recipes.$inferSelect;
export type BrewType = (typeof recipes.$inferSelect)['brewType'];

export type CreateRecipeInput = {
	authorId: string;
	name: string;
	brewType: BrewType;
	style?: string | null;
	sourceWaterProfileId?: string | null;
	notes?: string | null;
	hiddenFields?: string[];
	enabledModules?: string[];
	targetBatchSizeL: string;
	boilTimeMin?: number;
	ibuFormula?: RecipeSummary['ibuFormula'];
	targetOg?: string | null;
	targetFg?: string | null;
	targetIbu?: string | null;
	targetSrm?: string | null;
	advancedMode?: boolean;
};

export async function listRecipesByAuthor(authorId: string) {
	return db.select().from(recipes).where(eq(recipes.authorId, authorId)).orderBy(asc(recipes.name));
}

export async function getRecipeForAuthor(id: string, authorId: string) {
	const [recipe] = await db
		.select()
		.from(recipes)
		.where(and(eq(recipes.id, id), eq(recipes.authorId, authorId)))
		.limit(1);

	return recipe ?? null;
}

export async function createRecipe(input: CreateRecipeInput) {
	return withAuditContext(input.authorId, async (tx) => {
		const [recipe] = await tx
			.insert(recipes)
			.values({
				authorId: input.authorId,
				name: input.name,
				brewType: input.brewType,
				style: input.style ?? null,
				sourceWaterProfileId: input.sourceWaterProfileId ?? null,
				notes: input.notes ?? null,
				hiddenFields: input.hiddenFields ?? [],
				enabledModules: input.enabledModules ?? ['core'],
				targetBatchSizeL: input.targetBatchSizeL,
				boilTimeMin: input.boilTimeMin ?? 60,
				ibuFormula: input.ibuFormula ?? 'tinseth',
				targetOg: input.targetOg ?? null,
				targetFg: input.targetFg ?? null,
				targetIbu: input.targetIbu ?? null,
				targetSrm: input.targetSrm ?? null,
				advancedMode: input.advancedMode ?? false
			})
			.returning();

		return recipe;
	});
}

export async function updateRecipeForAuthor(
	id: string,
	authorId: string,
	input: Omit<CreateRecipeInput, 'authorId'>
) {
	return withAuditContext(authorId, async (tx) => {
		const [recipe] = await tx
			.update(recipes)
			.set({
				name: input.name,
				brewType: input.brewType,
				style: input.style ?? null,
				sourceWaterProfileId: input.sourceWaterProfileId ?? null,
				notes: input.notes ?? null,
				hiddenFields: input.hiddenFields ?? [],
				enabledModules: input.enabledModules ?? ['core'],
				targetBatchSizeL: input.targetBatchSizeL,
				boilTimeMin: input.boilTimeMin ?? 60,
				ibuFormula: input.ibuFormula ?? 'tinseth',
				targetOg: input.targetOg ?? null,
				targetFg: input.targetFg ?? null,
				targetIbu: input.targetIbu ?? null,
				targetSrm: input.targetSrm ?? null,
				advancedMode: input.advancedMode ?? false,
				updatedAt: new Date()
			})
			.where(and(eq(recipes.id, id), eq(recipes.authorId, authorId)))
			.returning();

		return recipe ?? null;
	});
}

export async function deleteRecipeForAuthor(id: string, authorId: string) {
	return withAuditContext(authorId, async (tx) => {
		const [recipe] = await tx
			.delete(recipes)
			.where(and(eq(recipes.id, id), eq(recipes.authorId, authorId)))
			.returning();

		return recipe ?? null;
	});
}
