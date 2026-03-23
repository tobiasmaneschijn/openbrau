import type {
	IbuFormula,
	RecipeBrewType,
	RecipeDefinition,
	RecipeModuleKey
} from '$lib/recipes/domain';
import type { RecipeIngredients } from '$lib/server/recipe-items';

type RecipeSnapshotSource = {
	name: string;
	brewType: RecipeBrewType;
	style: string | null;
	notes: string | null;
	advancedMode: boolean;
	enabledModules: string[];
	targetBatchSizeL: string | number;
	boilTimeMin: number;
	ibuFormula: IbuFormula;
	targetOg: string | number | null;
	targetFg: string | number | null;
	targetIbu: string | number | null;
	targetSrm: string | number | null;
};

export type BatchRecipeSnapshot = {
	name: string;
	brewType: RecipeBrewType;
	style: string | null;
	notes: string | null;
	advancedMode: boolean;
	enabledModules: RecipeModuleKey[];
	process: {
		targetBatchSizeL: number;
		boilTimeMin: number;
		ibuFormula: IbuFormula;
	};
	targets: {
		og: number | null;
		fg: number | null;
		ibu: number | null;
		srm: number | null;
	};
	fermentables: RecipeDefinition['fermentables'];
	hops: RecipeDefinition['hops'];
	yeasts: RecipeDefinition['yeasts'];
	miscs: RecipeDefinition['miscs'];
};

function numericValue(value: string | number | null | undefined) {
	if (value == null || value === '') {
		return null;
	}

	return typeof value === 'number' ? value : Number(value);
}

export function buildBatchSnapshotFromRecipe(
	recipe: RecipeSnapshotSource,
	ingredients: RecipeIngredients
): BatchRecipeSnapshot {
	return {
		name: recipe.name,
		brewType: recipe.brewType,
		style: recipe.style,
		notes: recipe.notes,
		advancedMode: recipe.advancedMode,
		enabledModules: recipe.enabledModules as RecipeModuleKey[],
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
		fermentables: ingredients.fermentables.map((item) => ({
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
			moisturePct: item.ingredient.moisturePct == null ? null : Number(item.ingredient.moisturePct),
			diastaticPowerLintner:
				item.ingredient.diastaticPowerLintner == null
					? null
					: Number(item.ingredient.diastaticPowerLintner),
			proteinPct: item.ingredient.proteinPct == null ? null : Number(item.ingredient.proteinPct),
			maxInBatchPct:
				item.ingredient.maxInBatchPct == null ? null : Number(item.ingredient.maxInBatchPct),
			recommendMash: item.ingredient.recommendMash,
			addAfterBoil: item.usePhase !== 'mash',
			isExtract: item.ingredient.isExtract
		})),
		hops: ingredients.hops.map((item) => ({
			name: item.ingredient.name,
			amountKg: Number(item.amountKg),
			alphaAcidPct: Number(item.ingredient.alphaAcidPct),
			timeMin: item.timeMin ?? 0,
			betaAcidPct: item.ingredient.betaAcidPct == null ? null : Number(item.ingredient.betaAcidPct),
			form: item.ingredient.form,
			type: item.ingredient.type,
			origin: item.ingredient.origin,
			supplier: item.ingredient.supplier,
			hsiPct: item.ingredient.hsiPct == null ? null : Number(item.ingredient.hsiPct),
			substitutes: item.ingredient.substitutes,
			cohumulonePct:
				item.ingredient.cohumulonePct == null ? null : Number(item.ingredient.cohumulonePct),
			myrcenePct: item.ingredient.myrcenePct == null ? null : Number(item.ingredient.myrcenePct),
			notes: item.notes ?? item.ingredient.notes,
			usePhase: item.usePhase
		})),
		yeasts: ingredients.yeasts.map((item) => ({
			name: item.ingredient.name,
			lab: item.ingredient.lab,
			productCode: item.ingredient.productCode,
			type: item.ingredient.type,
			form: item.ingredient.form,
			attenuationPct:
				item.ingredient.attenuationPct == null ? null : Number(item.ingredient.attenuationPct),
			minTemperatureC:
				item.ingredient.minTemperatureC == null ? null : Number(item.ingredient.minTemperatureC),
			maxTemperatureC:
				item.ingredient.maxTemperatureC == null ? null : Number(item.ingredient.maxTemperatureC),
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
		})),
		miscs: ingredients.miscs.map((item) => ({
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
		}))
	};
}

export function snapshotToRecipeDefinition(snapshot: BatchRecipeSnapshot): RecipeDefinition {
	return {
		name: snapshot.name,
		brewType: snapshot.brewType,
		notes: snapshot.notes,
		advancedMode: snapshot.advancedMode,
		enabledModules: snapshot.enabledModules,
		process: snapshot.process,
		targets: snapshot.targets,
		fermentables: snapshot.fermentables,
		hops: snapshot.hops,
		yeasts: snapshot.yeasts,
		miscs: snapshot.miscs
	};
}

export function isBatchRecipeSnapshot(value: unknown): value is BatchRecipeSnapshot {
	if (!value || typeof value !== 'object') {
		return false;
	}

	const record = value as Record<string, unknown>;
	return (
		typeof record.name === 'string' &&
		typeof record.process === 'object' &&
		record.process !== null &&
		Array.isArray(record.fermentables) &&
		Array.isArray(record.hops) &&
		Array.isArray(record.yeasts) &&
		Array.isArray(record.miscs)
	);
}
