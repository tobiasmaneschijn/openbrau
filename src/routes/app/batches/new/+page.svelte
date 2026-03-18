<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-4 rounded-3xl border bg-card/95 p-5 shadow-sm md:flex-row md:items-start md:justify-between">
		<div class="space-y-2">
			<h1 class="text-3xl font-black tracking-tight">Start a batch</h1>
			<p class="text-sm text-muted-foreground">
				Choose a recipe, confirm the setup, and create a batch log for brew day and fermentation.
			</p>
		</div>
		<div class="flex flex-wrap items-center gap-3 md:justify-end">
			<Button href={resolve('/app/batches')} variant="outline">Back</Button>
			<Button type="submit" form="batch-create-form">Create batch</Button>
		</div>
	</div>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>Could not create batch</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<form id="batch-create-form" method="POST" action="?/create">
		<div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
			<Card class="border-border/70 bg-card/95 shadow-sm">
				<CardHeader>
					<CardTitle class="text-xl font-bold">Batch details</CardTitle>
					<CardDescription>Start with the recipe you are brewing and add optional brew-day notes.</CardDescription>
				</CardHeader>
				<CardContent class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2 md:col-span-2">
						<label for="recipeId" class="text-sm font-medium">Recipe</label>
						<select
							id="recipeId"
							name="recipeId"
							class="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background transition-[color,box-shadow] outline-none focus-visible:ring-1 focus-visible:ring-ring"
							required
						>
							<option value="">Choose a recipe</option>
							{#each data.recipes as recipe (recipe.id)}
								<option value={recipe.id} selected={recipe.id === data.selectedRecipeId}>
									{recipe.name}
								</option>
							{/each}
						</select>
					</div>

					<div class="space-y-2">
						<label for="brewDate" class="text-sm font-medium">Brew date</label>
						<Input id="brewDate" name="brewDate" type="date" />
					</div>

					<div class="space-y-2">
						<label for="actualBatchSizeL" class="text-sm font-medium">Expected batch size (L)</label>
						<Input id="actualBatchSizeL" name="actualBatchSizeL" type="number" step="0.001" />
					</div>

					<div class="space-y-2 md:col-span-2">
						<label for="equipmentId" class="text-sm font-medium">Brewing setup override</label>
						<select
							id="equipmentId"
							name="equipmentId"
							class="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background transition-[color,box-shadow] outline-none focus-visible:ring-1 focus-visible:ring-ring"
						>
							<option value="">Use the recipe's setup</option>
							{#each data.equipment as profile (profile.id)}
								<option value={profile.id}>{profile.name}</option>
							{/each}
						</select>
					</div>

					<div class="space-y-2 md:col-span-2">
						<label for="notes" class="text-sm font-medium">Batch notes</label>
						<Textarea
							id="notes"
							name="notes"
							rows={5}
							placeholder="Add brew-day reminders, ingredient substitutions, or packaging notes."
						/>
					</div>
				</CardContent>
			</Card>

			<Card class="border-border/70 bg-card/95 shadow-sm xl:sticky xl:top-6 xl:self-start">
				<CardHeader>
					<CardTitle class="text-xl font-bold">What happens next</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4 text-sm text-muted-foreground">
					<p>Your new batch starts in Draft so you can finish planning before brew day.</p>
					<p>Once you begin brewing, move it through Brewing, Fermenting, Conditioning, and Finished.</p>
					<p>You can add gravity and temperature entries from the batch page as fermentation progresses.</p>
				</CardContent>
			</Card>
		</div>
	</form>
</div>
