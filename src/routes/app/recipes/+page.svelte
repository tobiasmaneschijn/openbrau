<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';
	import type { ColumnDef } from '@tanstack/table-core';
	import type { AppPageHeaderAction } from '$lib/components/app/page-header';
	import { BREW_TYPE_CONFIG } from '$lib/recipes/config';
	import PageHeaderConfig from '$lib/components/app/page-header-config.svelte';
	import { DataTable, type DataTableFilterControl } from '$lib/components/data-table';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import {
		Sheet,
		SheetContent,
		SheetDescription,
		SheetHeader,
		SheetTitle
	} from '$lib/components/ui/sheet';
	import * as m from '$lib/paraglide/messages';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const actionItemClass = 'w-full justify-start px-2 py-1.5 text-sm shadow-none';
	let importSheetOpen = $state(false);
	let importBeerXmlForm = $state<HTMLFormElement | null>(null);
	const recipeHeaderActions = $derived([
		{
			label: m.import_beerxml(),
			type: 'button',
			variant: 'outline',
			onClick: () => (importSheetOpen = true)
		},
		{ label: m.add_new(), href: resolve('/app/recipes/new'), variant: 'default' }
	] satisfies AppPageHeaderAction[]);

	type RecipeTableRow = {
		id: string;
		name: string;
		brewType: string;
		style: string;
		complexity: string;
		targetBatchSizeLValue: number;
		targetBatchSizeLabel: string;
		targetOg: string;
		targetFg: string;
		targetIbuValue: number;
		targetIbuLabel: string;
		notes: string;
		batchHref: string;
		exportHref: string;
		openHref: string;
	};

	const recipeColumns: ColumnDef<RecipeTableRow>[] = [
		{
			accessorKey: 'name',
			header: m.recipe()
		},
		{
			accessorKey: 'brewType',
			header: m.brew_type(),
			enableColumnFilter: true
		},
		{
			accessorKey: 'style',
			header: m.style()
		},
		{
			id: 'targetBatchSize',
			header: m.target_volume(),
			accessorFn: (row) => row.targetBatchSizeLValue,
			cell: ({ row }) => row.original.targetBatchSizeLabel
		},
		{
			accessorKey: 'targetOg',
			header: m.original_gravity()
		},
		{
			accessorKey: 'targetFg',
			header: m.final_gravity()
		},
		{
			id: 'targetIbu',
			header: m.ibu(),
			accessorFn: (row) => row.targetIbuValue,
			cell: ({ row }) => row.original.targetIbuLabel
		},
		{
			accessorKey: 'complexity',
			header: m.mode(),
			enableColumnFilter: true
		},
		{
			accessorKey: 'notes',
			header: m.notes(),
			enableSorting: false
		}
	];

	const recipeFilters: DataTableFilterControl[] = [
		{
			columnId: 'brewType',
			label: m.brew_type(),
			type: 'select',
			options: Object.values(BREW_TYPE_CONFIG).map((config) => ({
				label: config.label,
				value: config.label
			}))
		},
		{
			columnId: 'complexity',
			label: m.mode(),
			type: 'select',
			options: [
				{ label: m.standard(), value: m.standard() },
				{ label: m.advanced(), value: m.advanced() }
			]
		}
	];

	const recipeRows = $derived(
		data.recipes.map((recipe) => ({
			id: recipe.id,
			name: recipe.name,
			brewType: BREW_TYPE_CONFIG[recipe.brewType].label,
			style: recipe.style || m.unknown(),
			complexity: recipe.advancedMode ? m.advanced() : m.standard(),
			targetBatchSizeLValue: Number(recipe.targetBatchSizeL),
			targetBatchSizeLabel: `${recipe.targetBatchSizeL} L`,
			targetOg: recipe.targetOg || '-',
			targetFg: recipe.targetFg || '-',
			targetIbuValue: Number(recipe.targetIbu || 0),
			targetIbuLabel: recipe.targetIbu ? `${recipe.targetIbu}` : '-',
			notes: recipe.notes || '-',
			batchHref: `/app/batches/new?recipeId=${recipe.id}`,
			exportHref: `/app/recipes/${recipe.id}/beerxml`,
			openHref: `/app/recipes/${recipe.id}`
		}))
	);
</script>

<div class="space-y-6">
	<PageHeaderConfig
		eyebrow={m.library()}
		title={m.recipes()}
		description={m.recipes_process_planning()}
		meta={m.saved_recipes({ count: data.recipes.length })}
		actions={recipeHeaderActions}
	/>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>{m.could_not_update_recipes()}</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<Sheet bind:open={importSheetOpen}>
		<SheetContent side="right" class="w-full gap-8 overflow-y-auto p-6 sm:max-w-2xl sm:p-8">
			<SheetHeader>
				<SheetTitle>{m.import_beerxml()}</SheetTitle>
				<SheetDescription>{m.paste_beerxml_description()}</SheetDescription>
			</SheetHeader>

			<form
				bind:this={importBeerXmlForm}
				method="POST"
				action="?/importBeerXml"
				enctype="multipart/form-data"
				class="mt-2 flex flex-col gap-6"
			>
				<div class="space-y-3">
					<label for="beerXml" class="text-sm font-medium">{m.paste_beerxml()}</label>
					<textarea
						id="beerXml"
						name="beerXml"
						rows="12"
						class="flex min-h-56 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-xs ring-offset-background transition-[color,box-shadow] outline-none focus-visible:ring-1 focus-visible:ring-ring"
						placeholder={m.paste_beerxml_description()}
					></textarea>
					<div class="flex justify-end">
						<Button type="submit">{m.import_pasted_recipe()}</Button>
					</div>
				</div>
				<div class="space-y-4 rounded-2xl border bg-muted/30 p-5">
					<div class="space-y-3">
						<label for="beerXmlFile" class="text-sm font-medium">{m.or_choose_an_xml_file()}</label>
						<input
							id="beerXmlFile"
							name="beerXmlFile"
							type="file"
							accept=".xml,text/xml,application/xml"
							class="block w-full text-sm"
							onchange={(event) => {
								const input = event.currentTarget;
								if (input instanceof HTMLInputElement && input.files && input.files.length > 0) {
									importBeerXmlForm?.requestSubmit();
								}
							}}
						/>
					</div>
					<p class="text-sm text-muted-foreground">{m.imported_recipes_keep_details()}</p>
				</div>
			</form>
		</SheetContent>
	</Sheet>

	<DataTable
		data={recipeRows}
		columns={recipeColumns}
		filterControls={recipeFilters}
		searchColumnIds={['name', 'brewType', 'style', 'notes']}
		searchPlaceholder={m.search_recipes()}
		emptyTitle={m.no_recipes_yet()}
		emptyDescription={m.create_first_recipe()}
	>
		{#snippet rowActions(recipe)}
			<Button href={recipe.openHref} variant="ghost" size="sm" class={actionItemClass}>{m.open()}</Button>
			<Button href={recipe.batchHref} variant="ghost" size="sm" class={actionItemClass}>{m.start_batch()}</Button>
			<Button href={recipe.exportHref} variant="ghost" size="sm" class={actionItemClass}>{m.export_xml()}</Button>
			<form method="POST" action="?/delete">
				<input type="hidden" name="id" value={recipe.id} />
				<Button type="submit" variant="ghost" size="sm" class={actionItemClass}>{m.delete()}</Button>
			</form>
		{/snippet}
	</DataTable>
</div>
