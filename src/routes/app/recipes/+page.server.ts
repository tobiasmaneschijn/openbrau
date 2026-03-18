import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fromBeerXmlRecord, parseBeerXmlRecipe } from '$lib/recipes/beerxml';
import {
	addFermentableToRecipe,
	addHopToRecipe,
	addMiscToRecipe,
	addYeastToRecipe
} from '$lib/server/recipe-items';
import { deleteRecipeForAuthor, listRecipesByAuthor } from '$lib/server/recipes';
import { createRecipe } from '$lib/server/recipes';
import { optionalString, requiredString } from '$lib/server/forms';

export const load: PageServerLoad = async ({ locals }) => {
	const recipes = await listRecipesByAuthor(locals.user!.id);
	return { recipes };
};

async function readBeerXmlSource(formData: FormData) {
	const pastedXml = optionalString(formData, 'beerXml');
	if (pastedXml) {
		return pastedXml;
	}

	const file = formData.get('beerXmlFile');
	if (file instanceof File && file.size > 0) {
		return file.text();
	}

	throw fail(400, { message: 'Paste BeerXML or choose an XML file to import.' });
}

export const actions: Actions = {
	importBeerXml: async ({ request, locals }) => {
		const formData = await request.formData();

		try {
			const xml = await readBeerXmlSource(formData);
			const record = parseBeerXmlRecipe(xml);
			const recipe = fromBeerXmlRecord(record);

			const created = await createRecipe({
				authorId: locals.user!.id,
				name: recipe.name,
				brewType: recipe.brewType,
				notes: record.notes ?? null,
				enabledModules: recipe.enabledModules,
				targetBatchSizeL: recipe.process.targetBatchSizeL.toString(),
				boilTimeMin: recipe.process.boilTimeMin,
				ibuFormula: recipe.process.ibuFormula,
				targetOg: recipe.targets.og?.toString() ?? null,
				targetFg: recipe.targets.fg?.toString() ?? null,
				targetIbu: recipe.targets.ibu?.toString() ?? null,
				targetSrm: recipe.targets.srm?.toString() ?? null,
				advancedMode: recipe.advancedMode
			});

			for (const fermentable of record.fermentables) {
				await addFermentableToRecipe({
					userId: locals.user!.id,
					recipeId: created.id,
					name: fermentable.name,
					amountKg: fermentable.amountKg.toString(),
					usePhase: fermentable.addAfterBoil ? 'boil' : 'mash',
					notes: fermentable.notes ?? null,
					type: fermentable.type ?? null,
					origin: fermentable.origin ?? null,
					supplier: fermentable.supplier ?? null,
					yieldPct: fermentable.yieldPct.toString(),
					colorLovibond: fermentable.colorLovibond.toString(),
					moisturePct: fermentable.moisturePct?.toString() ?? null,
					coarseFineDiffPct: fermentable.coarseFineDiffPct?.toString() ?? null,
					diastaticPowerLintner: fermentable.diastaticPowerLintner?.toString() ?? null,
					proteinPct: fermentable.proteinPct?.toString() ?? null,
					maxInBatchPct: fermentable.maxInBatchPct?.toString() ?? null,
					recommendMash: fermentable.recommendMash ?? true,
					isExtract: record.type === 'Extract'
				});
			}

			for (const hop of record.hops) {
				await addHopToRecipe({
					userId: locals.user!.id,
					recipeId: created.id,
					name: hop.name,
					amountKg: hop.amountKg.toString(),
					alphaAcidPct: hop.alphaAcidPct.toString(),
					timeMin: hop.timeMin,
					notes: hop.notes ?? null,
					origin: hop.origin ?? null,
					supplier: hop.supplier ?? null,
					form: hop.form ?? null,
					type: hop.type ?? null,
					betaAcidPct: hop.betaAcidPct?.toString() ?? null,
					hsiPct: hop.hsiPct?.toString() ?? null,
					cohumulonePct: hop.cohumulonePct?.toString() ?? null,
					myrcenePct: hop.myrcenePct?.toString() ?? null,
					substitutes: hop.substitutes ?? null,
					usePhase:
						hop.use === 'Mash'
							? 'mash'
							: hop.use === 'First Wort'
								? 'first_wort'
								: hop.use === 'Whirlpool'
									? 'whirlpool'
									: hop.use === 'Dry Hop'
										? 'dry_hop'
										: 'boil'
				});
			}

			for (const yeast of record.yeasts) {
				await addYeastToRecipe({
					userId: locals.user!.id,
					recipeId: created.id,
					name: yeast.name,
					attenuationPct: yeast.attenuationPct?.toString() ?? null,
					amountKg:
						yeast.amountIsWeight === false ? null : (yeast.amount?.toString() ?? null),
					amountL:
						yeast.amountIsWeight === false ? (yeast.amount?.toString() ?? null) : null,
					amountIsWeight: yeast.amountIsWeight ?? true,
					notes: yeast.notes ?? null,
					lab: yeast.laboratory ?? null,
					form: yeast.form ?? null,
					type: yeast.type ?? null,
					productCode: yeast.productId ?? null,
					minTemperatureC: yeast.minTemperatureC?.toString() ?? null,
					maxTemperatureC: yeast.maxTemperatureC?.toString() ?? null,
					flocculation: yeast.flocculation ?? null,
					bestFor: yeast.bestFor ?? null,
					maxReuse: yeast.maxReuse == null ? null : Number(yeast.maxReuse),
					inventory: yeast.inventory ?? null,
					cultureDate: yeast.cultureDate ? new Date(yeast.cultureDate) : null,
					addToSecondary: yeast.addToSecondary ?? false
				});
			}

			for (const misc of record.miscs) {
				await addMiscToRecipe({
					userId: locals.user!.id,
					recipeId: created.id,
					name: misc.name,
					type: misc.type ?? 'other',
					amountKg:
						misc.amountIsWeight === false ? null : (misc.amount?.toString() ?? null),
					amountL:
						misc.amountIsWeight === false ? (misc.amount?.toString() ?? null) : null,
					amountIsWeight: misc.amountIsWeight ?? true,
					timeMin: misc.timeMin ?? null,
					notes: misc.notes ?? null,
					description: misc.notes ?? null,
					useFor: misc.useFor ?? null,
					usePhase:
						misc.use === 'Mash'
							? 'mash'
							: misc.use === 'Whirlpool'
								? 'whirlpool'
								: misc.use === 'Fermentation'
									? 'fermentation'
									: misc.use === 'Packaging'
										? 'packaging'
										: 'boil'
				});
			}
		} catch (error) {
			if (error instanceof Response) throw error;
			return fail(400, { message: 'Unable to import BeerXML.' });
		}

		return { success: true };
	},
	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = requiredString(formData, 'id');

		const deleted = await deleteRecipeForAuthor(id, locals.user!.id);
		if (!deleted) {
			return fail(404, { message: 'Recipe not found.' });
		}

		return { success: true };
	}
};
