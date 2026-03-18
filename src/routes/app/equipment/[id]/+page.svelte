<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import EquipmentForm from '$lib/components/equipment/equipment-form.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-black tracking-tight">{data.profile.name}</h1>
	</div>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>Could not save equipment</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<EquipmentForm
		profile={data.profile}
		formAction="?/update"
		submitLabel="Save changes"
		cancelHref="/app/equipment"
		deleteAction="?/delete"
	/>
</div>
