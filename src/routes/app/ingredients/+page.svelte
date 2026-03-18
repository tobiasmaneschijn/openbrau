<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import type { PageData } from './$types';
	import PageHeaderConfig from '$lib/components/app/page-header-config.svelte';
	import { DataTable, type DataTableFilterControl } from '$lib/components/data-table';
	import { INGREDIENT_KIND_LABELS, INGREDIENT_KIND_ORDER } from '$lib/ingredients/config';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';
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
					m.details_available()
				);
			case 'hops':
				return (
					(ingredient as HopRecord).supplier ||
					(ingredient as HopRecord).origin ||
					(ingredient as HopRecord).form ||
					(ingredient as HopRecord).type ||
					m.details_available()
				);
			case 'yeasts':
				return (
					(ingredient as YeastRecord).supplier ||
					(ingredient as YeastRecord).lab ||
					(ingredient as YeastRecord).form ||
					(ingredient as YeastRecord).type ||
					m.details_available()
				);
			case 'miscs':
				return (
					(ingredient as MiscRecord).supplier ||
					(ingredient as MiscRecord).type ||
					(ingredient as MiscRecord).useFor ||
					m.details_available()
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
			header: m.ingredient()
		},
		{
			accessorKey: 'kind',
			header: m.type(),
			enableColumnFilter: true
		},
		{
			accessorKey: 'summary',
			header: m.summary(),
			enableSorting: false
		}
	];

	const ingredientFilters: DataTableFilterControl[] = [
		{
			columnId: 'kind',
			label: m.type(),
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
		eyebrow={m.library()}
		title={m.ingredients()}
		description={m.ingredient_kind_fermentables_description()}
		meta={m.saved_ingredients({ count: ingredientRows.length })}
	/>

	<DataTable
		data={ingredientRows}
		columns={ingredientColumns}
		filterControls={ingredientFilters}
		searchColumnIds={['name', 'kind', 'summary']}
		searchPlaceholder={m.search_ingredients()}
		emptyTitle={m.no_saved_ingredients_yet()}
		emptyDescription={m.ingredients_empty_state()}
	>
		{#snippet rowActions(ingredient)}
			<Button href={ingredient.openHref} variant="ghost" size="sm" class={actionItemClass}
				>{m.open()}</Button
			>
		{/snippet}
	</DataTable>
</div>
