<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';
	import ActivityIcon from '@lucide/svelte/icons/activity';
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import ScaleIcon from '@lucide/svelte/icons/scale';
	import WavesIcon from '@lucide/svelte/icons/waves';
	import { BATCH_STATUS_LABELS } from '$lib/batches/config';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { estimateAbv, specificGravityFromPoints } from '$lib/math/brewing';
	import { formatVolume } from '$lib/units';

	let { data }: { data: PageData } = $props();

	const sampleOg = specificGravityFromPoints(52);
	const sampleAbv = estimateAbv(sampleOg, 1.01);
</script>

<div class="space-y-8">
	<section class="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
		<Card class="border-border/70 bg-card/95 shadow-sm">
			<CardHeader class="space-y-4">
				<Badge variant="secondary" class="w-fit rounded-full px-3 py-1 tracking-[0.16em] uppercase">
					Workspace
				</Badge>
				<CardTitle class="text-4xl font-black tracking-tight">Your process control room</CardTitle>
				<CardDescription class="max-w-2xl text-base leading-7">
					Phase 4 brings recipe planning, batch tracking, BeerXML portability, and audit-backed data
					history into the same self-hosted workspace.
				</CardDescription>
			</CardHeader>
			<CardContent class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<div class="rounded-2xl border bg-background/80 p-4">
					<p class="text-sm text-muted-foreground">Recipes</p>
					<p class="mt-3 text-3xl font-black">{data.recipeCount}</p>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">
						Formulations ready for ingredient work
					</p>
				</div>
				<div class="rounded-2xl border bg-background/80 p-4">
					<p class="text-sm text-muted-foreground">Batches</p>
					<p class="mt-3 text-3xl font-black">{data.batchCount}</p>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">
						Brews moving through fermentation
					</p>
				</div>
				<div class="rounded-2xl border bg-background/80 p-4">
					<p class="text-sm text-muted-foreground">Equipment profiles</p>
					<p class="mt-3 text-3xl font-black">{data.equipmentCount}</p>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">
						Profiles used for scaling and losses
					</p>
				</div>
				<div class="rounded-2xl border bg-background/80 p-4">
					<p class="text-sm text-muted-foreground">20 L rendered</p>
					<p class="mt-3 text-3xl font-black">{formatVolume(20, 'imperial')}</p>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">
						Display-layer conversion example
					</p>
				</div>
				<div class="rounded-2xl border bg-background/80 p-4">
					<p class="text-sm text-muted-foreground">Sample ABV</p>
					<p class="mt-3 text-3xl font-black">{sampleAbv.toFixed(1)}%</p>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">
						Starter process math module online
					</p>
				</div>
			</CardContent>
		</Card>

		<Card class="border-border/70 bg-sidebar/95 shadow-sm">
			<CardHeader>
				<CardTitle class="text-2xl font-bold">Next steps</CardTitle>
				<CardDescription>Jump into recipes, batches, or equipment from the workspace home.</CardDescription>
			</CardHeader>
			<CardContent class="space-y-3">
				<Button href={resolve('/app/recipes')} class="w-full justify-start">
					<BookOpenIcon class="size-4" />
					Manage recipes
				</Button>
				<Button href={resolve('/app/batches')} variant="outline" class="w-full justify-start">
					<ActivityIcon class="size-4" />
					Track batches
				</Button>
				<Button href={resolve('/app/equipment')} variant="outline" class="w-full justify-start">
					<ScaleIcon class="size-4" />
					Manage equipment
				</Button>
			</CardContent>
		</Card>
	</section>

	<section class="grid gap-6 xl:grid-cols-3">
		<Card class="border-border/70 bg-card/95">
			<CardHeader class="flex flex-row items-start justify-between gap-4">
				<div>
					<CardTitle class="text-2xl font-bold">Recent recipes</CardTitle>
					<CardDescription>Recent formulations ready for deeper ingredient work.</CardDescription>
				</div>
				<Button href={resolve('/app/recipes')} variant="ghost" size="sm">All recipes</Button>
			</CardHeader>
			<CardContent class="space-y-3">
				{#if data.recentRecipes.length}
					{#each data.recentRecipes as recipe (recipe.id)}
						<a
							href={resolve(`/app/recipes/${recipe.id}`)}
							class="block rounded-2xl border p-4 transition hover:bg-accent/50"
						>
							<div class="flex items-center justify-between gap-3">
								<div>
									<p class="font-semibold">{recipe.name}</p>
									<p class="text-sm text-muted-foreground">
										{recipe.style || 'Style not set'} | {recipe.targetBatchSizeL} L target
									</p>
								</div>
								<Badge variant={recipe.advancedMode ? 'default' : 'secondary'}>
									{recipe.advancedMode ? 'Advanced' : 'Simple'}
								</Badge>
							</div>
						</a>
					{/each}
				{:else}
					<div class="rounded-2xl border border-dashed p-6">
						<p class="font-medium">No recipes yet</p>
						<p class="mt-1 text-sm text-muted-foreground">
							Create your first formulation to continue.
						</p>
					</div>
				{/if}
			</CardContent>
		</Card>

		<Card class="border-border/70 bg-card/95">
			<CardHeader class="flex flex-row items-start justify-between gap-4">
				<div>
					<CardTitle class="text-2xl font-bold">Recent equipment</CardTitle>
					<CardDescription>Profiles used for losses, throughput, and scaling.</CardDescription>
				</div>
				<Button href={resolve('/app/equipment')} variant="ghost" size="sm">All equipment</Button>
			</CardHeader>
			<CardContent class="space-y-3">
				{#if data.recentEquipment.length}
					{#each data.recentEquipment as profile (profile.id)}
						<a
							href={resolve(`/app/equipment/${profile.id}`)}
							class="block rounded-2xl border p-4 transition hover:bg-accent/50"
						>
							<div class="flex items-center justify-between gap-3">
								<div>
									<p class="font-semibold">{profile.name}</p>
									<p class="text-sm text-muted-foreground">
										{profile.batchSizeL} L batch | {profile.boilOffRateLph} L/h process loss
									</p>
								</div>
								{#if profile.isDefault}
									<Badge>Default</Badge>
								{/if}
							</div>
						</a>
					{/each}
				{:else}
					<div class="rounded-2xl border border-dashed p-6">
						<p class="font-medium">No equipment profiles yet</p>
						<p class="mt-1 text-sm text-muted-foreground">Add one to support realistic scaling.</p>
					</div>
				{/if}
			</CardContent>
		</Card>

		<Card class="border-border/70 bg-card/95">
			<CardHeader class="flex flex-row items-start justify-between gap-4">
				<div>
					<CardTitle class="text-2xl font-bold">Recent batches</CardTitle>
					<CardDescription>Follow the batches currently moving through brew day and fermentation.</CardDescription>
				</div>
				<Button href={resolve('/app/batches')} variant="ghost" size="sm">All batches</Button>
			</CardHeader>
			<CardContent class="space-y-3">
				{#if data.recentBatches.length}
					{#each data.recentBatches as batch (batch.id)}
						<a
							href={resolve(`/app/batches/${batch.id}`)}
							class="block rounded-2xl border p-4 transition hover:bg-accent/50"
						>
							<div class="flex items-center justify-between gap-3">
								<div>
									<p class="font-semibold">{batch.recipeName}</p>
									<p class="text-sm text-muted-foreground">
										{batch.equipmentName || 'Default setup'} | {batch.brewDate
											? batch.brewDate.toLocaleDateString()
											: 'Date not set'}
									</p>
								</div>
								<Badge>{BATCH_STATUS_LABELS[batch.status]}</Badge>
							</div>
						</a>
					{/each}
				{:else}
					<div class="rounded-2xl border border-dashed p-6">
						<p class="font-medium">No batches yet</p>
						<p class="mt-1 text-sm text-muted-foreground">
							Start your first batch from a saved recipe.
						</p>
					</div>
				{/if}
			</CardContent>
		</Card>
	</section>

	<Card class="border-border/70 bg-sidebar/65">
		<CardContent class="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
			<div class="flex items-start gap-3">
				<WavesIcon class="mt-1 size-5 text-primary" />
				<div>
					<p class="font-semibold">Metric-first foundation is active</p>
					<p class="text-sm text-muted-foreground">
						Data stays in liters, kilograms, celsius, and minutes; conversion happens at the display
						layer.
					</p>
				</div>
			</div>
			<Separator orientation="vertical" class="hidden h-10 md:block" />
			<div class="text-sm text-muted-foreground">
				OG sample: {sampleOg.toFixed(3)} | ABV sample: {sampleAbv.toFixed(1)}%
			</div>
		</CardContent>
	</Card>
</div>
