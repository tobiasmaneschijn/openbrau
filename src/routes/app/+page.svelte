<script lang="ts">
	import { browser } from '$app/environment';
	import { invalidate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';
	import ActivityIcon from '@lucide/svelte/icons/activity';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import Clock3Icon from '@lucide/svelte/icons/clock-3';
	import FlaskConicalIcon from '@lucide/svelte/icons/flask-conical';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import ScaleIcon from '@lucide/svelte/icons/scale';
	import PageHeaderConfig from '$lib/components/app/page-header-config.svelte';
	import type { AppPageHeaderAction } from '$lib/components/app/page-header';
	import { BATCH_STATUS_LABELS, BATCH_STATUS_ORDER } from '$lib/batches/config';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';

	let { data }: { data: PageData } = $props();
	let refreshInFlight = $state(false);
	let liveNow = $state(Date.now());

	const dateFormatter = new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
	const timeFormatter = new Intl.DateTimeFormat(undefined, {
		hour: 'numeric',
		minute: '2-digit'
	});
	const overviewHeaderActions: AppPageHeaderAction[] = [
		{ label: 'New recipe', href: resolve('/app/recipes/new'), variant: 'default' },
		{ label: 'Start batch', href: resolve('/app/batches'), variant: 'outline' },
		{ label: 'Ingredients', href: resolve('/app/ingredients'), variant: 'outline' },
		{ label: 'Equipment', href: resolve('/app/equipment'), variant: 'outline' }
	];

	type SummaryRoute = '/app/recipes' | '/app/batches' | '/app/ingredients' | '/app/equipment';

	const summaryCards = $derived([
		{
			title: 'Recipes',
			value: data.recipeCount,
			description: 'Build and organize formulations ready for brew day.',
			route: '/app/recipes' as SummaryRoute,
			linkLabel: 'Open recipes',
			icon: BookOpenIcon
		},
		{
			title: 'Batches',
			value: data.batchCount,
			description: 'Track active brews from draft through packaging.',
			route: '/app/batches' as SummaryRoute,
			linkLabel: 'Open batches',
			icon: ActivityIcon
		},
		{
			title: 'Ingredients',
			value: data.ingredientCount,
			description: 'Keep fermentables, hops, yeasts, and misc additions ready to reuse.',
			route: '/app/ingredients' as SummaryRoute,
			linkLabel: 'Open ingredients',
			icon: FlaskConicalIcon
		},
		{
			title: 'Equipment',
			value: data.equipmentCount,
			description: 'Maintain brew house profiles for sizing, losses, and defaults.',
			route: '/app/equipment' as SummaryRoute,
			linkLabel: 'Open equipment',
			icon: ScaleIcon
		}
	]);

	const statusCards = $derived(
		BATCH_STATUS_ORDER.map((status) => ({
			status,
			label: BATCH_STATUS_LABELS[status],
			count: data.batchStatusCounts[status]
		}))
	);

	const liveSyncLabel = $derived.by(() => {
		const secondsAgo = Math.max(0, Math.floor((liveNow - data.fetchedAt.getTime()) / 1000));

		if (secondsAgo < 10) {
			return 'Updated just now';
		}

		if (secondsAgo < 60) {
			return `Updated ${secondsAgo}s ago`;
		}

		const minutesAgo = Math.floor(secondsAgo / 60);
		return `Updated ${minutesAgo}m ago`;
	});

	$effect(() => {
		if (!browser) return;

		const syncClockId = window.setInterval(() => {
			liveNow = Date.now();
		}, 1000);

		const refreshId = window.setInterval(() => {
			refreshInFlight = true;
			void invalidate('app:overview').finally(() => {
				refreshInFlight = false;
				liveNow = Date.now();
			});
		}, 15000);

		return () => {
			window.clearInterval(syncClockId);
			window.clearInterval(refreshId);
		};
	});
</script>

<div class="space-y-8">
	<PageHeaderConfig
		eyebrow="Workspace"
		title="Overview"
		description="Manage recipes, batches, ingredients, and equipment from one brewing workspace."
		actions={overviewHeaderActions}
	/>

	<section class="rounded-3xl border border-border/70 bg-card/95 p-6 shadow-sm">
		<div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
			<div class="space-y-2">
				<div class="flex flex-wrap items-center gap-2">
					<h2 class="text-2xl font-black tracking-tight">Live batch overview</h2>
					<Badge variant="secondary" class="rounded-full px-3 py-1">
						{data.activeBatchCount} active
					</Badge>
				</div>
				<p class="max-w-2xl text-sm leading-6 text-muted-foreground">
					This view refreshes automatically so the top of the workspace stays current as batches
					move through brewing and fermentation.
				</p>
			</div>

			<div class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
				<div class="flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5">
					<Clock3Icon class="size-4" />
					<span>{liveSyncLabel}</span>
				</div>
				<div class="flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5">
					<RefreshCwIcon class={`size-4 ${refreshInFlight ? 'animate-spin' : ''}`} />
					<span>Auto-refresh every 15s</span>
				</div>
			</div>
		</div>

		<div class="mt-6 grid gap-4 xl:grid-cols-4">
			{#if data.activeBatches.length}
				{#each data.activeBatches as batch (batch.id)}
					<a
						href={resolve(`/app/batches/${batch.id}`)}
						class="block rounded-2xl border border-border/70 bg-background/70 p-4 transition hover:border-primary/30 hover:bg-accent/20"
					>
						<div class="flex items-start justify-between gap-3">
							<div class="space-y-1">
								<p class="font-semibold">{batch.recipeName}</p>
								<p class="text-sm text-muted-foreground">
									{batch.equipmentName || 'Default equipment'}
								</p>
							</div>
							<Badge>{BATCH_STATUS_LABELS[batch.status]}</Badge>
						</div>
						<div class="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-1">
							<div>
								<p class="text-xs tracking-[0.18em] text-muted-foreground uppercase">Brew day</p>
								<p class="mt-1">
									{batch.brewDate ? dateFormatter.format(batch.brewDate) : 'Not scheduled'}
								</p>
							</div>
							<div>
								<p class="text-xs tracking-[0.18em] text-muted-foreground uppercase">Last update</p>
								<p class="mt-1">{timeFormatter.format(batch.updatedAt)}</p>
							</div>
						</div>
					</a>
				{/each}
			{:else}
				<div class="rounded-2xl border border-dashed p-6 xl:col-span-4">
					<p class="font-medium">No active batches right now</p>
					<p class="mt-1 text-sm text-muted-foreground">
						Start a batch to see live brewing progress surface here automatically.
					</p>
				</div>
			{/if}
		</div>
	</section>

	<section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
		{#each summaryCards as item (item.title)}
			<a href={resolve(item.route)} class="group block">
				<Card
					class="h-full border-border/70 bg-card/95 transition hover:border-primary/30 hover:bg-accent/20"
				>
					<CardContent class="flex h-full flex-col gap-5 p-5">
						<div class="flex items-start justify-between gap-4">
							<div class="space-y-2">
								<p class="text-sm font-medium text-muted-foreground">{item.title}</p>
								<p class="text-3xl font-black tracking-tight">{item.value}</p>
							</div>
							<div class="rounded-2xl border bg-background/80 p-3 text-foreground/80">
								<item.icon class="size-5" />
							</div>
						</div>
						<p class="text-sm leading-6 text-muted-foreground">{item.description}</p>
						<div class="mt-auto flex items-center gap-2 text-sm font-medium">
							<span>{item.linkLabel}</span>
							<ArrowRightIcon class="size-4 transition group-hover:translate-x-0.5" />
						</div>
					</CardContent>
				</Card>
			</a>
		{/each}
	</section>

	<section class="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
		<div class="grid gap-6">
			<Card class="border-border/70 bg-card/95">
				<CardHeader class="flex flex-row items-start justify-between gap-4">
					<div class="space-y-1">
						<CardTitle class="text-2xl font-bold">Recent recipes</CardTitle>
						<CardDescription
							>Open formulations, review targets, or continue refining your library.</CardDescription
						>
					</div>
					<Button href={resolve('/app/recipes')} variant="ghost" size="sm">All recipes</Button>
				</CardHeader>
				<CardContent class="space-y-3">
					{#if data.recentRecipes.length}
						{#each data.recentRecipes as recipe (recipe.id)}
							<a
								href={resolve(`/app/recipes/${recipe.id}`)}
								class="block rounded-2xl border border-border/70 bg-background/60 p-4 transition hover:bg-accent/30"
							>
								<div class="flex items-start justify-between gap-3">
									<div class="space-y-1">
										<p class="font-semibold">{recipe.name}</p>
										<p class="text-sm text-muted-foreground">
											{recipe.style || 'Style not set'} • {recipe.targetBatchSizeL} L target
										</p>
										<p class="text-xs text-muted-foreground">
											{recipe.notes || 'Ready to review ingredients, targets, and brew settings.'}
										</p>
									</div>
									<Badge variant={recipe.advancedMode ? 'default' : 'secondary'}>
										{recipe.advancedMode ? 'Advanced' : 'Standard'}
									</Badge>
								</div>
							</a>
						{/each}
					{:else}
						<div class="rounded-2xl border border-dashed p-6">
							<p class="font-medium">No recipes yet</p>
							<p class="mt-1 text-sm text-muted-foreground">
								Create a recipe to start building your brew library.
							</p>
						</div>
					{/if}
				</CardContent>
			</Card>

			<Card class="border-border/70 bg-card/95">
				<CardHeader class="flex flex-row items-start justify-between gap-4">
					<div class="space-y-1">
						<CardTitle class="text-2xl font-bold">Recent batches</CardTitle>
						<CardDescription
							>Check current brew progress and jump back into active logs quickly.</CardDescription
						>
					</div>
					<Button href={resolve('/app/batches')} variant="ghost" size="sm">All batches</Button>
				</CardHeader>
				<CardContent class="space-y-3">
					{#if data.recentBatches.length}
						{#each data.recentBatches as batch (batch.id)}
							<a
								href={resolve(`/app/batches/${batch.id}`)}
								class="block rounded-2xl border border-border/70 bg-background/60 p-4 transition hover:bg-accent/30"
							>
								<div class="flex items-start justify-between gap-3">
									<div class="space-y-1">
										<p class="font-semibold">{batch.recipeName}</p>
										<p class="text-sm text-muted-foreground">
											{batch.equipmentName || 'Default equipment'} • {batch.brewDate
												? dateFormatter.format(batch.brewDate)
												: 'Date not set'}
										</p>
										<p class="text-xs text-muted-foreground">
											{batch.notes || 'Open this batch to update log notes, timing, and progress.'}
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
								Start a batch from one of your saved recipes when you are ready to brew.
							</p>
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>

		<div class="grid gap-6">
			<Card class="border-border/70 bg-card/95">
				<CardHeader class="space-y-1">
					<CardTitle class="text-2xl font-bold">Batch status</CardTitle>
					<CardDescription
						>See how your brew log is distributed across the production flow.</CardDescription
					>
				</CardHeader>
				<CardContent class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
					{#each statusCards as item (item.status)}
						<div
							class="flex items-center justify-between rounded-2xl border border-border/70 bg-background/60 px-4 py-3"
						>
							<div>
								<p class="font-medium">{item.label}</p>
								<p class="text-xs text-muted-foreground">Tracked batches in this stage</p>
							</div>
							<div class="text-2xl font-black tracking-tight">{item.count}</div>
						</div>
					{/each}
				</CardContent>
			</Card>

			<Card class="border-border/70 bg-card/95">
				<CardHeader class="flex flex-row items-start justify-between gap-4">
					<div class="space-y-1">
						<CardTitle class="text-2xl font-bold">Recent equipment</CardTitle>
						<CardDescription>Keep sizing, losses, and default setups close at hand.</CardDescription
						>
					</div>
					<Button href={resolve('/app/equipment')} variant="ghost" size="sm">All equipment</Button>
				</CardHeader>
				<CardContent class="space-y-3">
					{#if data.recentEquipment.length}
						{#each data.recentEquipment as profile (profile.id)}
							<a
								href={resolve(`/app/equipment/${profile.id}`)}
								class="block rounded-2xl border border-border/70 bg-background/60 p-4 transition hover:bg-accent/30"
							>
								<div class="flex items-start justify-between gap-3">
									<div class="space-y-1">
										<p class="font-semibold">{profile.name}</p>
										<p class="text-sm text-muted-foreground">
											{profile.batchSizeL} L batch • {profile.boilOffRateLph} L/h boil-off
										</p>
										<p class="text-xs text-muted-foreground">
											{profile.description ||
												'Open this profile to review efficiency, losses, and defaults.'}
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
							<p class="mt-1 text-sm text-muted-foreground">
								Add a profile so recipes and batches have realistic brewing defaults.
							</p>
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>
	</section>
</div>
