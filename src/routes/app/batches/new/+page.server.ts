import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { listEquipmentByOwner } from '$lib/server/equipment';
import { createBatch } from '$lib/server/batches';
import { optionalString, requiredString } from '$lib/server/forms';
import { listRecipesByAuthor } from '$lib/server/recipes';

export const load: PageServerLoad = async ({ locals, url }) => ({
	equipment: await listEquipmentByOwner(locals.user!.id),
	recipes: await listRecipesByAuthor(locals.user!.id),
	selectedRecipeId: url.searchParams.get('recipeId')
});

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const formData = await request.formData();

		try {
			const batch = await createBatch({
				userId: locals.user!.id,
				recipeId: requiredString(formData, 'recipeId'),
				equipmentId: optionalString(formData, 'equipmentId'),
				brewDate: optionalString(formData, 'brewDate') ? new Date(requiredString(formData, 'brewDate')) : null,
				actualBatchSizeL: optionalString(formData, 'actualBatchSizeL'),
				notes: optionalString(formData, 'notes')
			});

			throw redirect(302, `/app/batches/${batch.id}`);
		} catch (error) {
			if (error instanceof Response) throw error;
			return fail(400, { message: 'Unable to start batch.' });
		}
	}
};
