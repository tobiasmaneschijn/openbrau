<script lang="ts">
	import type { ActionData } from './$types';
	import type { AppPageHeaderAction } from '$lib/components/app/page-header';
	import PageHeaderConfig from '$lib/components/app/page-header-config.svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import EquipmentForm from '$lib/components/equipment/equipment-form.svelte';

	let { form }: { form: ActionData } = $props();
	const newEquipmentHeaderActions: AppPageHeaderAction[] = [
		{ label: 'Back', href: '/app/equipment', variant: 'outline' },
		{ label: 'Save profile', type: 'submit', form: 'equipment-create-form', variant: 'default' }
	];
</script>

<div class="space-y-6">
	<PageHeaderConfig
		eyebrow="Equipment"
		title="New equipment"
		description="Create a brewing setup profile for batch sizing, losses, and defaults."
		actions={newEquipmentHeaderActions}
	/>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>Could not create equipment</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<EquipmentForm
		formId="equipment-create-form"
		formAction="?/create"
		submitLabel="Save profile"
		cancelHref="/app/equipment"
	/>
</div>
