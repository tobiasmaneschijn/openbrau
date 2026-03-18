import * as m from '$lib/paraglide/messages';
import type { IngredientKind } from '$lib/server/ingredients';

export const INGREDIENT_KIND_ORDER = [
	'fermentables',
	'hops',
	'yeasts',
	'miscs'
] as const satisfies readonly IngredientKind[];

export const INGREDIENT_KIND_LABELS: Record<IngredientKind, string> = {
	fermentables: m.ingredient_kind_fermentables(),
	hops: m.ingredient_kind_hops(),
	yeasts: m.ingredient_kind_yeasts(),
	miscs: m.ingredient_kind_miscs()
};

export const INGREDIENT_KIND_DESCRIPTIONS: Record<IngredientKind, string> = {
	fermentables: m.ingredient_kind_fermentables_description(),
	hops: m.ingredient_kind_hops_description(),
	yeasts: m.ingredient_kind_yeasts_description(),
	miscs: m.ingredient_kind_miscs_description()
};
