import type { IbuFormula, RecipeDefinition, RecipeEquipmentProfile } from '$lib/recipes/domain';
import {
	estimateAbv,
	estimateFinalGravity,
	gravityPointsFromYieldPct,
	maltColorUnits,
	moreySrm,
	ragerIbu,
	specificGravityFromPoints,
	tinsethIbu
} from './brewing';

export type RecipeEngineWarning = {
	code:
		| 'generic-equipment-profile'
		| 'missing-fermentables'
		| 'missing-hops'
		| 'missing-yeast'
		| 'equipment-scaling-mismatch'
		| 'target-og-mismatch'
		| 'target-fg-mismatch'
		| 'target-ibu-mismatch'
		| 'target-srm-mismatch';
	message: string;
};

export type RecipeEngineSummary = {
	modules: string[];
	batch: {
		targetBatchSizeL: number;
		preBoilVolumeL: number;
		totalLiquorRequirementL: number;
		boilOffLossL: number;
		trubLossL: number;
		mashTunLossL: number;
	};
	process: {
		boilTimeMin: number;
		brewhouseEfficiencyPct: number;
		ibuFormula: IbuFormula;
		usesGenericEquipmentProfile: boolean;
	};
	totals: {
		fermentablesKg: number;
		hopsKg: number;
		yeastCount: number;
		miscCount: number;
	};
	computed: {
		og: number | null;
		fg: number | null;
		abvPct: number | null;
		ibu: number | null;
		srm: number | null;
	};
	targets: {
		og: number | null;
		fg: number | null;
		ibu: number | null;
		srm: number | null;
	};
	warnings: RecipeEngineWarning[];
};

function round(value: number, decimals: number) {
	return Number(value.toFixed(decimals));
}

function average(values: number[]) {
	if (!values.length) {
		return null;
	}

	return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalizedHopTime(timeMin: number, usePhase: string | undefined) {
	switch (usePhase) {
		case 'first_wort':
			return timeMin + 10;
		case 'whirlpool':
			return Math.max(timeMin * 0.5, 0);
		case 'dry_hop':
		case 'mash':
			return 0;
		default:
			return timeMin;
	}
}

function compareTarget(
	warnings: RecipeEngineWarning[],
	code: RecipeEngineWarning['code'],
	label: string,
	computed: number | null,
	target: number | null,
	threshold: number
) {
	if (computed == null || target == null) {
		return;
	}

	if (Math.abs(computed - target) > threshold) {
		warnings.push({
			code,
			message: `${label} is a little different from the current estimate (${target} vs ${round(computed, 3)}).`
		});
	}
}

function calculateBitterness(
	formula: IbuFormula,
	alphaAcidPct: number,
	amountKg: number,
	batchSizeL: number,
	timeMin: number,
	gravity: number
) {
	if (formula === 'rager') {
		return ragerIbu({
			alphaAcidPct,
			amountKg,
			batchSizeL,
			timeMin,
			gravity
		});
	}

	return tinsethIbu({
		alphaAcidPct,
		amountKg,
		batchSizeL,
		timeMin,
		gravity
	});
}

function equipmentProfile(recipe: RecipeDefinition): RecipeEquipmentProfile | null {
	return recipe.equipment ?? null;
}

export function calculateRecipeSummary(recipe: RecipeDefinition): RecipeEngineSummary {
	const equipment = equipmentProfile(recipe);
	const brewhouseEfficiencyPct = equipment?.efficiencyPct ?? 75;
	const boilOffLossL = equipment ? (recipe.process.boilTimeMin / 60) * equipment.boilOffRateLph : 0;
	const trubLossL = equipment?.trubLossL ?? 0;
	const mashTunLossL = equipment?.mashTunLossL ?? 0;
	const preBoilVolumeL = recipe.process.targetBatchSizeL + boilOffLossL + trubLossL;
	const totalLiquorRequirementL = preBoilVolumeL + mashTunLossL;

	const gravityPoints = recipe.fermentables.reduce((sum, fermentable) => {
		const efficiencyPct = fermentable.isExtract ? 100 : brewhouseEfficiencyPct;
		return (
			sum +
			gravityPointsFromYieldPct(
				fermentable.yieldPct,
				fermentable.amountKg,
				recipe.process.targetBatchSizeL,
				efficiencyPct
			)
		);
	}, 0);

	const computedOg =
		recipe.fermentables.length > 0
			? round(specificGravityFromPoints(gravityPoints), 3)
			: (recipe.targets.og ?? null);

	const totalMcu = recipe.fermentables.reduce(
		(sum, fermentable) =>
			sum +
			maltColorUnits(
				fermentable.colorLovibond,
				fermentable.amountKg,
				recipe.process.targetBatchSizeL
			),
		0
	);

	const computedSrm =
		recipe.fermentables.length > 0 && totalMcu > 0
			? round(moreySrm(totalMcu), 1)
			: (recipe.targets.srm ?? null);

	const attenuationPct = average(
		recipe.yeasts
			.map((yeast) => yeast.attenuationPct)
			.filter((attenuation): attenuation is number => attenuation != null)
	);

	const computedFg =
		computedOg != null
			? round(
					estimateFinalGravity(computedOg, attenuationPct) ?? recipe.targets.fg ?? computedOg,
					3
				)
			: (recipe.targets.fg ?? null);

	const computedAbv =
		computedOg != null && computedFg != null ? round(estimateAbv(computedOg, computedFg), 2) : null;

	const bitternessGravity = computedOg ?? recipe.targets.og ?? 1.05;
	const computedIbuRaw = recipe.hops.reduce((sum, hop) => {
		const timeMin = normalizedHopTime(hop.timeMin, hop.usePhase);

		if (timeMin <= 0) {
			return sum;
		}

		return (
			sum +
			calculateBitterness(
				recipe.process.ibuFormula,
				hop.alphaAcidPct,
				hop.amountKg,
				recipe.process.targetBatchSizeL,
				timeMin,
				bitternessGravity
			)
		);
	}, 0);

	const computedIbu =
		recipe.hops.length > 0 ? round(computedIbuRaw, 1) : (recipe.targets.ibu ?? null);

	const warnings: RecipeEngineWarning[] = [];

	if (equipment?.isGeneric) {
		warnings.push({
			code: 'generic-equipment-profile',
			message:
				'This recipe is using the default setup until you choose one of your equipment profiles.'
		});
	}

	if (recipe.fermentables.length === 0) {
		warnings.push({
			code: 'missing-fermentables',
			message: 'Add fermentables to estimate gravity and color from the ingredient list.'
		});
	}

	if (recipe.brewType === 'beer' && recipe.hops.length === 0) {
		warnings.push({
			code: 'missing-hops',
			message: 'Add hop additions to estimate bitterness from the recipe itself.'
		});
	}

	if (recipe.yeasts.length === 0) {
		warnings.push({
			code: 'missing-yeast',
			message: 'Add a yeast to estimate final gravity and ABV more accurately.'
		});
	}

	if (equipment && Math.abs(equipment.batchSizeL - recipe.process.targetBatchSizeL) > 0.5) {
		warnings.push({
			code: 'equipment-scaling-mismatch',
			message: `Your target batch size (${recipe.process.targetBatchSizeL} L) does not match this setup's usual size (${equipment.batchSizeL} L).`
		});
	}

	compareTarget(
		warnings,
		'target-og-mismatch',
		'Original gravity',
		computedOg,
		recipe.targets.og ?? null,
		0.002
	);
	compareTarget(
		warnings,
		'target-fg-mismatch',
		'Final gravity',
		computedFg,
		recipe.targets.fg ?? null,
		0.002
	);
	compareTarget(
		warnings,
		'target-ibu-mismatch',
		'Bitterness',
		computedIbu,
		recipe.targets.ibu ?? null,
		5
	);
	compareTarget(
		warnings,
		'target-srm-mismatch',
		'Color',
		computedSrm,
		recipe.targets.srm ?? null,
		2
	);

	return {
		modules: recipe.enabledModules,
		batch: {
			targetBatchSizeL: round(recipe.process.targetBatchSizeL, 3),
			preBoilVolumeL: round(preBoilVolumeL, 3),
			totalLiquorRequirementL: round(totalLiquorRequirementL, 3),
			boilOffLossL: round(boilOffLossL, 3),
			trubLossL: round(trubLossL, 3),
			mashTunLossL: round(mashTunLossL, 3)
		},
		process: {
			boilTimeMin: recipe.process.boilTimeMin,
			brewhouseEfficiencyPct: round(brewhouseEfficiencyPct, 2),
			ibuFormula: recipe.process.ibuFormula,
			usesGenericEquipmentProfile: equipment?.isGeneric ?? false
		},
		totals: {
			fermentablesKg: round(
				recipe.fermentables.reduce((sum, fermentable) => sum + fermentable.amountKg, 0),
				3
			),
			hopsKg: round(
				recipe.hops.reduce((sum, hop) => sum + hop.amountKg, 0),
				3
			),
			yeastCount: recipe.yeasts.length,
			miscCount: recipe.miscs.length
		},
		computed: {
			og: computedOg,
			fg: computedFg,
			abvPct: computedAbv,
			ibu: computedIbu,
			srm: computedSrm
		},
		targets: {
			og: recipe.targets.og ?? null,
			fg: recipe.targets.fg ?? null,
			ibu: recipe.targets.ibu ?? null,
			srm: recipe.targets.srm ?? null
		},
		warnings
	};
}
