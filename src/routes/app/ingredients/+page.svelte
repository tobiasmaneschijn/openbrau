<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import type { PageData } from './$types';
	import PageHeaderConfig from '$lib/components/app/page-header-config.svelte';
	import { DataTable, type DataTableFilterControl } from '$lib/components/data-table';
	import { INGREDIENT_KIND_LABELS, INGREDIENT_KIND_ORDER } from '$lib/ingredients/config';
	import { Button } from '$lib/components/ui/button';
	import type {
		FermentableRecord,
		HopRecord,
		IngredientKind,
		MiscRecord,
		YeastRecord
	} from '$lib/server/ingredients';

	let { data }: { data: PageData } = $props();
	const actionItemClass = 'w-full justify-start px-2 py-1.5 text-sm shadow-none';

	function ingredientSummary(
		kind: IngredientKind,
		ingredient: (typeof data.ingredients)[IngredientKind][number]
	) {
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

	type IngredientTableRow = {
		id: string;
		name: string;
		kind: string;
		summary: string;
		openHref: string;
	};

	const ingredientColumns: ColumnDef<IngredientTableRow>[] = [
		{
			accessorKey: 'name',
			header: 'Ingredient'
		},
		{
			accessorKey: 'kind',
			header: 'Type',
			enableColumnFilter: true
		},
		{
			accessorKey: 'summary',
			header: 'Summary',
			enableSorting: false
		}
	];

	const ingredientFilters: DataTableFilterControl[] = [
		{
			columnId: 'kind',
			label: 'Type',
			type: 'select',
			options: INGREDIENT_KIND_ORDER.map((kind) => ({
				label: INGREDIENT_KIND_LABELS[kind],
				value: INGREDIENT_KIND_LABELS[kind]
			}))
		}
	];

	const ingredientRows = $derived.by(() =>
		INGREDIENT_KIND_ORDER.flatMap((kind) =>
			data.ingredients[kind].map((ingredient) => ({
				id: ingredient.id,
				name: ingredient.name,
				kind: INGREDIENT_KIND_LABELS[kind],
				summary: ingredientSummary(kind, ingredient),
				openHref: `/app/ingredients/${kind}/${ingredient.id}`
			}))
		)
	);
</script>

<div class="space-y-6">
	<PageHeaderConfig
		eyebrow="Library"
		title="Ingredients"
		description="Your ingredient library powers recipe suggestions, BeerXML imports, and reusable supplier details."
		meta={`${ingredientRows.length} saved ingredients`}
	/>

	<DataTable
		data={ingredientRows}
		columns={ingredientColumns}
		filterControls={ingredientFilters}
		searchColumnIds={['name', 'kind', 'summary']}
		searchPlaceholder="Search ingredients by name, type, or supplier details"
		emptyTitle="No saved ingredients yet"
		emptyDescription="They will start to appear as you add ingredients to recipes or import BeerXML."
	>
		{#snippet rowActions(ingredient)}
			<Button href={ingredient.openHref} variant="ghost" size="sm" class={actionItemClass}
				>Open</Button
			>
		{/snippet}
	</DataTable>
</div>
