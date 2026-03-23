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
	import { createDateFormatter, getEffectiveNumberLocale, readUserSettings } from '$lib/settings';
	import { formatVolume } from '$lib/units';
	import * as m from '$lib/paraglide/messages';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const actionItemClass = 'w-full justify-start px-2 py-1.5 text-sm shadow-none';
	const settings = $derived(readUserSettings(data.user?.preferences));
	const batchHeaderActions: AppPageHeaderAction[] = [
		{ label: m.start_batch(), href: resolve('/app/batches/new'), variant: 'default' }
	];

	type BatchTableRow = {
		id: string;
		recipeName: string;
		status: string;
		style: string;
		brewDateValue: number;
		brewDateLabel: string;
		actualBatchSizeLValue: number;
		actualBatchSizeLabel: string;
		notes: string;
		openHref: string;
	};

	const dateFormatter = $derived(createDateFormatter(settings, { dateStyle: 'medium' }));
	const batchColumns: ColumnDef<BatchTableRow>[] = [
		{
			accessorKey: 'recipeName',
			header: m.batch_log(),
			enableColumnFilter: true,
			meta: { filter: { type: 'string' } }
		},
		{
			accessorKey: 'status',
			header: m.batch_status_draft(),
			enableColumnFilter: true,
			meta: {
				filter: {
					type: 'enum',
					options: Object.values(BATCH_STATUS_LABELS).map((label) => ({
						label,
						value: label
					}))
				}
			}
		},
		{
			accessorKey: 'style',
			header: m.style(),
			enableColumnFilter: true,
			meta: { filter: { type: 'string' } }
		},
		{
			id: 'brewDate',
			header: m.date_and_time(),
			accessorFn: (row) => row.brewDateValue,
			cell: ({ row }) => row.original.brewDateLabel,
			enableColumnFilter: true,
			meta: { filter: { type: 'date' } }
		},

		{
			id: 'actualBatchSize',
			header: m.target_volume(),
			accessorFn: (row) => row.actualBatchSizeLValue,
			cell: ({ row }) => row.original.actualBatchSizeLabel,
			enableColumnFilter: true,
			meta: { filter: { type: 'number' } }
		},
		{
			accessorKey: 'notes',
			header: m.notes(),
			enableSorting: false
		}
	];

	const batchRows = $derived(
		data.batches.map((batch) => ({
			id: batch.id,
			recipeName: batch.recipeName,
			status: BATCH_STATUS_LABELS[batch.status],
			style: batch.recipeStyle || m.unknown(),
			brewDateValue: batch.brewDate ? batch.brewDate.getTime() : -1,
			brewDateLabel: batch.brewDate ? dateFormatter.format(batch.brewDate) : m.unknown(),
			actualBatchSizeLValue: Number(batch.actualBatchSizeL ?? 0),
			actualBatchSizeLabel: batch.actualBatchSizeL
				? formatVolume(
						Number(batch.actualBatchSizeL),
						settings.units,
						getEffectiveNumberLocale(settings)
					)
				: '-',
			notes: batch.notes || '-',
			openHref: `/app/batches/${batch.id}`
		}))
	);
</script>

<div class="space-y-6">
	<PageHeaderConfig
		eyebrow={m.batch_log()}
		title={m.batches()}
		description={m.live_batch_overview_description()}
		meta={m.tracked_batches({ count: data.batches.length })}
		actions={batchHeaderActions}
	/>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>{m.could_not_update_batches()}</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<DataTable
		data={batchRows}
		columns={batchColumns}
		searchColumnIds={['recipeName', 'status', 'style', 'notes']}
		searchPlaceholder={m.search_recipes()}
		emptyTitle={m.no_recipes_yet()}
		emptyDescription={m.create_first_recipe()}
	>
		{#snippet rowActions(batch)}
			<Button href={batch.openHref} variant="ghost" size="sm" class={actionItemClass}
				>{m.open()}</Button
			>
			<form method="POST" action="?/delete">
				<input type="hidden" name="id" value={batch.id} />
				<Button type="submit" variant="ghost" size="sm" class={actionItemClass}>{m.delete()}</Button
				>
			</form>
		{/snippet}
	</DataTable>
</div>
