import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteBatchForOwner, listBatchesByOwner } from '$lib/server/batches';
import { requiredString } from '$lib/server/forms';
import * as m from '$lib/paraglide/messages';

export const load: PageServerLoad = async ({ locals }) => ({
	batches: await listBatchesByOwner(locals.user!.id)
});

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = requiredString(formData, 'id');

		const deleted = await deleteBatchForOwner(id, locals.user!.id);
		if (!deleted) {
			return fail(404, { message: m.batch_not_found() });
		}

		return { success: true };
	}
};
