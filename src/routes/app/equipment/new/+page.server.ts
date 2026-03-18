import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createEquipment } from '$lib/server/equipment';
import { booleanField, optionalString, requiredString } from '$lib/server/forms';
import * as m from '$lib/paraglide/messages';

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const formData = await request.formData();
		let profileId: string;

		try {
			const profile = await createEquipment({
				ownerId: locals.user!.id,
				name: requiredString(formData, 'name'),
				description: optionalString(formData, 'description'),
				efficiencyPct: requiredString(formData, 'efficiencyPct'),
				batchSizeL: requiredString(formData, 'batchSizeL'),
				boilOffRateLph: requiredString(formData, 'boilOffRateLph'),
				mashTunLossL: optionalString(formData, 'mashTunLossL') ?? '0',
				trubLossL: optionalString(formData, 'trubLossL') ?? '0',
				isDefault: booleanField(formData, 'isDefault')
			});
			profileId = profile.id;
		} catch (error) {
			if (error instanceof Response) throw error;
			return fail(400, { message: m.unable_to_create_equipment() });
		}

		throw redirect(302, `/app/equipment/${profileId}`);
	}
};
