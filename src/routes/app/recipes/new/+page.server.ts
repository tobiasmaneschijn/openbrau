import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { BREW_TYPES, IBU_FORMULAS, RECIPE_MODULE_KEYS } from '$lib/recipes/config';
import { listEquipmentByOwner } from '$lib/server/equipment';
import { createRecipe } from '$lib/server/recipes';
import {
	booleanField,
	enumField,
	optionalString,
	requiredString,
	stringArrayField
} from '$lib/server/forms';

export const load: PageServerLoad = async ({ locals }) => ({
	equipment: await listEquipmentByOwner(locals.user!.id)
});

function enabledModules(formData: FormData, advancedMode: boolean) {
	const modules = stringArrayField(formData, 'enabledModules').filter((module) =>
		RECIPE_MODULE_KEYS.includes(module as (typeof RECIPE_MODULE_KEYS)[number])
	);

	if (!advancedMode) {
		return ['core'];
	}

	return ['core', ...modules.filter((module) => module !== 'core')];
}

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const formData = await request.formData();
		let recipeId: string;
		const advancedMode = booleanField(formData, 'advancedMode');

		try {
			const recipe = await createRecipe({
				authorId: locals.user!.id,
				name: requiredString(formData, 'name'),
				brewType: enumField(formData, 'brewType', BREW_TYPES),
				style: optionalString(formData, 'style'),
				equipmentId: optionalString(formData, 'equipmentId'),
				notes: optionalString(formData, 'notes'),
				hiddenFields: stringArrayField(formData, 'hiddenFields'),
				enabledModules: enabledModules(formData, advancedMode),
				targetBatchSizeL: requiredString(formData, 'targetBatchSizeL'),
				boilTimeMin: Number(optionalString(formData, 'boilTimeMin') ?? '60'),
				ibuFormula: enumField(formData, 'ibuFormula', IBU_FORMULAS),
				targetOg: optionalString(formData, 'targetOg'),
				targetFg: optionalString(formData, 'targetFg'),
				targetIbu: optionalString(formData, 'targetIbu'),
				targetSrm: optionalString(formData, 'targetSrm'),
				advancedMode
			});
			recipeId = recipe.id;
		} catch (error) {
			if (error instanceof Response) throw error;
			return fail(400, { message: 'Unable to create recipe.' });
		}

		throw redirect(302, `/app/recipes/${recipeId}`);
	}
};
