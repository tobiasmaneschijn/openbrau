<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';
	import LayoutGridIcon from '@lucide/svelte/icons/layout-grid';
	import ListIcon from '@lucide/svelte/icons/list';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { BATCH_STATUS_LABELS } from '$lib/batches/config';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let view = $state<'grid' | 'row'>('grid');
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-4 rounded-3xl border bg-card/95 p-5 shadow-sm md:flex-row md:items-center md:justify-between">
		<div>
			<h1 class="text-3xl font-black tracking-tight">Batches</h1>
			<p class="text-sm text-muted-foreground">{data.batches.length} tracked</p>
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

			<Button href={resolve('/app/batches/new')}>
				<PlusIcon class="size-4" />
				Start batch
			</Button>
		</div>
	</div>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>Could not update batches</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	{#if data.batches.length}
		<div class={view === 'grid' ? 'grid gap-4 md:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
			{#each data.batches as batch (batch.id)}
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
										<a href={resolve(`/app/batches/${batch.id}`)} class="hover:underline">
											{batch.recipeName}
										</a>
									</CardTitle>
									<Badge>{BATCH_STATUS_LABELS[batch.status]}</Badge>
								</div>
								<p class="text-sm text-muted-foreground">
									{batch.recipeStyle || 'No style'} | {batch.brewDate
										? batch.brewDate.toLocaleDateString()
										: 'Brew day not set'}
								</p>
								<div class="flex flex-wrap gap-3 text-sm text-muted-foreground">
									<span>{batch.equipmentName || 'Default setup'}</span>
									{#if batch.actualBatchSizeL}
										<span>{batch.actualBatchSizeL} L actual</span>
									{/if}
								</div>
							</div>

							<div class="flex items-center gap-2">
								<Button href={resolve(`/app/batches/${batch.id}`)} variant="outline" size="sm">
									Open
								</Button>
								<form method="POST" action="?/delete">
									<input type="hidden" name="id" value={batch.id} />
									<Button type="submit" variant="ghost" size="sm">Delete</Button>
								</form>
							</div>
						</div>
					</CardHeader>
					{#if batch.notes && view === 'grid'}
						<CardContent>
							<p class="text-sm text-muted-foreground">{batch.notes}</p>
						</CardContent>
					{/if}
				</Card>
			{/each}
		</div>
	{:else}
		<Card class="border-dashed bg-card/95">
			<CardContent class="p-8">
				<p class="font-medium">No batches yet</p>
				<p class="mt-1 text-sm text-muted-foreground">
					Start a batch from one of your recipes when you are ready to brew.
				</p>
			</CardContent>
		</Card>
	{/if}
</div>
