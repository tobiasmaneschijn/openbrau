import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { buildRecipeEngineSummary } from '$lib/recipes/engine';
import { BREW_TYPES, IBU_FORMULAS, RECIPE_MODULE_KEYS } from '$lib/recipes/config';
import { listEquipmentByOwner } from '$lib/server/equipment';
import { listIngredientsByOwner } from '$lib/server/ingredients';
import {
	addFermentableToRecipe,
	addHopToRecipe,
	addMiscToRecipe,
	addYeastToRecipe,
	listRecipeIngredientsForAuthor,
	removeFermentableFromRecipe,
	removeHopFromRecipe,
	removeMiscFromRecipe,
	removeYeastFromRecipe
} from '$lib/server/recipe-items';
import {
	deleteRecipeForAuthor,
	getRecipeForAuthor,
	updateRecipeForAuthor
} from '$lib/server/recipes';
import {
	booleanField,
	enumField,
	optionalString,
	requiredString,
	stringArrayField
} from '$lib/server/forms';

const HOP_USE_PHASES = ['mash', 'first_wort', 'boil', 'whirlpool', 'dry_hop'] as const;
const MISC_USE_PHASES = ['mash', 'boil', 'whirlpool', 'fermentation', 'packaging'] as const;

function enabledModules(formData: FormData, advancedMode: boolean) {
	const modules = stringArrayField(formData, 'enabledModules').filter((module) =>
		RECIPE_MODULE_KEYS.includes(module as (typeof RECIPE_MODULE_KEYS)[number])
	);

	if (!advancedMode) {
		return ['core'];
	}

	return ['core', ...modules.filter((module) => module !== 'core')];
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const [recipe, equipment, ingredientLibrary] = await Promise.all([
		getRecipeForAuthor(params.id, locals.user!.id),
		listEquipmentByOwner(locals.user!.id),
		listIngredientsByOwner(locals.user!.id)
	]);

	if (!recipe) {
		throw redirect(302, '/app/recipes');
	}

	const ingredients = await listRecipeIngredientsForAuthor(params.id, locals.user!.id);
	const assignedEquipment = equipment.find((profile) => profile.id === recipe.equipmentId) ?? null;

	return {
		recipe,
		equipment,
		ingredientLibrary,
		ingredients,
		engineSummary: buildRecipeEngineSummary(recipe, assignedEquipment, ingredients)
	};
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const advancedMode = booleanField(formData, 'advancedMode');

		const recipe = await updateRecipeForAuthor(params.id, locals.user!.id, {
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

		if (!recipe) {
			return fail(404, { message: 'Recipe not found.' });
		}

		return { success: true };
	},
	addFermentable: async ({ request, params, locals }) => {
		const formData = await request.formData();

		try {
			await addFermentableToRecipe({
				userId: locals.user!.id,
				recipeId: params.id,
				name: requiredString(formData, 'name'),
				amountKg: requiredString(formData, 'amountKg'),
				usePhase: optionalString(formData, 'usePhase'),
				notes: optionalString(formData, 'notes'),
				type: optionalString(formData, 'type'),
				brand: optionalString(formData, 'brand'),
				origin: optionalString(formData, 'origin'),
				yieldPct: requiredString(formData, 'yieldPct'),
				colorLovibond: optionalString(formData, 'colorLovibond'),
				isExtract: booleanField(formData, 'isExtract')
			});
		} catch (error) {
			if (error instanceof Response) throw error;
			return fail(400, { message: 'Unable to add fermentable.' });
		}

		return { success: true };
	},
	removeFermentable: async ({ request, params, locals }) => {
		const formData = await request.formData();
		await removeFermentableFromRecipe({
			userId: locals.user!.id,
			recipeId: params.id,
			fermentableId: requiredString(formData, 'fermentableId'),
			sortOrder: Number(requiredString(formData, 'sortOrder'))
		});
		return { success: true };
	},
	addHop: async ({ request, params, locals }) => {
		const formData = await request.formData();

		try {
			await addHopToRecipe({
				userId: locals.user!.id,
				recipeId: params.id,
				name: requiredString(formData, 'name'),
				amountKg: requiredString(formData, 'amountKg'),
				alphaAcidPct: requiredString(formData, 'alphaAcidPct'),
				timeMin: optionalString(formData, 'timeMin') ? Number(requiredString(formData, 'timeMin')) : null,
				usePhase: enumField(formData, 'usePhase', HOP_USE_PHASES),
				notes: optionalString(formData, 'notes'),
				origin: optionalString(formData, 'origin'),
				form: optionalString(formData, 'form'),
				type: optionalString(formData, 'type')
			});
		} catch (error) {
			if (error instanceof Response) throw error;
			return fail(400, { message: 'Unable to add hop.' });
		}

		return { success: true };
	},
	removeHop: async ({ request, params, locals }) => {
		const formData = await request.formData();
		await removeHopFromRecipe({
			userId: locals.user!.id,
			recipeId: params.id,
			hopId: requiredString(formData, 'hopId'),
			sortOrder: Number(requiredString(formData, 'sortOrder'))
		});
		return { success: true };
	},
	addYeast: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const amountIsWeight = formData.get('amountIsWeight') !== 'volume';

		try {
			await addYeastToRecipe({
				userId: locals.user!.id,
				recipeId: params.id,
				name: requiredString(formData, 'name'),
				attenuationPct: optionalString(formData, 'attenuationPct'),
				amountKg: amountIsWeight ? optionalString(formData, 'amountKg') : null,
				amountL: amountIsWeight ? null : optionalString(formData, 'amountL'),
				amountIsWeight,
				cellsBillions: optionalString(formData, 'cellsBillions'),
				isStarterRequired: booleanField(formData, 'isStarterRequired'),
				notes: optionalString(formData, 'notes'),
				lab: optionalString(formData, 'lab'),
				form: optionalString(formData, 'form'),
				type: optionalString(formData, 'type')
			});
		} catch (error) {
			if (error instanceof Response) throw error;
			return fail(400, { message: 'Unable to add yeast.' });
		}

		return { success: true };
	},
	removeYeast: async ({ request, params, locals }) => {
		const formData = await request.formData();
		await removeYeastFromRecipe({
			userId: locals.user!.id,
			recipeId: params.id,
			yeastId: requiredString(formData, 'yeastId'),
			sortOrder: Number(requiredString(formData, 'sortOrder'))
		});
		return { success: true };
	},
	addMisc: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const amountIsWeight = formData.get('amountIsWeight') !== 'volume';

		try {
			await addMiscToRecipe({
				userId: locals.user!.id,
				recipeId: params.id,
				name: requiredString(formData, 'name'),
				type: requiredString(formData, 'type'),
				amountKg: amountIsWeight ? optionalString(formData, 'amountKg') : null,
				amountL: amountIsWeight ? null : optionalString(formData, 'amountL'),
				amountIsWeight,
				timeMin: optionalString(formData, 'timeMin') ? Number(requiredString(formData, 'timeMin')) : null,
				usePhase: enumField(formData, 'usePhase', MISC_USE_PHASES),
				notes: optionalString(formData, 'notes'),
				description: optionalString(formData, 'description'),
				useFor: optionalString(formData, 'useFor')
			});
		} catch (error) {
			if (error instanceof Response) throw error;
			return fail(400, { message: 'Unable to add misc ingredient.' });
		}

		return { success: true };
	},
	removeMisc: async ({ request, params, locals }) => {
		const formData = await request.formData();
		await removeMiscFromRecipe({
			userId: locals.user!.id,
			recipeId: params.id,
			miscId: requiredString(formData, 'miscId'),
			sortOrder: Number(requiredString(formData, 'sortOrder'))
		});
		return { success: true };
	},
	delete: async ({ params, locals }) => {
		await deleteRecipeForAuthor(params.id, locals.user!.id);
		throw redirect(302, '/app/recipes');
	}
};
