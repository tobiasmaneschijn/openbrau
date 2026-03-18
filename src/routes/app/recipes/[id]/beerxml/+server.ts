import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serializeBeerXmlRecipe, toBeerXmlRecord } from '$lib/recipes/beerxml';
import { buildRecipeDefinition } from '$lib/recipes/engine';
import { getEquipmentForOwner } from '$lib/server/equipment';
import { listRecipeIngredientsForAuthor } from '$lib/server/recipe-items';
import { getRecipeForAuthor } from '$lib/server/recipes';

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
		throw error(404, 'Recipe not found.');
	}

	const [equipment, ingredients] = await Promise.all([
		recipe.equipmentId ? getEquipmentForOwner(recipe.equipmentId, locals.user!.id) : null,
		listRecipeIngredientsForAuthor(recipe.id, locals.user!.id)
	]);

	const definition = buildRecipeDefinition(recipe, equipment, ingredients);
	const beerXml = serializeBeerXmlRecipe(toBeerXmlRecord(definition));
	const filename = `${slugify(recipe.name) || 'recipe'}.xml`;

	return new Response(beerXml, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'content-disposition': `attachment; filename="${filename}"`
		}
	});
};
