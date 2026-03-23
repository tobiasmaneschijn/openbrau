<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';
	import type { AppPageHeaderAction } from '$lib/components/app/page-header';
	import PageHeaderConfig from '$lib/components/app/page-header-config.svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as m from '$lib/paraglide/messages';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const newBatchHeaderActions: AppPageHeaderAction[] = [
		{ label: m.back(), href: resolve('/app/batches'), variant: 'outline' },
		{ label: m.create_batch(), type: 'submit', form: 'batch-create-form', variant: 'default' }
	];
</script>

<div class="space-y-6">
	<PageHeaderConfig
		eyebrow={m.batches()}
		title={m.new_batch()}
		description={m.batch_details()}
		actions={newBatchHeaderActions}
	/>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>{m.could_not_create_batch()}</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<form id="batch-create-form" method="POST" action="?/create">
		<div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
			<Card class="border-border/70 bg-card/95 shadow-sm">
				<CardHeader>
					<CardTitle class="text-xl font-bold">{m.batch_details()}</CardTitle>
					<CardDescription>{m.batch_notes_description()}</CardDescription>
				</CardHeader>
				<CardContent class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2 md:col-span-2">
						<label for="recipeId" class="text-sm font-medium">{m.choose_recipe()}</label>
						<select
							id="recipeId"
							name="recipeId"
							class="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background transition-[color,box-shadow] outline-none focus-visible:ring-1 focus-visible:ring-ring"
							required
						>
							<option value="">{m.choose_recipe()}</option>
							{#each data.recipes as recipe (recipe.id)}
								<option value={recipe.id} selected={recipe.id === data.selectedRecipeId}>
									{recipe.name}
								</option>
							{/each}
						</select>
					</div>

					<div class="space-y-2">
						<label for="brewDate" class="text-sm font-medium">{m.brew_date()}</label>
						<Input id="brewDate" name="brewDate" type="date" />
					</div>

					<div class="space-y-2">
						<label for="actualBatchSizeL" class="text-sm font-medium"
							>{m.expected_batch_size()}</label
						>
						<Input id="actualBatchSizeL" name="actualBatchSizeL" type="number" step="0.001" />
					</div>

					<div class="space-y-2 md:col-span-2">
						<label for="notes" class="text-sm font-medium">{m.batch_notes()}</label>
						<Textarea id="notes" name="notes" rows={5} placeholder={m.batch_notes_description()} />
					</div>
				</CardContent>
			</Card>

			<Card class="border-border/70 bg-card/95 shadow-sm xl:sticky xl:top-6 xl:self-start">
				<CardHeader>
					<CardTitle class="text-xl font-bold">{m.what_happens_next()}</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4 text-sm text-muted-foreground">
					<p>{m.draft_status_message()}</p>
					<p>{m.progress_through_stages()}</p>
					<p>{m.add_temperature_entries()}</p>
				</CardContent>
			</Card>
		</div>
	</form>
</div>
