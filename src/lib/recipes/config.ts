import * as m from '$lib/paraglide/messages';
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
		label: m.brew_type_standard(),
		styleLabel: m.brew_type_style(),
		processTimeLabel: m.brew_type_boil_time(),
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
		label: m.brew_type_wine(),
		styleLabel: m.brew_type_varietal(),
		processTimeLabel: m.brew_type_heat_time(),
		visibleFields: ['style', 'notes', 'equipmentId', 'targetOg', 'targetFg']
	},
	mead: {
		label: m.brew_type_mead(),
		styleLabel: m.brew_type_style(),
		processTimeLabel: m.brew_type_heat_time(),
		visibleFields: ['style', 'notes', 'boilTimeMin', 'equipmentId', 'targetOg', 'targetFg']
	}
};

export const RECIPE_FIELD_LABELS: Record<RecipeFieldKey, string> = {
	style: m.style(),
	notes: m.notes(),
	boilTimeMin: m.brew_type_boil_time(),
	equipmentId: m.equipment(),
	targetOg: m.original_gravity(),
	targetFg: m.final_gravity(),
	targetIbu: m.ibu(),
	targetSrm: m.target_srm_label()
};

export function getHiddenFieldsForBrewType(brewType: BrewType) {
	const visibleFields = new Set(BREW_TYPE_CONFIG[brewType].visibleFields);
	return RECIPE_FIELD_KEYS.filter((field) => !visibleFields.has(field));
}

export { IBU_FORMULAS, RECIPE_MODULE_KEYS };

export const IBU_FORMULA_LABELS: Record<IbuFormula, string> = {
	tinseth: m.balanced_bitterness(),
	rager: m.classic_bitterness()
};

export const RECIPE_MODULE_LABELS: Record<RecipeModuleKey, string> = {
	core: m.recipe_basics(),
	water_chemistry: m.water_profile(),
	mash_steps: m.mash_schedule(),
	yeast_starter: m.starter_planning()
};

export const RECIPE_MODULE_DESCRIPTIONS: Record<RecipeModuleKey, string> = {
	core: m.recipe_core_description(),
	water_chemistry: m.water_chemistry_description(),
	mash_steps: m.mash_steps_description(),
	yeast_starter: m.yeast_starter_description()
};
