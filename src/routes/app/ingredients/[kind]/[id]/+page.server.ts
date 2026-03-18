import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { INGREDIENT_KIND_LABELS } from '$lib/ingredients/config';
import {
	deleteFermentableForOwner,
	deleteHopForOwner,
	deleteMiscForOwner,
	deleteYeastForOwner,
	getFermentableForOwner,
	getHopForOwner,
	getMiscForOwner,
	getYeastForOwner,
	type IngredientKind,
	updateFermentableForOwner,
	updateHopForOwner,
	updateMiscForOwner,
	updateYeastForOwner
} from '$lib/server/ingredients';
import { booleanField, optionalString, requiredString } from '$lib/server/forms';
import * as m from '$lib/paraglide/messages';

function parseKind(kind: string): IngredientKind {
	if (!(kind in INGREDIENT_KIND_LABELS)) {
		throw redirect(302, '/app/ingredients');
	}

	return kind as IngredientKind;
}

async function loadIngredient(kind: IngredientKind, id: string, userId: string) {
	switch (kind) {
		case 'fermentables':
			return getFermentableForOwner(id, userId);
		case 'hops':
			return getHopForOwner(id, userId);
		case 'yeasts':
			return getYeastForOwner(id, userId);
		case 'miscs':
			return getMiscForOwner(id, userId);
	}
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const kind = parseKind(params.kind);
	const ingredient = await loadIngredient(kind, params.id, locals.user!.id);

	if (!ingredient) {
		throw redirect(302, '/app/ingredients');
	}

	return { kind, ingredient };
};

export const actions: Actions = {
	save: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const kind = parseKind(params.kind);

		try {
			switch (kind) {
				case 'fermentables':
					await updateFermentableForOwner(params.id, locals.user!.id, {
						name: requiredString(formData, 'name'),
						type: optionalString(formData, 'type'),
						brand: optionalString(formData, 'brand'),
						origin: optionalString(formData, 'origin'),
						supplier: optionalString(formData, 'supplier'),
						sourceUrl: optionalString(formData, 'sourceUrl'),
						yieldPct: requiredString(formData, 'yieldPct'),
						colorLovibond: optionalString(formData, 'colorLovibond'),
						moisturePct: optionalString(formData, 'moisturePct'),
						coarseFineDiffPct: optionalString(formData, 'coarseFineDiffPct'),
						diastaticPowerLintner: optionalString(formData, 'diastaticPowerLintner'),
						proteinPct: optionalString(formData, 'proteinPct'),
						maxInBatchPct: optionalString(formData, 'maxInBatchPct'),
						recommendMash: booleanField(formData, 'recommendMash'),
						isExtract: booleanField(formData, 'isExtract'),
						notes: optionalString(formData, 'notes')
					});
					break;
				case 'hops':
					await updateHopForOwner(params.id, locals.user!.id, {
						name: requiredString(formData, 'name'),
						origin: optionalString(formData, 'origin'),
						supplier: optionalString(formData, 'supplier'),
						sourceUrl: optionalString(formData, 'sourceUrl'),
						alphaAcidPct: requiredString(formData, 'alphaAcidPct'),
						betaAcidPct: optionalString(formData, 'betaAcidPct'),
						form: optionalString(formData, 'form'),
						type: optionalString(formData, 'type'),
						hsiPct: optionalString(formData, 'hsiPct'),
						cohumulonePct: optionalString(formData, 'cohumulonePct'),
						myrcenePct: optionalString(formData, 'myrcenePct'),
						substitutes: optionalString(formData, 'substitutes'),
						notes: optionalString(formData, 'notes')
					});
					break;
				case 'yeasts':
					await updateYeastForOwner(params.id, locals.user!.id, {
						name: requiredString(formData, 'name'),
						lab: optionalString(formData, 'lab'),
						supplier: optionalString(formData, 'supplier'),
						sourceUrl: optionalString(formData, 'sourceUrl'),
						productCode: optionalString(formData, 'productCode'),
						type: optionalString(formData, 'type'),
						form: optionalString(formData, 'form'),
						attenuationPct: optionalString(formData, 'attenuationPct'),
						minTemperatureC: optionalString(formData, 'minTemperatureC'),
						maxTemperatureC: optionalString(formData, 'maxTemperatureC'),
						flocculation: optionalString(formData, 'flocculation'),
						bestFor: optionalString(formData, 'bestFor'),
						maxReuse: optionalString(formData, 'maxReuse')
							? Number(requiredString(formData, 'maxReuse'))
							: null,
						inventory: optionalString(formData, 'inventory'),
						cultureDate: optionalString(formData, 'cultureDate')
							? new Date(requiredString(formData, 'cultureDate'))
							: null,
						addToSecondary: booleanField(formData, 'addToSecondary'),
						notes: optionalString(formData, 'notes')
					});
					break;
				case 'miscs':
					await updateMiscForOwner(params.id, locals.user!.id, {
						name: requiredString(formData, 'name'),
						type: requiredString(formData, 'type'),
						useFor: optionalString(formData, 'useFor'),
						supplier: optionalString(formData, 'supplier'),
						sourceUrl: optionalString(formData, 'sourceUrl'),
						description: optionalString(formData, 'description'),
						notes: optionalString(formData, 'notes')
					});
					break;
			}
		} catch (error) {
			if (error instanceof Response) throw error;
			return fail(400, { message: m.unable_to_save_ingredient() });
		}

		return { success: true };
	},
	delete: async ({ params, locals }) => {
		const kind = parseKind(params.kind);

		switch (kind) {
			case 'fermentables':
				await deleteFermentableForOwner(params.id, locals.user!.id);
				break;
			case 'hops':
				await deleteHopForOwner(params.id, locals.user!.id);
				break;
			case 'yeasts':
				await deleteYeastForOwner(params.id, locals.user!.id);
				break;
			case 'miscs':
				await deleteMiscForOwner(params.id, locals.user!.id);
				break;
		}

		throw redirect(302, '/app/ingredients');
	}
};
