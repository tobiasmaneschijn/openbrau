import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	deleteEquipmentForOwner,
	getEquipmentForOwner,
	updateEquipmentForOwner
} from '$lib/server/equipment';
import { booleanField, optionalString, requiredString } from '$lib/server/forms';

export const load: PageServerLoad = async ({ params, locals }) => {
	const profile = await getEquipmentForOwner(params.id, locals.user!.id);
	if (!profile) {
		throw redirect(302, '/app/equipment');
	}

	return { profile };
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		const formData = await request.formData();

		const profile = await updateEquipmentForOwner(params.id, locals.user!.id, {
			name: requiredString(formData, 'name'),
			description: optionalString(formData, 'description'),
			efficiencyPct: requiredString(formData, 'efficiencyPct'),
			batchSizeL: requiredString(formData, 'batchSizeL'),
			boilOffRateLph: requiredString(formData, 'boilOffRateLph'),
			mashTunLossL: optionalString(formData, 'mashTunLossL') ?? '0',
			trubLossL: optionalString(formData, 'trubLossL') ?? '0',
			isDefault: booleanField(formData, 'isDefault')
		});

		if (!profile) {
			return fail(404, { message: 'Equipment profile not found.' });
		}

		return { success: true };
	},
	delete: async ({ params, locals }) => {
		await deleteEquipmentForOwner(params.id, locals.user!.id);
		throw redirect(302, '/app/equipment');
	}
};
