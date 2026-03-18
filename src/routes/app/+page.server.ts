import type { PageServerLoad } from './$types';
import { listBatchesByOwner } from '$lib/server/batches';
import { listEquipmentByOwner } from '$lib/server/equipment';
import { listRecipesByAuthor } from '$lib/server/recipes';

export const load: PageServerLoad = async ({ locals }) => {
	const [batches, equipment, recipes] = await Promise.all([
		listBatchesByOwner(locals.user!.id),
		listEquipmentByOwner(locals.user!.id),
		listRecipesByAuthor(locals.user!.id)
	]);

	return {
		batchCount: batches.length,
		equipmentCount: equipment.length,
		recipeCount: recipes.length,
		recentBatches: batches.slice(0, 3),
		recentEquipment: equipment.slice(0, 3),
		recentRecipes: recipes.slice(0, 3)
	};
};
