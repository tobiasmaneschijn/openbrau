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

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const actionItemClass = 'w-full justify-start px-2 py-1.5 text-sm shadow-none';
	let importSheetOpen = $state(false);
	let importBeerXmlForm = $state<HTMLFormElement | null>(null);
	const recipeHeaderActions = $derived([
		{
			label: 'Import BeerXML',
			type: 'button',
			variant: 'outline',
			onClick: () => (importSheetOpen = true)
		},
		{ label: 'Add new', href: resolve('/app/recipes/new'), variant: 'default' }
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
			header: 'Recipe'
		},
		{
			accessorKey: 'brewType',
			header: 'Brew type',
			enableColumnFilter: true
		},
		{
			accessorKey: 'style',
			header: 'Style'
		},
		{
			id: 'targetBatchSize',
			header: 'Target volume',
			accessorFn: (row) => row.targetBatchSizeLValue,
			cell: ({ row }) => row.original.targetBatchSizeLabel
		},
		{
			accessorKey: 'targetOg',
			header: 'OG'
		},
		{
			accessorKey: 'targetFg',
			header: 'FG'
		},
		{
			id: 'targetIbu',
			header: 'IBU',
			accessorFn: (row) => row.targetIbuValue,
			cell: ({ row }) => row.original.targetIbuLabel
		},
		{
			accessorKey: 'complexity',
			header: 'Mode',
			enableColumnFilter: true
		},
		{
			accessorKey: 'notes',
			header: 'Notes',
			enableSorting: false
		}
	];

	const recipeFilters: DataTableFilterControl[] = [
		{
			columnId: 'brewType',
			label: 'Brew type',
			type: 'select',
			options: Object.values(BREW_TYPE_CONFIG).map((config) => ({
				label: config.label,
				value: config.label
			}))
		},
		{
			columnId: 'complexity',
			label: 'Mode',
			type: 'select',
			options: [
				{ label: 'Standard', value: 'Standard' },
				{ label: 'Advanced', value: 'Advanced' }
			]
		}
	];

	const recipeRows = $derived(
		data.recipes.map((recipe) => ({
			id: recipe.id,
			name: recipe.name,
			brewType: BREW_TYPE_CONFIG[recipe.brewType].label,
			style: recipe.style || 'No style',
			complexity: recipe.advancedMode ? 'Advanced' : 'Standard',
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
		eyebrow="Library"
		title="Recipes"
		description="Manage formulations, targets, ingredients, and BeerXML imports."
		meta={`${data.recipes.length} saved recipes`}
		actions={recipeHeaderActions}
	/>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>Could not update recipes</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<Sheet bind:open={importSheetOpen}>
		<SheetContent side="right" class="w-full gap-8 overflow-y-auto p-6 sm:max-w-2xl sm:p-8">
			<SheetHeader>
				<SheetTitle>Import BeerXML</SheetTitle>
				<SheetDescription>
					Paste BeerXML or upload an XML file to bring recipes in from another brewing app.
				</SheetDescription>
			</SheetHeader>

			<form
				bind:this={importBeerXmlForm}
				method="POST"
				action="?/importBeerXml"
				enctype="multipart/form-data"
				class="mt-2 flex flex-col gap-6"
			>
				<div class="space-y-3">
					<label for="beerXml" class="text-sm font-medium">Paste BeerXML</label>
					<textarea
						id="beerXml"
						name="beerXml"
						rows="12"
						class="flex min-h-56 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-xs ring-offset-background transition-[color,box-shadow] outline-none focus-visible:ring-1 focus-visible:ring-ring"
						placeholder="Paste a BeerXML recipe here if you want to import from another brewing app."
					></textarea>
					<div class="flex justify-end">
						<Button type="submit">Import pasted recipe</Button>
					</div>
				</div>
				<div class="space-y-4 rounded-2xl border bg-muted/30 p-5">
					<div class="space-y-3">
						<label for="beerXmlFile" class="text-sm font-medium">Or choose an XML file</label>
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
					<p class="text-sm text-muted-foreground">
						Choosing a file imports it immediately. Imported recipes keep your target volume, gravity,
						bitterness, color, and core notes.
					</p>
				</div>
			</form>
		</SheetContent>
	</Sheet>

	<DataTable
		data={recipeRows}
		columns={recipeColumns}
		filterControls={recipeFilters}
		searchColumnIds={['name', 'brewType', 'style', 'notes']}
		searchPlaceholder="Search recipes by name, style, or notes"
		emptyTitle="No recipes yet"
		emptyDescription="Create your first recipe or import a BeerXML file to populate this list."
	>
		{#snippet rowActions(recipe)}
			<Button href={recipe.openHref} variant="ghost" size="sm" class={actionItemClass}>Open</Button>
			<Button href={recipe.batchHref} variant="ghost" size="sm" class={actionItemClass}>
				Start batch
			</Button>
			<Button href={recipe.exportHref} variant="ghost" size="sm" class={actionItemClass}>
				Export XML
			</Button>
			<form method="POST" action="?/delete">
				<input type="hidden" name="id" value={recipe.id} />
				<Button type="submit" variant="ghost" size="sm" class={actionItemClass}>Delete</Button>
			</form>
		{/snippet}
	</DataTable>
</div>
