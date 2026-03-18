<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import type { AppPageHeaderAction } from '$lib/components/app/page-header';
	import PageHeaderConfig from '$lib/components/app/page-header-config.svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import RecipeForm from '$lib/components/recipes/recipe-form.svelte';
	import * as m from '$lib/paraglide/messages';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const newRecipeHeaderActions: AppPageHeaderAction[] = [
		{ label: m.back(), href: '/app/recipes', variant: 'outline' },
		{ label: m.save_recipe(), type: 'submit', form: 'recipe-create-form', variant: 'default' }
	];
</script>

<div class="space-y-6">
	<PageHeaderConfig
		eyebrow={m.recipes()}
		title={m.new_recipe()}
		description={m.choose_planning_details()}
		actions={newRecipeHeaderActions}
	/>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>{m.could_not_create_recipe()}</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<RecipeForm formId="recipe-create-form" equipment={data.equipment} formAction="?/create" />
</div>
