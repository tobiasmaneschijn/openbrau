<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';
	import LayoutGridIcon from '@lucide/svelte/icons/layout-grid';
	import ListIcon from '@lucide/svelte/icons/list';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { BREW_TYPE_CONFIG } from '$lib/recipes/config';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let view = $state<'grid' | 'row'>('grid');
</script>

<div class="space-y-6">
	<div
		class="flex flex-col gap-4 rounded-3xl border bg-card/95 p-5 shadow-sm md:flex-row md:items-center md:justify-between"
	>
		<div>
			<h1 class="text-3xl font-black tracking-tight">Recipes</h1>
			<p class="text-sm text-muted-foreground">{data.recipes.length} saved</p>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<div class="flex rounded-xl border bg-background p-1">
				<button
					type="button"
					class={`rounded-lg px-3 py-2 text-sm transition ${view === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
					onclick={() => (view = 'grid')}
				>
					<LayoutGridIcon class="size-4" />
				</button>
				<button
					type="button"
					class={`rounded-lg px-3 py-2 text-sm transition ${view === 'row' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
					onclick={() => (view = 'row')}
				>
					<ListIcon class="size-4" />
				</button>
			</div>

			<Button href={resolve('/app/recipes/new')}>
				<PlusIcon class="size-4" />
				Add new
			</Button>
		</div>
	</div>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>Could not update recipes</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<Card class="border-border/70 bg-card/95 shadow-sm">
		<CardHeader>
			<CardTitle class="text-xl font-bold">Import BeerXML</CardTitle>
		</CardHeader>
		<CardContent>
			<form method="POST" action="?/importBeerXml" enctype="multipart/form-data" class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
				<div class="space-y-2">
					<label for="beerXml" class="text-sm font-medium">Paste BeerXML</label>
					<textarea
						id="beerXml"
						name="beerXml"
						rows="8"
						class="flex min-h-32 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background transition-[color,box-shadow] outline-none focus-visible:ring-1 focus-visible:ring-ring"
						placeholder="Paste a BeerXML recipe here if you want to import from another brewing app."
					></textarea>
				</div>
				<div class="space-y-4 rounded-2xl border bg-background/60 p-4">
					<div class="space-y-2">
						<label for="beerXmlFile" class="text-sm font-medium">Or choose an XML file</label>
						<input
							id="beerXmlFile"
							name="beerXmlFile"
							type="file"
							accept=".xml,text/xml,application/xml"
							class="block w-full text-sm"
						/>
					</div>
					<Button type="submit" class="w-full">Import recipe</Button>
					<p class="text-sm text-muted-foreground">
						Imported recipes keep your target volume, gravity, bitterness, color, and core notes.
					</p>
				</div>
			</form>
		</CardContent>
	</Card>

	{#if data.recipes.length}
		<div class={view === 'grid' ? 'grid gap-4 md:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
			{#each data.recipes as recipe (recipe.id)}
				<Card class="border-border/70 bg-card/95 shadow-sm">
					<CardHeader class={view === 'row' ? 'pb-3' : ''}>
						<div
							class={view === 'row'
								? 'flex flex-col gap-4 md:flex-row md:items-center md:justify-between'
								: 'space-y-4'}
						>
							<div class="space-y-3">
								<div class="flex flex-wrap items-center gap-2">
									<CardTitle class="text-xl font-bold">
										<a href={resolve(`/app/recipes/${recipe.id}`)} class="hover:underline">
											{recipe.name}
										</a>
									</CardTitle>
									<Badge variant="secondary">{BREW_TYPE_CONFIG[recipe.brewType].label}</Badge>
									{#if recipe.advancedMode}
										<Badge>Advanced</Badge>
									{/if}
								</div>
								<p class="text-sm text-muted-foreground">
									{recipe.style || 'No style'} | {recipe.targetBatchSizeL} L
								</p>
								<div class="flex flex-wrap gap-3 text-sm text-muted-foreground">
									{#if recipe.targetOg}
										<span>OG {recipe.targetOg}</span>
									{/if}
									{#if recipe.targetFg}
										<span>FG {recipe.targetFg}</span>
									{/if}
									{#if recipe.targetIbu}
										<span>{recipe.targetIbu} IBU</span>
									{/if}
								</div>
							</div>

							<div class="flex items-center gap-2">
								<Button href={resolve(`/app/batches/new?recipeId=${recipe.id}`)} variant="secondary" size="sm">
									Start batch
								</Button>
								<Button href={resolve(`/app/recipes/${recipe.id}/beerxml`)} variant="ghost" size="sm">
									Export XML
								</Button>
								<Button href={resolve(`/app/recipes/${recipe.id}`)} variant="outline" size="sm">
									Open
								</Button>
								<form method="POST" action="?/delete">
									<input type="hidden" name="id" value={recipe.id} />
									<Button type="submit" variant="ghost" size="sm">Delete</Button>
								</form>
							</div>
						</div>
					</CardHeader>
					{#if recipe.notes && view === 'grid'}
						<CardContent>
							<p class="text-sm text-muted-foreground">{recipe.notes}</p>
						</CardContent>
					{/if}
				</Card>
			{/each}
		</div>
	{:else}
		<Card class="border-dashed bg-card/95">
			<CardContent class="p-8">
				<p class="font-medium">No recipes yet</p>
			</CardContent>
		</Card>
	{/if}
</div>
