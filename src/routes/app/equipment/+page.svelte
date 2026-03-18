<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';
	import LayoutGridIcon from '@lucide/svelte/icons/layout-grid';
	import ListIcon from '@lucide/svelte/icons/list';
	import PlusIcon from '@lucide/svelte/icons/plus';
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
			<h1 class="text-3xl font-black tracking-tight">Equipment</h1>
			<p class="text-sm text-muted-foreground">{data.equipment.length} saved</p>
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

			<Button href={resolve('/app/equipment/new')}>
				<PlusIcon class="size-4" />
				Add new
			</Button>
		</div>
	</div>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>Could not update equipment</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	{#if data.equipment.length}
		<div class={view === 'grid' ? 'grid gap-4 md:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
			{#each data.equipment as profile (profile.id)}
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
										<a href={resolve(`/app/equipment/${profile.id}`)} class="hover:underline">
											{profile.name}
										</a>
									</CardTitle>
									{#if profile.isDefault}
										<Badge>Default</Badge>
									{/if}
								</div>
								<p class="text-sm text-muted-foreground">
									{profile.batchSizeL} L | {profile.boilOffRateLph} L/h | {profile.efficiencyPct}%
								</p>
							</div>

							<div class="flex items-center gap-2">
								<Button href={resolve(`/app/equipment/${profile.id}`)} variant="outline" size="sm">
									Open
								</Button>
								<form method="POST" action="?/delete">
									<input type="hidden" name="id" value={profile.id} />
									<Button type="submit" variant="ghost" size="sm">Delete</Button>
								</form>
							</div>
						</div>
					</CardHeader>
					{#if profile.description && view === 'grid'}
						<CardContent>
							<p class="text-sm text-muted-foreground">{profile.description}</p>
						</CardContent>
					{/if}
				</Card>
			{/each}
		</div>
	{:else}
		<Card class="border-dashed bg-card/95">
			<CardContent class="p-8">
				<p class="font-medium">No equipment yet</p>
			</CardContent>
		</Card>
	{/if}
</div>
