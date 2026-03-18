import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteEquipmentForOwner, listEquipmentByOwner } from '$lib/server/equipment';
import { requiredString } from '$lib/server/forms';

export const load: PageServerLoad = async ({ locals }) => ({
	equipment: await listEquipmentByOwner(locals.user!.id)
});

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = requiredString(formData, 'id');

		const deleted = await deleteEquipmentForOwner(id, locals.user!.id);
		if (!deleted) {
			return fail(404, { message: 'Equipment profile not found.' });
		}

		return { success: true };
	}
};
