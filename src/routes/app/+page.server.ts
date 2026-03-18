import type { PageServerLoad } from './$types';
import { countBatchesByStatus, countIngredients } from '$lib/overview/summary';
import { listBatchesByOwner } from '$lib/server/batches';
import { listEquipmentByOwner } from '$lib/server/equipment';
import { listIngredientsByOwner } from '$lib/server/ingredients';
import { listRecipesByAuthor } from '$lib/server/recipes';

export const load: PageServerLoad = async ({ depends, locals }) => {
	depends('app:overview');

	const [batches, equipment, ingredients, recipes] = await Promise.all([
		listBatchesByOwner(locals.user!.id),
		listEquipmentByOwner(locals.user!.id),
		listIngredientsByOwner(locals.user!.id),
		listRecipesByAuthor(locals.user!.id)
	]);

	const activeBatches = batches.filter((batch) => batch.status !== 'finished');

	return {
		activeBatchCount: activeBatches.length,
		activeBatches: activeBatches.slice(0, 4),
		batchCount: batches.length,
		batchStatusCounts: countBatchesByStatus(batches),
		equipmentCount: equipment.length,
		fetchedAt: new Date(),
		ingredientCount: countIngredients(ingredients),
		recipeCount: recipes.length,
		recentBatches: batches.slice(0, 3),
		recentEquipment: equipment.slice(0, 3),
		recentRecipes: recipes.slice(0, 3)
	};
};
