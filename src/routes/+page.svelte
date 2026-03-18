<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';
	import BeakerIcon from '@lucide/svelte/icons/beaker';
	import GaugeIcon from '@lucide/svelte/icons/gauge';
	import ThermometerIcon from '@lucide/svelte/icons/thermometer';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { formatTemperature, formatVolume } from '$lib/units';

	let { data }: { data: PageData } = $props();

	const sampleBatchVolume = formatVolume(20, 'imperial');
	const sampleFermentationTemp = formatTemperature(19, 'imperial');
</script>

<svelte:head>
	<title>OpenBrau</title>
	<meta
		name="description"
		content="Self-hosted beverage production management with reactive recipe design, telemetry, and metric-first data modeling."
	/>
</svelte:head>

<div
	class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(197,153,82,0.18),_transparent_30%),linear-gradient(180deg,_#faf9f4_0%,_#f3ede0_100%)] px-6 py-16"
>
	<div class="mx-auto max-w-7xl space-y-8">
		<section class="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
			<Card class="border-border/70 bg-card/90 shadow-xl backdrop-blur">
				<CardHeader class="space-y-5">
					<Badge
						variant="secondary"
						class="w-fit rounded-full px-3 py-1 tracking-[0.18em] uppercase"
					>
						OpenBrau
					</Badge>
					<CardTitle class="max-w-3xl text-5xl leading-tight font-black sm:text-6xl">
						A cleaner production workspace for fermented and crafted beverages.
					</CardTitle>
					<CardDescription class="max-w-2xl text-base leading-7">
						Design recipes, manage process profiles, and keep storage in liters, kilograms, celsius,
						and minutes while rendering the UI in the units your team prefers.
					</CardDescription>
				</CardHeader>
				<CardContent class="flex flex-wrap gap-3">
					<Button href={resolve(data.user ? '/app' : '/login')}>
						{data.user ? 'Open workspace' : 'Sign in locally'}
					</Button>
					<Button href={resolve(data.user ? '/app/recipes' : '/login')} variant="outline">
						Explore the recipe flow
					</Button>
				</CardContent>
			</Card>

			<Card class="border-border/70 bg-sidebar/95 shadow-xl">
				<CardHeader>
					<CardTitle class="text-2xl font-bold">Display-layer conversions</CardTitle>
					<CardDescription>
						Examples of metric-first storage rendered for an imperial operator.
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="flex items-start gap-4 rounded-2xl border p-4">
						<GaugeIcon class="mt-1 size-5 text-primary" />
						<div>
							<p class="font-medium">Batch size</p>
							<p class="text-sm text-muted-foreground">
								Stored as 20.0 L, shown as {sampleBatchVolume}
							</p>
						</div>
					</div>
					<div class="flex items-start gap-4 rounded-2xl border p-4">
						<ThermometerIcon class="mt-1 size-5 text-primary" />
						<div>
							<p class="font-medium">Fermentation target</p>
							<p class="text-sm text-muted-foreground">
								Stored as 19.0 deg C, shown as {sampleFermentationTemp}
							</p>
						</div>
					</div>
					<div class="flex items-start gap-4 rounded-2xl border p-4">
						<BeakerIcon class="mt-1 size-5 text-primary" />
						<div>
							<p class="font-medium">Phase 1 scope</p>
							<p class="text-sm text-muted-foreground">
								Local auth, protected workspace, recipes, equipment, and starter process math.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</section>
	</div>
</div>
