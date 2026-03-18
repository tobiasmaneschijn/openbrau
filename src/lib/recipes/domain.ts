export const RECIPE_MODULE_KEYS = [
	'core',
	'water_chemistry',
	'mash_steps',
	'yeast_starter'
] as const;

export type RecipeModuleKey = (typeof RECIPE_MODULE_KEYS)[number];

export const IBU_FORMULAS = ['tinseth', 'rager'] as const;

export type IbuFormula = (typeof IBU_FORMULAS)[number];

export type RecipeBrewType = 'beer' | 'wine' | 'mead';

export type RecipeFermentableDefinition = {
	name: string;
	amountKg: number;
	yieldPct: number;
	colorLovibond: number;
	type?: string | null;
	origin?: string | null;
	supplier?: string | null;
	notes?: string | null;
	coarseFineDiffPct?: number | null;
	moisturePct?: number | null;
	diastaticPowerLintner?: number | null;
	proteinPct?: number | null;
	maxInBatchPct?: number | null;
	recommendMash?: boolean;
	addAfterBoil?: boolean;
	isExtract?: boolean;
};

export type RecipeHopDefinition = {
	name: string;
	amountKg: number;
	alphaAcidPct: number;
	timeMin: number;
	betaAcidPct?: number | null;
	form?: string | null;
	type?: string | null;
	origin?: string | null;
	supplier?: string | null;
	hsiPct?: number | null;
	substitutes?: string | null;
	cohumulonePct?: number | null;
	myrcenePct?: number | null;
	notes?: string | null;
	usePhase?: 'mash' | 'first_wort' | 'boil' | 'whirlpool' | 'dry_hop';
};

export type RecipeYeastDefinition = {
	name: string;
	lab?: string | null;
	productCode?: string | null;
	type?: string | null;
	form?: string | null;
	attenuationPct?: number | null;
	minTemperatureC?: number | null;
	maxTemperatureC?: number | null;
	flocculation?: string | null;
	bestFor?: string | null;
	maxReuse?: number | null;
	inventory?: string | null;
	cultureDate?: Date | null;
	addToSecondary?: boolean;
	notes?: string | null;
	amountKg?: number | null;
	amountL?: number | null;
	amountIsWeight?: boolean;
	cellsBillions?: number | null;
	isStarterRequired?: boolean;
};

export type RecipeMiscDefinition = {
	name: string;
	type?: string | null;
	useFor?: string | null;
	description?: string | null;
	notes?: string | null;
	timeMin?: number | null;
	usePhase?: 'mash' | 'boil' | 'whirlpool' | 'fermentation' | 'packaging';
	amountKg?: number | null;
	amountL?: number | null;
	amountIsWeight?: boolean;
};

export type RecipeEquipmentProfile = {
	name: string;
	efficiencyPct: number;
	batchSizeL: number;
	boilOffRateLph: number;
	mashTunLossL: number;
	trubLossL: number;
	isGeneric?: boolean;
};

export type RecipeTargets = {
	og?: number | null;
	fg?: number | null;
	ibu?: number | null;
	srm?: number | null;
};

export type RecipeProcessSettings = {
	targetBatchSizeL: number;
	boilTimeMin: number;
	ibuFormula: IbuFormula;
};

export type RecipeDefinition = {
	name: string;
	brewType: RecipeBrewType;
	notes?: string | null;
	advancedMode: boolean;
	enabledModules: RecipeModuleKey[];
	process: RecipeProcessSettings;
	targets: RecipeTargets;
	equipment?: RecipeEquipmentProfile | null;
	fermentables: RecipeFermentableDefinition[];
	hops: RecipeHopDefinition[];
	yeasts: RecipeYeastDefinition[];
	miscs: RecipeMiscDefinition[];
};

export const GENERIC_EQUIPMENT_PROFILE: RecipeEquipmentProfile = {
	name: 'Generic Bucket Profile',
	efficiencyPct: 72,
	batchSizeL: 20,
	boilOffRateLph: 2.5,
	mashTunLossL: 0.75,
	trubLossL: 0.75,
	isGeneric: true
};
