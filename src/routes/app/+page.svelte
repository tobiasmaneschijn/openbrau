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
	import type { AppPageHeaderAction } from '$lib/components/app/page-header';
	import PageHeaderConfig from '$lib/components/app/page-header-config.svelte';
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
	import * as m from '$lib/paraglide/messages';
	import { createDateFormatter, readUserSettings } from '$lib/settings';

	let { data }: { data: PageData } = $props();
	let refreshInFlight = $state(false);
	let liveNow = $state(Date.now());
	const settings = $derived(readUserSettings(data.user?.preferences));
	const uiLocale = $derived(settings.language as 'en' | 'da');

	const dateFormatter = $derived(
		createDateFormatter(settings, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		})
	);
	const timeFormatter = $derived(
		createDateFormatter(settings, {
			hour: 'numeric',
			minute: '2-digit'
		})
	);

	const overviewHeaderActions = $derived.by(
		() =>
			[
				{
					label: m.new_recipe({}, { locale: uiLocale }),
					href: resolve('/app/recipes/new'),
					variant: 'default'
				},
				{
					label: m.start_batch({}, { locale: uiLocale }),
					href: resolve('/app/batches'),
					variant: 'outline'
				},
				{
					label: m.ingredients({}, { locale: uiLocale }),
					href: resolve('/app/ingredients'),
					variant: 'outline'
				},
				{
					label: m.equipment({}, { locale: uiLocale }),
					href: resolve('/app/equipment'),
					variant: 'outline'
				}
			] satisfies AppPageHeaderAction[]
	);

	type SummaryRoute = '/app/recipes' | '/app/batches' | '/app/ingredients' | '/app/equipment';

	const summaryCards = $derived([
		{
			title: m.recipes(),
			value: data.recipeCount,
			description: m.summary_recipes_description(),
			route: '/app/recipes' as SummaryRoute,
			linkLabel: m.open_recipes(),
			icon: BookOpenIcon
		},
		{
			title: m.batches(),
			value: data.batchCount,
			description: m.summary_batches_description(),
			route: '/app/batches' as SummaryRoute,
			linkLabel: m.open_batches(),
			icon: ActivityIcon
		},
		{
			title: m.ingredients(),
			value: data.ingredientCount,
			description: m.summary_ingredients_description(),
			route: '/app/ingredients' as SummaryRoute,
			linkLabel: m.open_ingredients(),
			icon: FlaskConicalIcon
		},
		{
			title: m.equipment(),
			value: data.equipmentCount,
			description: m.summary_equipment_description(),
			route: '/app/equipment' as SummaryRoute,
			linkLabel: m.open_equipment(),
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
			return m.updated_just_now();
		}

		if (secondsAgo < 60) {
			return m.updated_seconds_ago({ count: secondsAgo });
		}

		return m.updated_minutes_ago({ count: Math.floor(secondsAgo / 60) });
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
		eyebrow={m.app_workspace({}, { locale: uiLocale })}
		title={m.overview({}, { locale: uiLocale })}
		description={m.workspace_overview_description({}, { locale: uiLocale })}
		actions={overviewHeaderActions}
	/>

	<section class="rounded-3xl border border-border/70 bg-card/95 p-6 shadow-sm">
		<div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
			<div class="space-y-2">
				<div class="flex flex-wrap items-center gap-2">
					<h2 class="text-2xl font-black tracking-tight">{m.live_batch_overview()}</h2>
					<Badge variant="secondary" class="rounded-full px-3 py-1">
						{m.active()}
						{data.activeBatchCount}
					</Badge>
				</div>
				<p class="max-w-2xl text-sm leading-6 text-muted-foreground">
					{m.live_batch_overview_description()}
				</p>
			</div>

			<div class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
				<div class="flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5">
					<Clock3Icon class="size-4" />
					<span>{liveSyncLabel}</span>
				</div>
				<div class="flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5">
					<RefreshCwIcon class={`size-4 ${refreshInFlight ? 'animate-spin' : ''}`} />
					<span>{m.auto_refresh_every_15s()}</span>
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
									{batch.equipmentName || m.default_equipment()}
								</p>
							</div>
							<Badge>{BATCH_STATUS_LABELS[batch.status]}</Badge>
						</div>
						<div class="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-1">
							<div>
								<p class="text-xs tracking-[0.18em] text-muted-foreground uppercase">
									{m.brew_day()}
								</p>
								<p class="mt-1">
									{batch.brewDate ? dateFormatter.format(batch.brewDate) : m.not_scheduled()}
								</p>
							</div>
							<div>
								<p class="text-xs tracking-[0.18em] text-muted-foreground uppercase">
									{m.last_update()}
								</p>
								<p class="mt-1">{timeFormatter.format(batch.updatedAt)}</p>
							</div>
						</div>
					</a>
				{/each}
			{:else}
				<div class="rounded-2xl border border-dashed p-6 xl:col-span-4">
					<p class="font-medium">{m.no_active_batches_right_now()}</p>
					<p class="mt-1 text-sm text-muted-foreground">
						{m.start_a_batch_to_see_live_brewing_progress()}
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
						<CardTitle class="text-2xl font-bold">{m.recent_recipes()}</CardTitle>
						<CardDescription>{m.summary_recipes_description()}</CardDescription>
					</div>
					<Button href={resolve('/app/recipes')} variant="ghost" size="sm">{m.all_recipes()}</Button
					>
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
											{recipe.style || m.style_not_set()} • {recipe.targetBatchSizeL} L target
										</p>
										<p class="text-xs text-muted-foreground">
											{recipe.notes || m.ready_to_review_ingredients_targets_and_brew_settings()}
										</p>
									</div>
									<Badge variant={recipe.advancedMode ? 'default' : 'secondary'}>
										{recipe.advancedMode ? m.advanced() : m.standard()}
									</Badge>
								</div>
							</a>
						{/each}
					{:else}
						<div class="rounded-2xl border border-dashed p-6">
							<p class="font-medium">{m.no_recipes_yet()}</p>
							<p class="mt-1 text-sm text-muted-foreground">{m.create_first_recipe()}</p>
						</div>
					{/if}
				</CardContent>
			</Card>

			<Card class="border-border/70 bg-card/95">
				<CardHeader class="flex flex-row items-start justify-between gap-4">
					<div class="space-y-1">
						<CardTitle class="text-2xl font-bold">{m.recent_batches()}</CardTitle>
						<CardDescription>{m.summary_batches_description()}</CardDescription>
					</div>
					<Button href={resolve('/app/batches')} variant="ghost" size="sm">{m.all_batches()}</Button
					>
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
											{batch.equipmentName || m.default_equipment()} • {batch.brewDate
												? dateFormatter.format(batch.brewDate)
												: m.date_not_set()}
										</p>
										<p class="text-xs text-muted-foreground">
											{batch.notes || m.open_this_batch_to_update_log_notes_timing_and_progress()}
										</p>
									</div>
									<Badge>{BATCH_STATUS_LABELS[batch.status]}</Badge>
								</div>
							</a>
						{/each}
					{:else}
						<div class="rounded-2xl border border-dashed p-6">
							<p class="font-medium">{m.no_batches_yet()}</p>
							<p class="mt-1 text-sm text-muted-foreground">
								{m.start_a_batch_from_one_of_your_saved_recipes()}
							</p>
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>

		<div class="grid gap-6">
			<Card class="border-border/70 bg-card/95">
				<CardHeader class="space-y-1">
					<CardTitle class="text-2xl font-bold">{m.batch_status()}</CardTitle>
					<CardDescription>{m.summary_batches_description()}</CardDescription>
				</CardHeader>
				<CardContent class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
					{#each statusCards as item (item.status)}
						<div
							class="flex items-center justify-between rounded-2xl border border-border/70 bg-background/60 px-4 py-3"
						>
							<div>
								<p class="font-medium">{item.label}</p>
								<p class="text-xs text-muted-foreground">{m.tracked_batches_in_this_stage()}</p>
							</div>
							<div class="text-2xl font-black tracking-tight">{item.count}</div>
						</div>
					{/each}
				</CardContent>
			</Card>

			<Card class="border-border/70 bg-card/95">
				<CardHeader class="flex flex-row items-start justify-between gap-4">
					<div class="space-y-1">
						<CardTitle class="text-2xl font-bold">{m.recent_equipment()}</CardTitle>
						<CardDescription>{m.summary_equipment_description()}</CardDescription>
					</div>
					<Button href={resolve('/app/equipment')} variant="ghost" size="sm"
						>{m.all_equipment()}</Button
					>
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
												m.open_this_profile_to_review_efficiency_losses_and_defaults()}
										</p>
									</div>
									{#if profile.isDefault}
										<Badge>{m.default_label()}</Badge>
									{/if}
								</div>
							</a>
						{/each}
					{:else}
						<div class="rounded-2xl border border-dashed p-6">
							<p class="font-medium">{m.no_equipment_profiles_yet()}</p>
							<p class="mt-1 text-sm text-muted-foreground">
								{m.add_a_profile_so_recipes_and_batches_have_realistic_brewing_defaults()}
							</p>
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>
	</section>
</div>
