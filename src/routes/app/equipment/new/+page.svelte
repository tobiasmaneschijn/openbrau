<script lang="ts">
	import type { ActionData } from './$types';
	import type { AppPageHeaderAction } from '$lib/components/app/page-header';
	import PageHeaderConfig from '$lib/components/app/page-header-config.svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import EquipmentForm from '$lib/components/equipment/equipment-form.svelte';
	import * as m from '$lib/paraglide/messages';

	let { form }: { form: ActionData } = $props();
	const newEquipmentHeaderActions: AppPageHeaderAction[] = [
		{ label: m.back(), href: '/app/equipment', variant: 'outline' },
		{ label: m.save_profile(), type: 'submit', form: 'equipment-create-form', variant: 'default' }
	];
</script>

<div class="space-y-6">
	<PageHeaderConfig
		eyebrow={m.equipment()}
		title={m.new_equipment()}
		description={m.brewhouse_defaults()}
		actions={newEquipmentHeaderActions}
	/>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>{m.could_not_create_equipment()}</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<EquipmentForm
		formId="equipment-create-form"
		formAction="?/create"
		submitLabel={m.save_profile()}
		cancelHref="/app/equipment"
	/>
</div>
