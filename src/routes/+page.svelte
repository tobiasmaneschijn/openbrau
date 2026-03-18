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
	import * as m from '$lib/paraglide/messages';

	let { data }: { data: PageData } = $props();

	const sampleBatchVolume = formatVolume(20, 'imperial');
	const sampleFermentationTemp = formatTemperature(19, 'imperial');
</script>

<svelte:head>
	<title>{m.app_name()}</title>
	<meta name="description" content={m.landing_description()} />
</svelte:head>

<div
	class="min-h-screen bg-[radial-gradient(circle_at_top,rgba(197,153,82,0.18),transparent_30%),linear-gradient(180deg,#faf9f4_0%,#f3ede0_100%)] px-6 py-16"
>
	<div class="mx-auto max-w-7xl space-y-8">
		<section class="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
			<Card class="border-border/70 bg-card/90 shadow-xl backdrop-blur">
				<CardHeader class="space-y-5">
					<Badge
						variant="secondary"
						class="w-fit rounded-full px-3 py-1 tracking-[0.18em] uppercase"
					>
						{m.app_name()}
					</Badge>
					<CardTitle class="max-w-3xl text-5xl leading-tight font-black sm:text-6xl">
						{m.recipes_process_planning()}
					</CardTitle>
					<CardDescription class="max-w-2xl text-base leading-7">
						{m.landing_description()}
					</CardDescription>
				</CardHeader>
				<CardContent class="flex flex-wrap gap-3">
					<Button href={resolve(data.user ? '/app' : '/login')}>
						{data.user ? m.open_workspace() : m.sign_in_locally()}
					</Button>
					<Button href={resolve(data.user ? '/app/recipes' : '/login')} variant="outline">
						{m.explore_recipe_flow()}
					</Button>
				</CardContent>
			</Card>

			<Card class="border-border/70 bg-sidebar/95 shadow-xl">
				<CardHeader>
					<CardTitle class="text-2xl font-bold">{m.display_layer_conversions()}</CardTitle>
					<CardDescription>{m.display_layer_conversions_description()}</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="flex items-start gap-4 rounded-2xl border p-4">
						<GaugeIcon class="mt-1 size-5 text-primary" />
						<div>
							<p class="font-medium">{m.batch_size()}</p>
							<p class="text-sm text-muted-foreground">
								{m.stored_as({ value: '20.0 L', display: sampleBatchVolume })}
							</p>
						</div>
					</div>
					<div class="flex items-start gap-4 rounded-2xl border p-4">
						<ThermometerIcon class="mt-1 size-5 text-primary" />
						<div>
							<p class="font-medium">{m.fermentation_target()}</p>
							<p class="text-sm text-muted-foreground">
								{m.stored_as({ value: '19.0 C', display: sampleFermentationTemp })}
							</p>
						</div>
					</div>
					<div class="flex items-start gap-4 rounded-2xl border p-4">
						<BeakerIcon class="mt-1 size-5 text-primary" />
						<div>
							<p class="font-medium">{m.phase_1_scope()}</p>
							<p class="text-sm text-muted-foreground">{m.local_auth_description()}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</section>
	</div>
</div>
