<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import type { AppPageHeaderAction } from '$lib/components/app/page-header';
	import PageHeaderConfig from '$lib/components/app/page-header-config.svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import EquipmentForm from '$lib/components/equipment/equipment-form.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const equipmentDetailHeaderActions = $derived([
		{ label: 'Back', href: '/app/equipment', variant: 'outline' },
		{ label: 'Save changes', type: 'submit', form: 'equipment-edit-form', variant: 'default' }
	] satisfies AppPageHeaderAction[]);
</script>

<div class="space-y-6">
	<PageHeaderConfig
		eyebrow="Equipment"
		title={data.profile.name}
		description="Update batch sizing, losses, efficiency, and default brewing setup details."
		actions={equipmentDetailHeaderActions}
	/>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>Could not save equipment</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<EquipmentForm
		formId="equipment-edit-form"
		profile={data.profile}
		formAction="?/update"
		submitLabel="Save changes"
		cancelHref="/app/equipment"
		deleteAction="?/delete"
	/>
</div>
