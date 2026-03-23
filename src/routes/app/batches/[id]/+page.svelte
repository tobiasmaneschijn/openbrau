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
	let editingTelemetryId = $state<string | null>(null);

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
		);
	}

	function formatBatchVolume(value: string | null) {
		if (!value) {
			return '--';
		}

		return formatVolume(Number(value), settings.units, numberFormatter.resolvedOptions().locale, 1);
	}

	function toDatetimeLocalValue(value: Date) {
		const adjusted = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
		return adjusted.toISOString().slice(0, 16);
	}

	function trendArrow(trend: 'up' | 'down' | 'steady') {
		if (trend === 'up') return '^';
		if (trend === 'down') return 'v';
		return '~';
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

	$effect(() => {
		if (form?.success) {
			editingTelemetryId = null;
		}
	});
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
			<CardDescription>Move backward, forward, or directly to any phase.</CardDescription>
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
							&lt;- Move to {BATCH_STATUS_LABELS[data.previousStatus]}
						</Button>
					</form>
				{/if}

				{#if data.nextStatus}
					<form method="POST" action="?/changeStatus">
						<input type="hidden" name="nextStatus" value={data.nextStatus} />
						<Button type="submit">Move to {BATCH_STATUS_LABELS[data.nextStatus]} -&gt;</Button>
					</form>
				{/if}
			</div>

			<div class="space-y-3 rounded-2xl border border-dashed p-4">
				<div>
					<p class="font-medium">Jump to phase</p>
					<p class="text-sm text-muted-foreground">
						Use this if you need to correct the current phase without losing data.
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
								<div class="pt-0.5 text-lg">{task.done ? '[x]' : '[ ]'}</div>
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
									{phase.state === 'complete' ? '[x]' : phase.state === 'current' ? '[~]' : '[ ]'}
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
								<span>{task.done ? '[x]' : '[ ]'}</span>
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
						<label for="temperatureC" class="text-sm font-medium">Temperature (C)</label>
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
									{#if editingTelemetryId === entry.id}
										<TableRow>
											<TableCell colspan={4}>
												<form
													method="POST"
													action="?/updateTelemetry"
													class="grid gap-4 md:grid-cols-2"
												>
													<input type="hidden" name="telemetryId" value={entry.id} />
													<div class="space-y-2">
														<label for={`recordedAt-${entry.id}`} class="text-sm font-medium"
															>{m.recorded_at()}</label
														>
														<Input
															id={`recordedAt-${entry.id}`}
															name="recordedAt"
															type="datetime-local"
															value={toDatetimeLocalValue(entry.recordedAt)}
														/>
													</div>
													<div class="space-y-2">
														<label for={`gravity-${entry.id}`} class="text-sm font-medium"
															>{m.gravity_label()}</label
														>
														<Input
															id={`gravity-${entry.id}`}
															name="gravity"
															type="number"
															step="0.001"
															value={entry.gravity ?? ''}
														/>
													</div>
													<div class="space-y-2">
														<label for={`temperatureC-${entry.id}`} class="text-sm font-medium"
															>Temperature (C)</label
														>
														<Input
															id={`temperatureC-${entry.id}`}
															name="temperatureC"
															type="number"
															step="0.01"
															value={entry.temperatureC ?? ''}
														/>
													</div>
													<div class="space-y-2 md:col-span-2">
														<label for={`telemetryNotes-${entry.id}`} class="text-sm font-medium"
															>{m.reading_notes()}</label
														>
														<Textarea
															id={`telemetryNotes-${entry.id}`}
															name="telemetryNotes"
															rows={3}
															value={entry.notes ?? ''}
														/>
													</div>
													<div class="flex flex-wrap gap-2 md:col-span-2">
														<Button type="submit" size="sm">{m.save_changes()}</Button>
														<Button
															type="button"
															variant="outline"
															size="sm"
															onclick={() => (editingTelemetryId = null)}
														>
															Cancel
														</Button>
													</div>
												</form>
											</TableCell>
										</TableRow>
									{:else}
										<TableRow>
											<TableCell>{dateTimeFormatter.format(entry.recordedAt)}</TableCell>
											<TableCell>{entry.gravity ?? '--'}</TableCell>
											<TableCell
												>{formatTemp(
													entry.temperatureC ? Number(entry.temperatureC) : null
												)}</TableCell
											>
											<TableCell>
												<div class="flex items-start justify-between gap-3">
													<span>{entry.notes || m.no_notes()}</span>
													<div class="flex shrink-0 gap-2">
														<Button
															type="button"
															variant="outline"
															size="sm"
															onclick={() => (editingTelemetryId = entry.id)}
														>
															Edit
														</Button>
														<form method="POST" action="?/deleteTelemetry">
															<input type="hidden" name="telemetryId" value={entry.id} />
															<Button type="submit" variant="outline" size="sm">
																{m.remove()}
															</Button>
														</form>
													</div>
												</div>
											</TableCell>
										</TableRow>
									{/if}
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
			<summary class="cursor-pointer list-none text-lg font-bold">Batch formulation</summary>
			<div class="mt-5">
				<form method="POST" action="?/saveFormulation" class="space-y-5">
					<div class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<label for="formulation-name" class="text-sm font-medium">Batch name</label>
							<Input id="formulation-name" name="name" value={data.formulationSnapshot.name} />
						</div>
						<div class="space-y-2">
							<label for="formulation-style" class="text-sm font-medium">{m.style()}</label>
							<Input
								id="formulation-style"
								name="style"
								value={data.formulationSnapshot.style ?? ''}
							/>
						</div>
						<div class="space-y-2">
							<label for="formulation-brew-type" class="text-sm font-medium">{m.brew_type()}</label>
							<select
								id="formulation-brew-type"
								name="brewType"
								class="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background transition-[color,box-shadow] outline-none focus-visible:ring-1 focus-visible:ring-ring"
							>
								<option value="beer" selected={data.formulationSnapshot.brewType === 'beer'}
									>Beer</option
								>
								<option value="wine" selected={data.formulationSnapshot.brewType === 'wine'}
									>Wine</option
								>
								<option value="mead" selected={data.formulationSnapshot.brewType === 'mead'}
									>Mead</option
								>
							</select>
						</div>
						<div class="space-y-2">
							<label for="formulation-targetBatchSizeL" class="text-sm font-medium"
								>{m.target_volume()} (L)</label
							>
							<Input
								id="formulation-targetBatchSizeL"
								name="targetBatchSizeL"
								type="number"
								step="0.001"
								value={String(data.formulationSnapshot.process.targetBatchSizeL)}
							/>
						</div>
						<div class="space-y-2">
							<label for="formulation-boilTimeMin" class="text-sm font-medium">{m.time_min()}</label
							>
							<Input
								id="formulation-boilTimeMin"
								name="boilTimeMin"
								type="number"
								step="1"
								value={String(data.formulationSnapshot.process.boilTimeMin)}
							/>
						</div>
						<div class="space-y-2">
							<label for="formulation-targetOg" class="text-sm font-medium"
								>{m.target_og_label()}</label
							>
							<Input
								id="formulation-targetOg"
								name="targetOg"
								type="number"
								step="0.001"
								value={data.formulationSnapshot.targets.og == null
									? ''
									: String(data.formulationSnapshot.targets.og)}
							/>
						</div>
						<div class="space-y-2">
							<label for="formulation-targetFg" class="text-sm font-medium"
								>{m.target_fg_label()}</label
							>
							<Input
								id="formulation-targetFg"
								name="targetFg"
								type="number"
								step="0.001"
								value={data.formulationSnapshot.targets.fg == null
									? ''
									: String(data.formulationSnapshot.targets.fg)}
							/>
						</div>
						<div class="space-y-2">
							<label for="formulation-targetIbu" class="text-sm font-medium"
								>{m.target_ibu_label()}</label
							>
							<Input
								id="formulation-targetIbu"
								name="targetIbu"
								type="number"
								step="0.1"
								value={data.formulationSnapshot.targets.ibu == null
									? ''
									: String(data.formulationSnapshot.targets.ibu)}
							/>
						</div>
						<div class="space-y-2">
							<label for="formulation-targetSrm" class="text-sm font-medium"
								>{m.target_srm_label()}</label
							>
							<Input
								id="formulation-targetSrm"
								name="targetSrm"
								type="number"
								step="0.1"
								value={data.formulationSnapshot.targets.srm == null
									? ''
									: String(data.formulationSnapshot.targets.srm)}
							/>
						</div>
						<div class="space-y-2 md:col-span-2">
							<label for="formulationNotes" class="text-sm font-medium">{m.notes()}</label>
							<Textarea
								id="formulationNotes"
								name="formulationNotes"
								rows={4}
								value={data.formulationSnapshot.notes ?? ''}
							/>
						</div>
						<div class="space-y-2 md:col-span-2">
							<label for="snapshotJson" class="text-sm font-medium">Full batch snapshot JSON</label>
							<Textarea
								id="snapshotJson"
								name="snapshotJson"
								rows={18}
								value={data.formulationJson}
							/>
							<p class="text-sm text-muted-foreground">
								This batch snapshot is independent from the source recipe. Edit any ingredient,
								process value, or target here.
							</p>
						</div>
					</div>
					<Button type="submit">{m.save_changes()}</Button>
				</form>
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
							Source recipe
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
								Number(data.formulationSnapshot.process.targetBatchSizeL),
								settings.units,
								numberFormatter.resolvedOptions().locale,
								1
							)}
						</p>
						<p class="mt-1 text-sm text-muted-foreground">
							Batch target volume stored on the batch snapshot.
						</p>
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
