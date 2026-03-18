<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';
	import type { ColumnDef } from '@tanstack/table-core';
	import type { AppPageHeaderAction } from '$lib/components/app/page-header';
	import PageHeaderConfig from '$lib/components/app/page-header-config.svelte';
	import { DataTable, type DataTableFilterControl } from '$lib/components/data-table';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const actionItemClass = 'w-full justify-start px-2 py-1.5 text-sm shadow-none';
	const equipmentHeaderActions: AppPageHeaderAction[] = [
		{ label: m.add_new(), href: resolve('/app/equipment/new'), variant: 'default' }
	];

	type EquipmentTableRow = {
		id: string;
		name: string;
		batchSizeLValue: number;
		batchSizeLabel: string;
		boilOffRateLphValue: number;
		boilOffRateLphLabel: string;
		efficiencyPctValue: number;
		efficiencyPctLabel: string;
		defaultStatus: string;
		description: string;
		openHref: string;
	};

	const equipmentColumns: ColumnDef<EquipmentTableRow>[] = [
		{
			accessorKey: 'name',
			header: m.profile()
		},
		{
			id: 'batchSize',
			header: m.batch_size_label(),
			accessorFn: (row) => row.batchSizeLValue,
			cell: ({ row }) => row.original.batchSizeLabel
		},
		{
			id: 'boilOffRate',
			header: m.boil_off(),
			accessorFn: (row) => row.boilOffRateLphValue,
			cell: ({ row }) => row.original.boilOffRateLphLabel
		},
		{
			id: 'efficiency',
			header: m.efficiency(),
			accessorFn: (row) => row.efficiencyPctValue,
			cell: ({ row }) => row.original.efficiencyPctLabel
		},
		{
			accessorKey: 'defaultStatus',
			header: m.default_label(),
			enableColumnFilter: true
		},
		{
			accessorKey: 'description',
			header: m.summary(),
			enableSorting: false
		}
	];

	const equipmentFilters: DataTableFilterControl[] = [
		{
			columnId: 'defaultStatus',
			label: m.default_label(),
			type: 'select',
			options: [
				{ label: m.default_label(), value: m.default_label() },
				{ label: m.custom_label(), value: m.custom_label() }
			]
		}
	];

	const equipmentRows = $derived(
		data.equipment.map((profile) => ({
			id: profile.id,
			name: profile.name,
			batchSizeLValue: Number(profile.batchSizeL),
			batchSizeLabel: `${profile.batchSizeL} L`,
			boilOffRateLphValue: Number(profile.boilOffRateLph),
			boilOffRateLphLabel: `${profile.boilOffRateLph} L/h`,
			efficiencyPctValue: Number(profile.efficiencyPct),
			efficiencyPctLabel: `${profile.efficiencyPct}%`,
			defaultStatus: profile.isDefault ? m.default_label() : m.custom_label(),
			description: profile.description || '-',
			openHref: `/app/equipment/${profile.id}`
		}))
	);
</script>

<div class="space-y-6">
	<PageHeaderConfig
		eyebrow={m.brew_house()}
		title={m.equipment()}
		description={m.brew_house_description()}
		meta={m.saved_profiles({ count: data.equipment.length })}
		actions={equipmentHeaderActions}
	/>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>{m.could_not_update_equipment()}</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<DataTable
		data={equipmentRows}
		columns={equipmentColumns}
		filterControls={equipmentFilters}
		searchColumnIds={['name', 'description', 'defaultStatus']}
		searchPlaceholder={m.search_equipment()}
		emptyTitle={m.no_equipment_yet()}
		emptyDescription={m.create_equipment_profile()}
	>
		{#snippet rowActions(profile)}
			<Button href={profile.openHref} variant="ghost" size="sm" class={actionItemClass}>{m.open()}</Button
			>
			<form method="POST" action="?/delete">
				<input type="hidden" name="id" value={profile.id} />
				<Button type="submit" variant="ghost" size="sm" class={actionItemClass}>{m.delete()}</Button>
			</form>
		{/snippet}
	</DataTable>
</div>
