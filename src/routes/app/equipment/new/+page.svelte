<script lang="ts">
	import type { ActionData } from './$types';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import EquipmentForm from '$lib/components/equipment/equipment-form.svelte';

	let { form }: { form: ActionData } = $props();
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-black tracking-tight">New equipment</h1>
	</div>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>Could not create equipment</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<EquipmentForm formAction="?/create" submitLabel="Save profile" cancelHref="/app/equipment" />
</div>
