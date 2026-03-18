import { BATCH_STATUS_ORDER } from '$lib/batches/config';
import type { BatchStatus } from '$lib/server/batches';

type IngredientsByOwnerResult = {
	fermentables: unknown[];
	hops: unknown[];
	yeasts: unknown[];
	miscs: unknown[];
};

export function countIngredients(ingredients: IngredientsByOwnerResult) {
	return (
		ingredients.fermentables.length +
		ingredients.hops.length +
		ingredients.yeasts.length +
		ingredients.miscs.length
	);
}

export function countBatchesByStatus<T extends { status: BatchStatus }>(batches: T[]) {
	const counts = Object.fromEntries(BATCH_STATUS_ORDER.map((status) => [status, 0])) as Record<
		BatchStatus,
		number
	>;

	for (const batch of batches) {
		counts[batch.status] += 1;
	}

	return counts;
}
