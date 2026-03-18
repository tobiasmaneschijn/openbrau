import type { PageServerLoad } from './$types';
import { listIngredientsByOwner } from '$lib/server/ingredients';

export const load: PageServerLoad = async ({ locals }) => ({
	ingredients: await listIngredientsByOwner(locals.user!.id)
});
