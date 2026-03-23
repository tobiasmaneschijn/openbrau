import type { IbuFormula, RecipeDefinition } from '$lib/recipes/domain';
import * as m from '$lib/paraglide/messages';
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
		| 'missing-fermentables'
		| 'missing-hops'
		| 'missing-yeast'
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
			message: m.target_is_a_little_different_from_the_current_estimate({
				label,
				target: String(target),
				computed: String(round(computed, 3))
			})
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

export function calculateRecipeSummary(recipe: RecipeDefinition): RecipeEngineSummary {
	const brewhouseEfficiencyPct = 72;
	const boilOffLossL = (recipe.process.boilTimeMin / 60) * 2.5;
	const trubLossL = 0.75;
	const mashTunLossL = 0.75;
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

	if (recipe.fermentables.length === 0) {
		warnings.push({
			code: 'missing-fermentables',
			message: m.add_fermentables_to_estimate_gravity_and_color_from_the_ingredient_list()
		});
	}

	if (recipe.brewType === 'beer' && recipe.hops.length === 0) {
		warnings.push({
			code: 'missing-hops',
			message: m.add_hop_additions_to_estimate_bitterness_from_the_recipe_itself()
		});
	}

	if (recipe.yeasts.length === 0) {
		warnings.push({
			code: 'missing-yeast',
			message: m.add_a_yeast_to_estimate_final_gravity_and_abv_more_accurately()
		});
	}

	compareTarget(
		warnings,
		'target-og-mismatch',
		m.original_gravity(),
		computedOg,
		recipe.targets.og ?? null,
		0.002
	);
	compareTarget(
		warnings,
		'target-fg-mismatch',
		m.final_gravity(),
		computedFg,
		recipe.targets.fg ?? null,
		0.002
	);
	compareTarget(
		warnings,
		'target-ibu-mismatch',
		m.ibu(),
		computedIbu,
		recipe.targets.ibu ?? null,
		5
	);
	compareTarget(
		warnings,
		'target-srm-mismatch',
		m.color_label(),
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
			ibuFormula: recipe.process.ibuFormula
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
