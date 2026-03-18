<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import RecipeForm from '$lib/components/recipes/recipe-form.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-4 rounded-3xl border bg-card/95 p-5 shadow-sm md:flex-row md:items-start md:justify-between">
		<div class="space-y-2">
			<h1 class="text-3xl font-black tracking-tight">New recipe</h1>
			<p class="text-sm text-muted-foreground">
				Set your targets, choose your setup, and keep the recipe as simple or detailed as you want.
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-3 md:justify-end">
			<Button href="/app/recipes" variant="outline">Back</Button>
			<Button type="submit" form="recipe-create-form">Save recipe</Button>
		</div>
	</div>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>Could not create recipe</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<RecipeForm
		formId="recipe-create-form"
		equipment={data.equipment}
		formAction="?/create"
	/>
</div>
