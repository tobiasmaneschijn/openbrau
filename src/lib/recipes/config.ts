import type { BrewType } from '$lib/server/recipes';
import { IBU_FORMULAS, RECIPE_MODULE_KEYS, type IbuFormula, type RecipeModuleKey } from './domain';

export const BREW_TYPES = ['beer', 'wine', 'mead'] as const satisfies readonly BrewType[];

export const RECIPE_FIELD_KEYS = [
	'style',
	'notes',
	'boilTimeMin',
	'equipmentId',
	'targetOg',
	'targetFg',
	'targetIbu',
	'targetSrm'
] as const;

export type RecipeFieldKey = (typeof RECIPE_FIELD_KEYS)[number];

type BrewTypeConfig = {
	label: string;
	styleLabel: string;
	processTimeLabel: string;
	visibleFields: RecipeFieldKey[];
};

export const BREW_TYPE_CONFIG: Record<BrewType, BrewTypeConfig> = {
	beer: {
		label: 'Beer',
		styleLabel: 'Style',
		processTimeLabel: 'Boil time (min)',
		visibleFields: [
			'style',
			'notes',
			'boilTimeMin',
			'equipmentId',
			'targetOg',
			'targetFg',
			'targetIbu',
			'targetSrm'
		]
	},
	wine: {
		label: 'Wine',
		styleLabel: 'Varietal',
		processTimeLabel: 'Heat time (min)',
		visibleFields: ['style', 'notes', 'equipmentId', 'targetOg', 'targetFg']
	},
	mead: {
		label: 'Mead',
		styleLabel: 'Mead style',
		processTimeLabel: 'Heat time (min)',
		visibleFields: ['style', 'notes', 'boilTimeMin', 'equipmentId', 'targetOg', 'targetFg']
	}
};

export const RECIPE_FIELD_LABELS: Record<RecipeFieldKey, string> = {
	style: 'Style',
	notes: "Brewer's notes",
	boilTimeMin: 'Boil length',
	equipmentId: 'Brewing setup',
	targetOg: 'Original gravity target',
	targetFg: 'Final gravity target',
	targetIbu: 'Bitterness target',
	targetSrm: 'Color target'
};

export function getHiddenFieldsForBrewType(brewType: BrewType) {
	const visibleFields = new Set(BREW_TYPE_CONFIG[brewType].visibleFields);
	return RECIPE_FIELD_KEYS.filter((field) => !visibleFields.has(field));
}

export { IBU_FORMULAS, RECIPE_MODULE_KEYS };

export const IBU_FORMULA_LABELS: Record<IbuFormula, string> = {
	tinseth: 'Balanced bitterness',
	rager: 'Classic bitterness'
};

export const RECIPE_MODULE_LABELS: Record<RecipeModuleKey, string> = {
	core: 'Recipe basics',
	water_chemistry: 'Water profile',
	mash_steps: 'Mash schedule',
	yeast_starter: 'Starter planning'
};

export const RECIPE_MODULE_DESCRIPTIONS: Record<RecipeModuleKey, string> = {
	core: 'The core targets and ingredients for this recipe.',
	water_chemistry: 'Plan minerals, salts, and source water adjustments.',
	mash_steps: 'Add mash temperatures and step timing.',
	yeast_starter: 'Estimate starter size and pitching support.'
};
