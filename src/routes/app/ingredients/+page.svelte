<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';
	import { INGREDIENT_KIND_DESCRIPTIONS, INGREDIENT_KIND_LABELS, INGREDIENT_KIND_ORDER } from '$lib/ingredients/config';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type {
		FermentableRecord,
		HopRecord,
		IngredientKind,
		MiscRecord,
		YeastRecord
	} from '$lib/server/ingredients';

	let { data }: { data: PageData } = $props();

	const groupedIngredients = $derived(data.ingredients);

	function ingredientSummary(kind: IngredientKind, ingredient: (typeof data.ingredients)[IngredientKind][number]) {
		switch (kind) {
			case 'fermentables':
				return (
					(ingredient as FermentableRecord).supplier ||
					(ingredient as FermentableRecord).brand ||
					(ingredient as FermentableRecord).type ||
					'Details available'
				);
			case 'hops':
				return (
					(ingredient as HopRecord).supplier ||
					(ingredient as HopRecord).origin ||
					(ingredient as HopRecord).form ||
					(ingredient as HopRecord).type ||
					'Details available'
				);
			case 'yeasts':
				return (
					(ingredient as YeastRecord).supplier ||
					(ingredient as YeastRecord).lab ||
					(ingredient as YeastRecord).form ||
					(ingredient as YeastRecord).type ||
					'Details available'
				);
			case 'miscs':
				return (
					(ingredient as MiscRecord).supplier ||
					(ingredient as MiscRecord).type ||
					(ingredient as MiscRecord).useFor ||
					'Details available'
				);
		}
	}
</script>

<div class="space-y-6">
	<div class="rounded-3xl border bg-card/95 p-5 shadow-sm">
		<h1 class="text-3xl font-black tracking-tight">Ingredients</h1>
		<p class="mt-2 text-sm text-muted-foreground">
			Your ingredient library powers recipe suggestions, BeerXML imports, and reusable supplier details.
		</p>
	</div>

	<div class="grid gap-6 xl:grid-cols-2">
		{#each INGREDIENT_KIND_ORDER as kind}
			<Card class="border-border/70 bg-card/95 shadow-sm">
				<CardHeader>
					<CardTitle class="text-2xl font-bold">{INGREDIENT_KIND_LABELS[kind]}</CardTitle>
					<CardDescription>{INGREDIENT_KIND_DESCRIPTIONS[kind]}</CardDescription>
				</CardHeader>
				<CardContent class="space-y-3">
					{#if groupedIngredients[kind].length}
						{#each groupedIngredients[kind] as ingredient (ingredient.id)}
							<a
								href={resolve(`/app/ingredients/${kind}/${ingredient.id}`)}
								class="block rounded-2xl border p-4 transition hover:bg-accent/50"
							>
								<div class="flex items-center justify-between gap-3">
									<div>
										<p class="font-semibold">{ingredient.name}</p>
										<p class="text-sm text-muted-foreground">
											{ingredientSummary(kind, ingredient)}
										</p>
									</div>
									<span class="text-sm text-muted-foreground">Open</span>
								</div>
							</a>
						{/each}
					{:else}
						<div class="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
							No saved {INGREDIENT_KIND_LABELS[kind].toLowerCase()} yet. They will start to appear as you add them to recipes or import BeerXML.
						</div>
					{/if}
				</CardContent>
			</Card>
		{/each}
	</div>
</div>
