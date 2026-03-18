<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import type { AppPageHeaderAction } from '$lib/components/app/page-header';
	import PageHeaderConfig from '$lib/components/app/page-header-config.svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import EquipmentForm from '$lib/components/equipment/equipment-form.svelte';
	import * as m from '$lib/paraglide/messages';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const equipmentDetailHeaderActions = $derived([
		{ label: m.back(), href: '/app/equipment', variant: 'outline' },
		{ label: m.save_changes(), type: 'submit', form: 'equipment-edit-form', variant: 'default' }
	] satisfies AppPageHeaderAction[]);
</script>

<div class="space-y-6">
	<PageHeaderConfig
		eyebrow={m.equipment()}
		title={data.profile.name}
		description={m.brewhouse_defaults()}
		actions={equipmentDetailHeaderActions}
	/>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>{m.could_not_save_equipment()}</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<EquipmentForm
		formId="equipment-edit-form"
		profile={data.profile}
		formAction="?/update"
		submitLabel={m.save_changes()}
		cancelHref="/app/equipment"
		deleteAction="?/delete"
	/>
</div>
