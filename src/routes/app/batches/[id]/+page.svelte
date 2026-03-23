<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';
	import type { AppPageHeaderAction } from '$lib/components/app/page-header';
	import PageHeaderConfig from '$lib/components/app/page-header-config.svelte';
	import { BATCH_STATUS_LABELS } from '$lib/batches/config';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as m from '$lib/paraglide/messages';
	import { createDateFormatter, createNumberFormatter, readUserSettings } from '$lib/settings';
	import { formatTemperature, formatVolume } from '$lib/units';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const settings = $derived(readUserSettings(data.user?.preferences));
	const numberFormatter = $derived(createNumberFormatter(settings, { maximumFractionDigits: 1 }));
	const dateFormatter = $derived(
		createDateFormatter(settings, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		})
	);
	const dateTimeFormatter = $derived(
		createDateFormatter(settings, {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		})
	);

	const batchDetailHeaderActions = $derived([
		{ label: m.back(), href: resolve('/app/batches'), variant: 'outline' },
		{ label: m.save_log(), type: 'submit', form: 'batch-log-form', variant: 'default' }
	] satisfies AppPageHeaderAction[]);

	function formatGravity(value: number | null) {
		return value == null ? '--' : value.toFixed(3);
	}

	function formatPercent(value: number | null, digits = 1) {
		return value == null ? '--' : `${value.toFixed(digits)}%`;
	}

	function formatTemp(value: number | null) {
		if (value == null) {
			return '--';
		}

		return formatTemperature(
			value,
			settings.units,
			numberFormatter.resolvedOptions().locale,
			1
		).replace('Â°', '°');
	}

	function formatBatchVolume(value: string | null) {
		if (!value) {
			return '--';
		}

		return formatVolume(Number(value), settings.units, numberFormatter.resolvedOptions().locale, 1);
	}

	function trendArrow(trend: 'up' | 'down' | 'steady') {
		if (trend === 'up') return '↑';
		if (trend === 'down') return '↓';
		return '→';
	}

	type ChartPoint = (typeof data.dashboard.chart.points)[number];

	function chartPath(points: ChartPoint[], key: 'gravity' | 'temperatureC') {
		const usable = points.filter((point) => point[key] != null);
		if (usable.length === 0) {
			return '';
		}

		const values = usable.map((point) => point[key] as number);
		const min = Math.min(...values);
		const max = Math.max(...values);
		const span = max - min || 1;
		const width = 520;
		const height = 220;

		return usable
			.map((point, index) => {
				const x = usable.length === 1 ? width / 2 : (index / (usable.length - 1)) * width;
				const y = height - (((point[key] as number) - min) / span) * height;
				return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
			})
			.join(' ');
	}

	const gravityPath = $derived(chartPath(data.dashboard.chart.points, 'gravity'));
	const temperaturePath = $derived(chartPath(data.dashboard.chart.points, 'temperatureC'));
</script>

<div class="space-y-6">
	<PageHeaderConfig
		eyebrow={m.batches()}
		title={data.batch.recipeName}
		description={`${data.dashboard.hero.statusLabel} dashboard`}
		meta={`${data.batch.telemetry.length} ${m.readings()}`}
		actions={batchDetailHeaderActions}
	/>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>{m.could_not_update_batch()}</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<Card class="overflow-hidden border-border/70 bg-card/95 shadow-sm">
		<CardContent class="space-y-6 p-6">
			<div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
				<div class="space-y-3">
					<div class="flex flex-wrap items-center gap-3">
						<h2 class="text-3xl font-black tracking-tight">{data.batch.recipeName}</h2>
						<Badge class="rounded-full px-3 py-1">{data.dashboard.hero.statusLabel}</Badge>
						<Badge variant="outline" class="rounded-full px-3 py-1"
							>{data.dashboard.hero.dayLabel}</Badge
						>
					</div>
					<div class="space-y-1 text-sm text-muted-foreground">
						<p>
							<span class="font-medium text-foreground">Recipe step:</span>
							{data.dashboard.hero.recipeStep}
						</p>
						<p>
							<span class="font-medium text-foreground">Next action:</span>
							{data.dashboard.hero.nextAction}
						</p>
					</div>
				</div>

				<div class="flex flex-wrap gap-2">
					<Button href="#add-reading">{m.add_reading()}</Button>
					<Button href="#brew-log" variant="outline">{m.batch_notes()}</Button>
					<Button href="#phase-control" variant="outline">Move phase</Button>
				</div>
			</div>

			<div class="grid gap-4 md:grid-cols-3">
				<div class="rounded-2xl border bg-background/80 p-4">
					<p class="text-xs tracking-[0.18em] text-muted-foreground uppercase">
						{m.gravity_label()}
					</p>
					<p class="mt-2 text-3xl font-black">
						{formatGravity(data.dashboard.metrics.currentGravity)}
						<span class="ml-2 text-lg text-muted-foreground">
							{trendArrow(data.dashboard.metrics.gravityTrend)}
						</span>
					</p>
				</div>
				<div class="rounded-2xl border bg-background/80 p-4">
					<p class="text-xs tracking-[0.18em] text-muted-foreground uppercase">Temp</p>
					<p class="mt-2 text-3xl font-black">
						{formatTemp(data.dashboard.metrics.currentTemperatureC)}
						<span class="ml-2 text-lg text-muted-foreground">
							{trendArrow(data.dashboard.metrics.temperatureTrend)}
						</span>
					</p>
				</div>
				<div class="rounded-2xl border bg-background/80 p-4">
					<p class="text-xs tracking-[0.18em] text-muted-foreground uppercase">
						{m.estimated_abv()}
					</p>
					<p class="mt-2 text-3xl font-black">
						{formatPercent(data.dashboard.metrics.estimatedAbvPct, 1)}
					</p>
				</div>
			</div>

			<div class="space-y-2">
				<div class="flex items-center justify-between text-sm">
					<span class="text-muted-foreground">Progress</span>
					<span class="font-medium">{data.dashboard.hero.progressPct}%</span>
				</div>
				<div class="h-3 overflow-hidden rounded-full bg-accent/60">
					<div
						class="h-full rounded-full bg-primary transition-[width]"
						style={`width: ${data.dashboard.hero.progressPct}%`}
					></div>
				</div>
			</div>
		</CardContent>
	</Card>

	<Card id="phase-control" class="border-border/70 bg-card/95 shadow-sm">
		<CardHeader>
			<CardTitle class="text-xl font-bold">Phase control</CardTitle>
			<CardDescription>
				Move forward, move backward, or jump directly when advanced mode is enabled.
			</CardDescription>
		</CardHeader>
		<CardContent class="space-y-5">
			<div class="grid gap-3 md:grid-cols-5">
				{#each data.dashboard.phaseProgress as phase (phase.status)}
					<div
						class={`rounded-2xl border px-4 py-3 text-sm ${
							phase.state === 'current'
								? 'border-primary bg-primary text-primary-foreground'
								: phase.state === 'complete'
									? 'border-border bg-accent/50'
									: 'bg-background/80'
						}`}
					>
						<p class="font-medium">{phase.label}</p>
						<p class="mt-1 text-xs opacity-80">
							{phase.state === 'current'
								? 'Current'
								: phase.state === 'complete'
									? 'Complete'
									: 'Upcoming'}
						</p>
					</div>
				{/each}
			</div>

			<div class="flex flex-wrap gap-3">
				{#if data.previousStatus}
					<form method="POST" action="?/changeStatus">
						<input type="hidden" name="nextStatus" value={data.previousStatus} />
						<Button type="submit" variant="outline">
							← Move to {BATCH_STATUS_LABELS[data.previousStatus]}
						</Button>
					</form>
				{/if}

				{#if data.nextStatus}
					<form method="POST" action="?/changeStatus">
						<input type="hidden" name="nextStatus" value={data.nextStatus} />
						<Button type="submit">Move to {BATCH_STATUS_LABELS[data.nextStatus]} →</Button>
					</form>
				{/if}
			</div>

			{#if settings.advancedMode}
				<div class="space-y-3 rounded-2xl border border-dashed p-4">
					<div>
						<p class="font-medium">Advanced jump</p>
						<p class="text-sm text-muted-foreground">
							Use this if you need to recover from an incorrect phase change.
						</p>
					</div>
					<div class="flex flex-wrap gap-2">
						{#each data.availableStatuses as status (status)}
							{#if status !== data.batch.status}
								<form method="POST" action="?/changeStatus">
									<input type="hidden" name="nextStatus" value={status} />
									<Button type="submit" variant="outline" size="sm"
										>{BATCH_STATUS_LABELS[status]}</Button
									>
								</form>
							{/if}
						{/each}
					</div>
				</div>
			{/if}
		</CardContent>
	</Card>

	<div class="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_0.75fr]">
		<Card class="border-border/70 bg-card/95 shadow-sm">
			<CardHeader>
				<CardTitle class="text-xl font-bold">Fermentation graph</CardTitle>
				<CardDescription>Gravity over time with temperature overlay.</CardDescription>
			</CardHeader>
			<CardContent>
				{#if data.dashboard.chart.hasData}
					<div class="space-y-4">
						<div class="overflow-hidden rounded-2xl border bg-background/70 p-4">
							<svg viewBox="0 0 520 220" class="h-64 w-full">
								<line x1="0" y1="220" x2="520" y2="220" class="stroke-border" stroke-width="1"
								></line>
								<line x1="0" y1="0" x2="0" y2="220" class="stroke-border" stroke-width="1"></line>
								{#if gravityPath}
									<path
										d={gravityPath}
										fill="none"
										stroke="currentColor"
										stroke-width="3"
										class="text-primary"
									></path>
								{/if}
								{#if temperaturePath}
									<path
										d={temperaturePath}
										fill="none"
										stroke-width="3"
										stroke-dasharray="8 6"
										class="text-amber-500"
										stroke="currentColor"
									></path>
								{/if}
							</svg>
						</div>
						<div class="flex flex-wrap gap-4 text-sm text-muted-foreground">
							<span class="flex items-center gap-2">
								<span class="size-3 rounded-full bg-primary"></span>
								Gravity
							</span>
							<span class="flex items-center gap-2">
								<span class="size-3 rounded-full bg-amber-500"></span>
								Temperature
							</span>
						</div>
					</div>
				{:else}
					<div class="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">
						Add fermentation readings to build the gravity and temperature trend line.
					</div>
				{/if}
			</CardContent>
		</Card>

		<Card class="border-border/70 bg-card/95 shadow-sm">
			<CardHeader>
				<CardTitle class="text-xl font-bold">{m.batch_summary()}</CardTitle>
				<CardDescription>Target versus actual performance for this batch.</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid gap-3">
					<div
						class="flex items-center justify-between rounded-2xl border bg-background/80 px-4 py-3"
					>
						<span class="text-sm text-muted-foreground">OG</span>
						<span class="font-semibold"
							>{formatGravity(data.dashboard.summary.originalGravity)}</span
						>
					</div>
					<div
						class="flex items-center justify-between rounded-2xl border bg-background/80 px-4 py-3"
					>
						<span class="text-sm text-muted-foreground">FG target</span>
						<span class="font-semibold"
							>{formatGravity(data.dashboard.summary.targetFinalGravity)}</span
						>
					</div>
					<div
						class="flex items-center justify-between rounded-2xl border bg-background/80 px-4 py-3"
					>
						<span class="text-sm text-muted-foreground">FG current</span>
						<span class="font-semibold">{formatGravity(data.dashboard.summary.currentGravity)}</span
						>
					</div>
					<div
						class="flex items-center justify-between rounded-2xl border bg-background/80 px-4 py-3"
					>
						<span class="text-sm text-muted-foreground">ABV</span>
						<span class="font-semibold"
							>{formatPercent(data.dashboard.summary.estimatedAbvPct, 1)}</span
						>
					</div>
					<div
						class="flex items-center justify-between rounded-2xl border bg-background/80 px-4 py-3"
					>
						<span class="text-sm text-muted-foreground">Attenuation</span>
						<span class="font-semibold"
							>{formatPercent(data.dashboard.summary.attenuationPct, 1)}</span
						>
					</div>
					<div
						class="flex items-center justify-between rounded-2xl border bg-background/80 px-4 py-3"
					>
						<span class="text-sm text-muted-foreground">Days elapsed</span>
						<span class="font-semibold">{data.dashboard.summary.daysElapsed}</span>
					</div>
				</div>

				<div class="space-y-3 rounded-2xl border bg-background/70 p-4">
					<div class="flex items-center justify-between gap-3">
						<p class="font-medium">Alerts</p>
						<Badge variant="outline">{data.dashboard.alerts.length}</Badge>
					</div>
					{#if data.dashboard.alerts.length}
						<div class="space-y-2">
							{#each data.dashboard.alerts as alert (alert.id)}
								<div
									class={`rounded-xl border px-3 py-2 text-sm ${
										alert.tone === 'warning'
											? 'border-amber-300/50 bg-amber-50/70 text-amber-950'
											: 'bg-background text-muted-foreground'
									}`}
								>
									{alert.message}
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-muted-foreground">No active alerts. The batch looks on track.</p>
					{/if}
				</div>
			</CardContent>
		</Card>
	</div>

	<div class="grid gap-6 xl:grid-cols-2">
		<Card class="border-border/70 bg-card/95 shadow-sm">
			<CardHeader>
				<CardTitle class="text-xl font-bold">Do now</CardTitle>
				<CardDescription
					>Dynamic actions based on phase, recipe, and current readings.</CardDescription
				>
			</CardHeader>
			<CardContent>
				<div class="space-y-3">
					{#each data.dashboard.tasks as task (task.id)}
						<div
							class={`rounded-2xl border p-4 ${
								task.tone === 'warning' ? 'border-amber-300/50 bg-amber-50/70' : 'bg-background/80'
							}`}
						>
							<div class="flex items-start gap-3">
								<div class="pt-0.5 text-lg">{task.done ? '✓' : '□'}</div>
								<div>
									<p class="font-medium">{task.label}</p>
									<p class="mt-1 text-sm text-muted-foreground">{task.detail}</p>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</CardContent>
		</Card>

		<Card class="border-border/70 bg-card/95 shadow-sm">
			<CardHeader>
				<CardTitle class="text-xl font-bold">Recipe progress</CardTitle>
				<CardDescription>Where the batch sits against the planned execution flow.</CardDescription>
			</CardHeader>
			<CardContent class="space-y-5">
				<div class="space-y-3">
					{#each data.dashboard.phaseProgress as phase (phase.status)}
						<div
							class="flex items-center justify-between rounded-2xl border bg-background/80 px-4 py-3"
						>
							<div class="flex items-center gap-3">
								<span class="text-lg">
									{phase.state === 'complete' ? '✓' : phase.state === 'current' ? '●' : '○'}
								</span>
								<span class="font-medium">{phase.label}</span>
							</div>
							<span class="text-sm text-muted-foreground">
								{phase.state === 'complete'
									? 'Done'
									: phase.state === 'current'
										? 'Current'
										: 'Pending'}
							</span>
						</div>
					{/each}
				</div>

				<div class="rounded-2xl border bg-background/70 p-4">
					<p class="font-medium">Current tasks</p>
					<div class="mt-3 space-y-2 text-sm">
						{#each data.dashboard.tasks as task (task.id)}
							<div class="flex items-start gap-2">
								<span>{task.done ? '✓' : '□'}</span>
								<span>{task.label}</span>
							</div>
						{/each}
					</div>
				</div>
			</CardContent>
		</Card>
	</div>

	<Card class="border-border/70 bg-card/95 shadow-sm">
		<CardHeader class="flex flex-row items-start justify-between gap-4">
			<div>
				<CardTitle class="text-xl font-bold">Activity timeline</CardTitle>
				<CardDescription>Readings, notes, and phase changes in one place.</CardDescription>
			</div>
			<Button href="#add-reading" variant="outline">{m.add_reading()}</Button>
		</CardHeader>
		<CardContent>
			{#if data.dashboard.timeline.length}
				<div class="space-y-3">
					{#each data.dashboard.timeline as item (item.id)}
						<div class="rounded-2xl border bg-background/80 p-4">
							<div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
								<div>
									<p class="font-medium">{item.title}</p>
									<p class="mt-1 text-sm text-muted-foreground">{item.detail}</p>
								</div>
								<p class="text-sm text-muted-foreground">{dateTimeFormatter.format(item.at)}</p>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
					Activity will start to appear here once readings or phase updates are logged.
				</div>
			{/if}
		</CardContent>
	</Card>

	<div class="space-y-4">
		<details class="rounded-3xl border border-border/70 bg-card/95 p-5 shadow-sm" open>
			<summary class="cursor-pointer list-none text-lg font-bold">Brew log</summary>
			<div class="mt-5">
				<form id="batch-log-form" method="POST" action="?/saveLog" class="space-y-4">
					<div class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<label for="brewDate" class="text-sm font-medium">{m.brew_date()}</label>
							<Input
								id="brewDate"
								name="brewDate"
								type="date"
								value={data.batch.brewDate ? data.batch.brewDate.toISOString().slice(0, 10) : ''}
							/>
						</div>
						<div class="space-y-2">
							<label for="actualBatchSizeL" class="text-sm font-medium"
								>{m.batch_size_label()} (L)</label
							>
							<Input
								id="actualBatchSizeL"
								name="actualBatchSizeL"
								type="number"
								step="0.001"
								value={data.batch.actualBatchSizeL ?? ''}
							/>
						</div>
					</div>
					<div class="rounded-2xl border bg-background/70 px-4 py-3 text-sm text-muted-foreground">
						Current batch size: {formatBatchVolume(data.batch.actualBatchSizeL)}
					</div>
					<div id="brew-log" class="space-y-2">
						<label for="notes" class="text-sm font-medium">{m.batch_notes()}</label>
						<Textarea id="notes" name="notes" rows={6} value={data.batch.notes ?? ''} />
					</div>
				</form>
			</div>
		</details>

		<details class="rounded-3xl border border-border/70 bg-card/95 p-5 shadow-sm" open>
			<summary class="cursor-pointer list-none text-lg font-bold">Fermentation readings</summary>
			<div class="mt-5 space-y-6">
				<form
					id="add-reading"
					method="POST"
					action="?/addTelemetry"
					class="grid gap-4 md:grid-cols-2"
				>
					<div class="space-y-2">
						<label for="recordedAt" class="text-sm font-medium">{m.recorded_at()}</label>
						<Input id="recordedAt" name="recordedAt" type="datetime-local" />
					</div>
					<div class="space-y-2">
						<label for="gravity" class="text-sm font-medium">{m.gravity_label()}</label>
						<Input id="gravity" name="gravity" type="number" step="0.001" />
					</div>
					<div class="space-y-2">
						<label for="temperatureC" class="text-sm font-medium">Temperature (°C)</label>
						<Input id="temperatureC" name="temperatureC" type="number" step="0.01" />
					</div>
					<div class="space-y-2 md:col-span-2">
						<label for="telemetryNotes" class="text-sm font-medium">{m.reading_notes()}</label>
						<Textarea id="telemetryNotes" name="telemetryNotes" rows={3} />
					</div>
					<div class="md:col-span-2">
						<Button type="submit">{m.add_reading()}</Button>
					</div>
				</form>

				{#if data.batch.telemetry.length}
					<div class="overflow-hidden rounded-2xl border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Recorded</TableHead>
									<TableHead>{m.gravity_label()}</TableHead>
									<TableHead>Temp</TableHead>
									<TableHead>{m.notes()}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{#each data.batch.telemetry as entry (entry.id)}
									<TableRow>
										<TableCell>{dateTimeFormatter.format(entry.recordedAt)}</TableCell>
										<TableCell>{entry.gravity ?? '--'}</TableCell>
										<TableCell
											>{formatTemp(
												entry.temperatureC ? Number(entry.temperatureC) : null
											)}</TableCell
										>
										<TableCell>{entry.notes || m.no_notes()}</TableCell>
									</TableRow>
								{/each}
							</TableBody>
						</Table>
					</div>
				{:else}
					<div class="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
						{m.no_readings_yet()}
					</div>
				{/if}
			</div>
		</details>

		<details class="rounded-3xl border border-border/70 bg-card/95 p-5 shadow-sm">
			<summary class="cursor-pointer list-none text-lg font-bold">Conditioning</summary>
			<div class="mt-5 grid gap-4 md:grid-cols-2">
				<div class="rounded-2xl border bg-background/80 p-4">
					<p class="text-xs tracking-[0.18em] text-muted-foreground uppercase">Current phase</p>
					<p class="mt-2 text-xl font-bold">{data.dashboard.hero.statusLabel}</p>
					<p class="mt-1 text-sm text-muted-foreground">{data.dashboard.hero.statusDescription}</p>
				</div>
				<div class="rounded-2xl border bg-background/80 p-4">
					<p class="text-xs tracking-[0.18em] text-muted-foreground uppercase">
						Packaging readiness
					</p>
					<p class="mt-2 text-xl font-bold">
						{data.batch.status === 'conditioning' || data.batch.status === 'finished'
							? 'Ready to review'
							: 'Not yet'}
					</p>
					<p class="mt-1 text-sm text-muted-foreground">
						Use phase control when gravity is stable and packaging is the next step.
					</p>
				</div>
			</div>
		</details>

		<details class="rounded-3xl border border-border/70 bg-card/95 p-5 shadow-sm">
			<summary class="cursor-pointer list-none text-lg font-bold">Batch settings</summary>
			<div class="mt-5 space-y-6">
				<div class="grid gap-4 md:grid-cols-2">
					<div class="rounded-2xl border bg-background/80 p-4">
						<p class="text-xs tracking-[0.18em] text-muted-foreground uppercase">
							{m.recipe_label()}
						</p>
						<p class="mt-2 text-lg font-bold">{data.batch.recipeName}</p>
						<p class="mt-1 text-sm text-muted-foreground">
							{data.batch.recipeStyle || 'Style not set'}
						</p>
					</div>
					<div class="rounded-2xl border bg-background/80 p-4">
						<p class="text-xs tracking-[0.18em] text-muted-foreground uppercase">
							Target batch size
						</p>
						<p class="mt-2 text-lg font-bold">
							{formatVolume(
								Number(data.recipe.targetBatchSizeL),
								settings.units,
								numberFormatter.resolvedOptions().locale,
								1
							)}
						</p>
						<p class="mt-1 text-sm text-muted-foreground">Recipe target volume in display units.</p>
					</div>
				</div>

				<div class="rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
					<p class="font-medium">{m.delete_batch()}</p>
					<p class="mt-1 text-sm text-muted-foreground">{m.remove_batch_description()}</p>
					<form method="POST" action="?/delete" class="mt-4">
						<Button type="submit" variant="destructive">{m.delete_batch()}</Button>
					</form>
				</div>
			</div>
		</details>
	</div>
</div>
