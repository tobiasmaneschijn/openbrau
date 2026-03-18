<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import type { AppPageHeaderAction } from '$lib/components/app/page-header';
	import PageHeaderConfig from '$lib/components/app/page-header-config.svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import RecipeForm from '$lib/components/recipes/recipe-form.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const newRecipeHeaderActions: AppPageHeaderAction[] = [
		{ label: 'Back', href: '/app/recipes', variant: 'outline' },
		{ label: 'Save recipe', type: 'submit', form: 'recipe-create-form', variant: 'default' }
	];
</script>

<div class="space-y-6">
	<PageHeaderConfig
		eyebrow="Recipes"
		title="New recipe"
		description="Set your targets, choose your setup, and keep the recipe as simple or detailed as you want."
		actions={newRecipeHeaderActions}
	/>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>Could not create recipe</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<RecipeForm formId="recipe-create-form" equipment={data.equipment} formAction="?/create" />
</div>
