<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';
	import type { ColumnDef } from '@tanstack/table-core';
	import type { AppPageHeaderAction } from '$lib/components/app/page-header';
	import PageHeaderConfig from '$lib/components/app/page-header-config.svelte';
	import { BATCH_STATUS_LABELS } from '$lib/batches/config';
	import { DataTable, type DataTableFilterControl } from '$lib/components/data-table';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const actionItemClass = 'w-full justify-start px-2 py-1.5 text-sm shadow-none';
	const batchHeaderActions: AppPageHeaderAction[] = [
		{ label: 'Start batch', href: resolve('/app/batches/new'), variant: 'default' }
	];

	type BatchTableRow = {
		id: string;
		recipeName: string;
		status: string;
		style: string;
		brewDateValue: number;
		brewDateLabel: string;
		equipmentName: string;
		actualBatchSizeLValue: number;
		actualBatchSizeLabel: string;
		notes: string;
		openHref: string;
	};

	const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

	const batchColumns: ColumnDef<BatchTableRow>[] = [
		{
			accessorKey: 'recipeName',
			header: 'Batch'
		},
		{
			accessorKey: 'status',
			header: 'Status',
			enableColumnFilter: true
		},
		{
			accessorKey: 'style',
			header: 'Style'
		},
		{
			id: 'brewDate',
			header: 'Brew day',
			accessorFn: (row) => row.brewDateValue,
			cell: ({ row }) => row.original.brewDateLabel
		},
		{
			accessorKey: 'equipmentName',
			header: 'Equipment'
		},
		{
			id: 'actualBatchSize',
			header: 'Actual volume',
			accessorFn: (row) => row.actualBatchSizeLValue,
			cell: ({ row }) => row.original.actualBatchSizeLabel
		},
		{
			accessorKey: 'notes',
			header: 'Notes',
			enableSorting: false
		}
	];

	const batchFilters: DataTableFilterControl[] = [
		{
			columnId: 'status',
			label: 'Status',
			type: 'select',
			options: Object.values(BATCH_STATUS_LABELS).map((label) => ({
				label,
				value: label
			}))
		}
	];

	const batchRows = $derived(
		data.batches.map((batch) => ({
			id: batch.id,
			recipeName: batch.recipeName,
			status: BATCH_STATUS_LABELS[batch.status],
			style: batch.recipeStyle || 'No style',
			brewDateValue: batch.brewDate ? batch.brewDate.getTime() : -1,
			brewDateLabel: batch.brewDate ? dateFormatter.format(batch.brewDate) : 'Brew day not set',
			equipmentName: batch.equipmentName || 'Default setup',
			actualBatchSizeLValue: Number(batch.actualBatchSizeL ?? 0),
			actualBatchSizeLabel: batch.actualBatchSizeL ? `${batch.actualBatchSizeL} L` : '-',
			notes: batch.notes || '-',
			openHref: `/app/batches/${batch.id}`
		}))
	);
</script>

<div class="space-y-6">
	<PageHeaderConfig
		eyebrow="Brew log"
		title="Batches"
		description="Track brew day, fermentation, and packaging progress for every active batch."
		meta={`${data.batches.length} tracked batches`}
		actions={batchHeaderActions}
	/>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>Could not update batches</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<DataTable
		data={batchRows}
		columns={batchColumns}
		filterControls={batchFilters}
		searchColumnIds={['recipeName', 'status', 'style', 'equipmentName', 'notes']}
		searchPlaceholder="Search batches by recipe, status, equipment, or notes"
		emptyTitle="No batches yet"
		emptyDescription="Start a batch from one of your recipes when you are ready to brew."
	>
		{#snippet rowActions(batch)}
			<Button href={batch.openHref} variant="ghost" size="sm" class={actionItemClass}>Open</Button>
			<form method="POST" action="?/delete">
				<input type="hidden" name="id" value={batch.id} />
				<Button type="submit" variant="ghost" size="sm" class={actionItemClass}>Delete</Button>
			</form>
		{/snippet}
	</DataTable>
</div>
