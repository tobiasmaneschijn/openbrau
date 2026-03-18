import type { IngredientKind } from '$lib/server/ingredients';

export const INGREDIENT_KIND_ORDER = ['fermentables', 'hops', 'yeasts', 'miscs'] as const satisfies readonly IngredientKind[];

export const INGREDIENT_KIND_LABELS: Record<IngredientKind, string> = {
	fermentables: 'Fermentables',
	hops: 'Hops',
	yeasts: 'Yeasts',
	miscs: 'Other additions'
};

export const INGREDIENT_KIND_DESCRIPTIONS: Record<IngredientKind, string> = {
	fermentables: 'Malts, sugars, extracts, and other gravity contributors.',
	hops: 'Bittering, flavor, and aroma additions.',
	yeasts: 'Liquid, dry, or culture-based fermentation strains.',
	miscs: 'Nutrients, finings, spices, and other non-core additions.'
};
