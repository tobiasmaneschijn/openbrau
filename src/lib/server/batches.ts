import { and, asc, desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { withAuditContext } from '$lib/server/db/audit';
import { db } from '$lib/server/db';
import { batchTelemetry, batches, recipes } from '$lib/server/db/schema';
import { canTransitionBatchStatus } from '$lib/batches/config';
import * as m from '$lib/paraglide/messages';

export type BatchRecord = typeof batches.$inferSelect;
export type BatchStatus = BatchRecord['status'];
export type BatchTelemetryRecord = typeof batchTelemetry.$inferSelect;

export type BatchListItem = {
	id: string;
	status: BatchStatus;
	brewDate: Date | null;
	startedAt: Date | null;
	finishedAt: Date | null;
	actualBatchSizeL: string | null;
	notes: string | null;
	createdAt: Date;
	updatedAt: Date;
	recipeId: string;
	recipeName: string;
	recipeStyle: string | null;
	recipeBrewType: typeof recipes.$inferSelect.brewType;
};

export type BatchDetail = BatchListItem & {
	telemetry: BatchTelemetryRecord[];
};

export type CreateBatchInput = {
	userId: string;
	recipeId: string;
	brewDate?: Date | null;
	actualBatchSizeL?: string | null;
	notes?: string | null;
};

export type UpdateBatchLogInput = {
	brewDate?: Date | null;
	actualBatchSizeL?: string | null;
	notes?: string | null;
};

export type AddBatchTelemetryInput = {
	recordedAt?: Date | null;
	gravity?: string | null;
	temperatureC?: string | null;
	notes?: string | null;
};

export async function listBatchesByOwner(userId: string) {
	const rows = await db
		.select({
			batch: batches,
			recipe: recipes
		})
		.from(batches)
		.innerJoin(recipes, eq(batches.recipeId, recipes.id))
		.where(eq(recipes.authorId, userId))
		.orderBy(desc(batches.createdAt));

	return rows.map((row) => ({
		id: row.batch.id,
		status: row.batch.status,
		brewDate: row.batch.brewDate,
		startedAt: row.batch.startedAt,
		finishedAt: row.batch.finishedAt,
		actualBatchSizeL: row.batch.actualBatchSizeL,
		notes: row.batch.notes,
		createdAt: row.batch.createdAt,
		updatedAt: row.batch.updatedAt,
		recipeId: row.recipe.id,
		recipeName: row.recipe.name,
		recipeStyle: row.recipe.style,
		recipeBrewType: row.recipe.brewType
	}));
}

export async function getBatchForOwner(id: string, userId: string) {
	const [batchRow, telemetry] = await Promise.all([
		db
			.select({
				batch: batches,
				recipe: recipes
			})
			.from(batches)
			.innerJoin(recipes, eq(batches.recipeId, recipes.id))
			.where(and(eq(batches.id, id), eq(recipes.authorId, userId)))
			.limit(1),
		db
			.select()
			.from(batchTelemetry)
			.where(eq(batchTelemetry.batchId, id))
			.orderBy(desc(batchTelemetry.recordedAt), desc(batchTelemetry.id))
	]);

	if (!batchRow[0]) {
		return null;
	}

	const row = batchRow[0];

	return {
		id: row.batch.id,
		status: row.batch.status,
		brewDate: row.batch.brewDate,
		startedAt: row.batch.startedAt,
		finishedAt: row.batch.finishedAt,
		actualBatchSizeL: row.batch.actualBatchSizeL,
		notes: row.batch.notes,
		createdAt: row.batch.createdAt,
		updatedAt: row.batch.updatedAt,
		recipeId: row.recipe.id,
		recipeName: row.recipe.name,
		recipeStyle: row.recipe.style,
		recipeBrewType: row.recipe.brewType,
		telemetry
	} satisfies BatchDetail;
}

async function getRecipeForBatchCreation(recipeId: string, userId: string) {
	const [recipe] = await db
		.select({
			id: recipes.id
		})
		.from(recipes)
		.where(and(eq(recipes.id, recipeId), eq(recipes.authorId, userId)))
		.limit(1);

	return recipe ?? null;
}

export async function createBatch(input: CreateBatchInput) {
	const recipe = await getRecipeForBatchCreation(input.recipeId, input.userId);
	if (!recipe) {
		throw fail(404, { message: m.recipe_not_found() });
	}

	return withAuditContext(input.userId, async (tx) => {
		const [batch] = await tx
			.insert(batches)
			.values({
				recipeId: input.recipeId,
				brewDate: input.brewDate ?? null,
				actualBatchSizeL: input.actualBatchSizeL ?? null,
				notes: input.notes ?? null
			})
			.returning();

		return batch;
	});
}

export async function updateBatchLogForOwner(
	id: string,
	userId: string,
	input: UpdateBatchLogInput
) {
	return withAuditContext(userId, async (tx) => {
		const [batch] = await tx
			.update(batches)
			.set({
				brewDate: input.brewDate ?? null,
				actualBatchSizeL: input.actualBatchSizeL ?? null,
				notes: input.notes ?? null,
				updatedAt: new Date()
			})
			.from(recipes)
			.where(
				and(eq(batches.id, id), eq(batches.recipeId, recipes.id), eq(recipes.authorId, userId))
			)
			.returning();

		return batch ?? null;
	});
}

export async function transitionBatchStatusForOwner(
	id: string,
	userId: string,
	nextStatus: BatchStatus
) {
	const batch = await getBatchForOwner(id, userId);
	if (!batch) {
		return null;
	}

	if (!canTransitionBatchStatus(batch.status, nextStatus)) {
		throw fail(400, { message: m.batch_status_change_not_allowed() });
	}

	return withAuditContext(userId, async (tx) => {
		const now = new Date();
		const [updated] = await tx
			.update(batches)
			.set({
				status: nextStatus,
				startedAt: nextStatus === 'brewing' ? (batch.startedAt ?? now) : batch.startedAt,
				finishedAt: nextStatus === 'finished' ? now : batch.finishedAt,
				brewDate: nextStatus === 'brewing' ? (batch.brewDate ?? now) : batch.brewDate,
				updatedAt: now
			})
			.from(recipes)
			.where(
				and(eq(batches.id, id), eq(batches.recipeId, recipes.id), eq(recipes.authorId, userId))
			)
			.returning();

		return updated ?? null;
	});
}

export async function addBatchTelemetryForOwner(
	batchId: string,
	userId: string,
	input: AddBatchTelemetryInput
) {
	const batch = await getBatchForOwner(batchId, userId);
	if (!batch) {
		return null;
	}

	return withAuditContext(userId, async (tx) => {
		const [entry] = await tx
			.insert(batchTelemetry)
			.values({
				batchId,
				recordedAt: input.recordedAt ?? new Date(),
				gravity: input.gravity ?? null,
				temperatureC: input.temperatureC ?? null,
				notes: input.notes ?? null
			})
			.returning();

		return entry;
	});
}

export async function deleteBatchForOwner(id: string, userId: string) {
	const batch = await getBatchForOwner(id, userId);
	if (!batch) {
		return null;
	}

	return withAuditContext(userId, async (tx) => {
		const [deleted] = await tx.delete(batches).where(eq(batches.id, id)).returning();

		return deleted ?? null;
	});
}

export async function listTelemetryForBatch(batchId: string) {
	return db
		.select()
		.from(batchTelemetry)
		.where(eq(batchTelemetry.batchId, batchId))
		.orderBy(asc(batchTelemetry.recordedAt));
}
