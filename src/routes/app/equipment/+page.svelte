<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';
	import type { ColumnDef } from '@tanstack/table-core';
	import type { AppPageHeaderAction } from '$lib/components/app/page-header';
	import PageHeaderConfig from '$lib/components/app/page-header-config.svelte';
	import { DataTable, type DataTableFilterControl } from '$lib/components/data-table';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const actionItemClass = 'w-full justify-start px-2 py-1.5 text-sm shadow-none';
	const equipmentHeaderActions: AppPageHeaderAction[] = [
		{ label: 'Add new', href: resolve('/app/equipment/new'), variant: 'default' }
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
			header: 'Profile'
		},
		{
			id: 'batchSize',
			header: 'Batch size',
			accessorFn: (row) => row.batchSizeLValue,
			cell: ({ row }) => row.original.batchSizeLabel
		},
		{
			id: 'boilOffRate',
			header: 'Boil-off',
			accessorFn: (row) => row.boilOffRateLphValue,
			cell: ({ row }) => row.original.boilOffRateLphLabel
		},
		{
			id: 'efficiency',
			header: 'Efficiency',
			accessorFn: (row) => row.efficiencyPctValue,
			cell: ({ row }) => row.original.efficiencyPctLabel
		},
		{
			accessorKey: 'defaultStatus',
			header: 'Default',
			enableColumnFilter: true
		},
		{
			accessorKey: 'description',
			header: 'Description',
			enableSorting: false
		}
	];

	const equipmentFilters: DataTableFilterControl[] = [
		{
			columnId: 'defaultStatus',
			label: 'Default',
			type: 'select',
			options: [
				{ label: 'Default', value: 'Default' },
				{ label: 'Custom', value: 'Custom' }
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
			defaultStatus: profile.isDefault ? 'Default' : 'Custom',
			description: profile.description || '-',
			openHref: `/app/equipment/${profile.id}`
		}))
	);
</script>

<div class="space-y-6">
	<PageHeaderConfig
		eyebrow="Brew house"
		title="Equipment"
		description="Maintain brew house profiles for sizing, losses, and default brewing setups."
		meta={`${data.equipment.length} saved profiles`}
		actions={equipmentHeaderActions}
	/>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>Could not update equipment</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<DataTable
		data={equipmentRows}
		columns={equipmentColumns}
		filterControls={equipmentFilters}
		searchColumnIds={['name', 'description', 'defaultStatus']}
		searchPlaceholder="Search equipment profiles by name or description"
		emptyTitle="No equipment yet"
		emptyDescription="Create an equipment profile so recipes and batches can scale against real-world losses."
	>
		{#snippet rowActions(profile)}
			<Button href={profile.openHref} variant="ghost" size="sm" class={actionItemClass}>Open</Button
			>
			<form method="POST" action="?/delete">
				<input type="hidden" name="id" value={profile.id} />
				<Button type="submit" variant="ghost" size="sm" class={actionItemClass}>Delete</Button>
			</form>
		{/snippet}
	</DataTable>
</div>
