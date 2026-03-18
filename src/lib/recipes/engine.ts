import type { RecipeDefinition, RecipeModuleKey } from '$lib/recipes/domain';
import { GENERIC_EQUIPMENT_PROFILE, RECIPE_MODULE_KEYS } from '$lib/recipes/domain';
import type { RecipeEngineSummary } from '$lib/math/recipe-engine';
import { calculateRecipeSummary } from '$lib/math/recipe-engine';
import type { EquipmentRecord } from '$lib/server/equipment';
import type { RecipeIngredients } from '$lib/server/recipe-items';
import type { RecipeSummary } from '$lib/server/recipes';

function numericValue(value: string | number | null | undefined) {
	if (value == null || value === '') {
		return null;
	}

	return typeof value === 'number' ? value : Number(value);
}

function enabledModules(recipe: RecipeSummary): RecipeModuleKey[] {
	const modules = recipe.enabledModules?.filter((module): module is RecipeModuleKey =>
		RECIPE_MODULE_KEYS.includes(module as RecipeModuleKey)
	);

	if (!modules?.length) {
		return ['core'];
	}

	return modules.includes('core') ? modules : ['core', ...modules];
}

export function buildRecipeDefinition(
	recipe: RecipeSummary,
	equipment?: EquipmentRecord | null,
	ingredients?: Partial<RecipeIngredients>
): RecipeDefinition {
	return {
		name: recipe.name,
		brewType: recipe.brewType,
		notes: recipe.notes,
		advancedMode: recipe.advancedMode,
		enabledModules: enabledModules(recipe),
		process: {
			targetBatchSizeL: Number(recipe.targetBatchSizeL),
			boilTimeMin: recipe.boilTimeMin,
			ibuFormula: recipe.ibuFormula
		},
		targets: {
			og: numericValue(recipe.targetOg),
			fg: numericValue(recipe.targetFg),
			ibu: numericValue(recipe.targetIbu),
			srm: numericValue(recipe.targetSrm)
		},
		equipment: equipment
			? {
					name: equipment.name,
					efficiencyPct: Number(equipment.efficiencyPct),
					batchSizeL: Number(equipment.batchSizeL),
					boilOffRateLph: Number(equipment.boilOffRateLph),
					mashTunLossL: Number(equipment.mashTunLossL),
					trubLossL: Number(equipment.trubLossL)
				}
			: { ...GENERIC_EQUIPMENT_PROFILE },
		fermentables:
			ingredients?.fermentables?.map((item) => ({
				name: item.ingredient.name,
				amountKg: Number(item.amountKg),
				yieldPct: Number(item.ingredient.yieldPct),
				colorLovibond: Number(item.ingredient.colorLovibond),
				type: item.ingredient.type,
				origin: item.ingredient.origin,
				supplier: item.ingredient.supplier,
				notes: item.notes ?? item.ingredient.notes,
				coarseFineDiffPct:
					item.ingredient.coarseFineDiffPct == null
						? null
						: Number(item.ingredient.coarseFineDiffPct),
				moisturePct:
					item.ingredient.moisturePct == null ? null : Number(item.ingredient.moisturePct),
				diastaticPowerLintner:
					item.ingredient.diastaticPowerLintner == null
						? null
						: Number(item.ingredient.diastaticPowerLintner),
				proteinPct:
					item.ingredient.proteinPct == null ? null : Number(item.ingredient.proteinPct),
				maxInBatchPct:
					item.ingredient.maxInBatchPct == null ? null : Number(item.ingredient.maxInBatchPct),
				recommendMash: item.ingredient.recommendMash,
				addAfterBoil: item.usePhase !== 'mash',
				isExtract: item.ingredient.isExtract
			})) ?? [],
		hops:
			ingredients?.hops?.map((item) => ({
				name: item.ingredient.name,
				amountKg: Number(item.amountKg),
				alphaAcidPct: Number(item.ingredient.alphaAcidPct),
				timeMin: item.timeMin ?? 0,
				betaAcidPct:
					item.ingredient.betaAcidPct == null ? null : Number(item.ingredient.betaAcidPct),
				form: item.ingredient.form,
				type: item.ingredient.type,
				origin: item.ingredient.origin,
				supplier: item.ingredient.supplier,
				hsiPct: item.ingredient.hsiPct == null ? null : Number(item.ingredient.hsiPct),
				substitutes: item.ingredient.substitutes,
				cohumulonePct:
					item.ingredient.cohumulonePct == null
						? null
						: Number(item.ingredient.cohumulonePct),
				myrcenePct:
					item.ingredient.myrcenePct == null ? null : Number(item.ingredient.myrcenePct),
				notes: item.notes ?? item.ingredient.notes,
				usePhase: item.usePhase
			})) ?? [],
		yeasts:
			ingredients?.yeasts?.map((item) => ({
				name: item.ingredient.name,
				lab: item.ingredient.lab,
				productCode: item.ingredient.productCode,
				type: item.ingredient.type,
				form: item.ingredient.form,
				attenuationPct:
					item.ingredient.attenuationPct == null ? null : Number(item.ingredient.attenuationPct),
				minTemperatureC:
					item.ingredient.minTemperatureC == null
						? null
						: Number(item.ingredient.minTemperatureC),
				maxTemperatureC:
					item.ingredient.maxTemperatureC == null
						? null
						: Number(item.ingredient.maxTemperatureC),
				flocculation: item.ingredient.flocculation,
				bestFor: item.ingredient.bestFor,
				maxReuse: item.ingredient.maxReuse,
				inventory: item.ingredient.inventory,
				cultureDate: item.ingredient.cultureDate,
				addToSecondary: item.ingredient.addToSecondary,
				notes: item.notes ?? item.ingredient.notes,
				amountKg: item.amountKg == null ? null : Number(item.amountKg),
				amountL: item.amountL == null ? null : Number(item.amountL),
				amountIsWeight: item.amountIsWeight,
				cellsBillions: item.cellsBillions == null ? null : Number(item.cellsBillions),
				isStarterRequired: item.isStarterRequired
			})) ?? [],
		miscs:
			ingredients?.miscs?.map((item) => ({
				name: item.ingredient.name,
				type: item.ingredient.type,
				useFor: item.ingredient.useFor,
				description: item.ingredient.description,
				notes: item.notes ?? item.ingredient.notes,
				timeMin: item.timeMin ?? null,
				usePhase: item.usePhase,
				amountKg: item.amountKg == null ? null : Number(item.amountKg),
				amountL: item.amountL == null ? null : Number(item.amountL),
				amountIsWeight: item.amountIsWeight
			})) ?? []
	};
}

export function buildRecipeEngineSummary(
	recipe: RecipeSummary,
	equipment?: EquipmentRecord | null,
	ingredients?: Partial<RecipeIngredients>
): RecipeEngineSummary {
	return calculateRecipeSummary(buildRecipeDefinition(recipe, equipment, ingredients));
}
