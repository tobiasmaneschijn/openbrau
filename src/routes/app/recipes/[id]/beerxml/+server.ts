import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serializeBeerXmlRecipe, toBeerXmlRecord } from '$lib/recipes/beerxml';
import { buildRecipeDefinition } from '$lib/recipes/engine';

import { listRecipeIngredientsForAuthor } from '$lib/server/recipe-items';
import { getRecipeForAuthor } from '$lib/server/recipes';
import * as m from '$lib/paraglide/messages';

function slugify(value: string) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 60);
}

export const GET: RequestHandler = async ({ params, locals }) => {
	const recipe = await getRecipeForAuthor(params.id, locals.user!.id);
	if (!recipe) {
		throw error(404, m.recipe_not_found());
	}

	const ingredients = await listRecipeIngredientsForAuthor(recipe.id, locals.user!.id);

	const definition = buildRecipeDefinition(recipe, ingredients);
	const beerXml = serializeBeerXmlRecipe(toBeerXmlRecord(definition));
	const filename = `${slugify(recipe.name) || 'recipe'}.xml`;

	return new Response(beerXml, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'content-disposition': `attachment; filename="${filename}"`
		}
	});
};
