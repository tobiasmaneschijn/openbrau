<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';
	import type { AppPageHeaderAction } from '$lib/components/app/page-header';
	import {
		BATCH_STATUS_DESCRIPTIONS,
		BATCH_STATUS_LABELS,
		BATCH_STATUS_ORDER
	} from '$lib/batches/config';
	import PageHeaderConfig from '$lib/components/app/page-header-config.svelte';
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
	import { Textarea } from '$lib/components/ui/textarea';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const batchDetailHeaderActions = $derived([
		{ label: 'Back', href: resolve('/app/batches'), variant: 'outline' },
		{ label: 'Save log', type: 'submit', form: 'batch-log-form', variant: 'default' }
	] satisfies AppPageHeaderAction[]);
</script>

<div class="space-y-6">
	<PageHeaderConfig
		eyebrow="Batches"
		title={data.batch.recipeName}
		description={`${BATCH_STATUS_LABELS[data.batch.status]} batch`}
		meta={`${data.batch.telemetry.length} telemetry readings`}
		actions={batchDetailHeaderActions}
	/>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>Could not update batch</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
		<div class="space-y-6">
			<Card class="border-border/70 bg-card/95 shadow-sm">
				<CardHeader>
					<CardTitle class="text-xl font-bold">Progress</CardTitle>
					<CardDescription
						>Move the batch through brew day and fermentation in order.</CardDescription
					>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="grid gap-3 md:grid-cols-5">
						{#each BATCH_STATUS_ORDER as status (status)}
							<div
								class={`rounded-2xl border px-4 py-3 text-sm ${
									status === data.batch.status
										? 'border-primary bg-primary text-primary-foreground'
										: BATCH_STATUS_ORDER.indexOf(status) <
											  BATCH_STATUS_ORDER.indexOf(data.batch.status)
											? 'border-border bg-accent/50'
											: 'bg-background/80'
								}`}
							>
								<p class="font-medium">{BATCH_STATUS_LABELS[status]}</p>
							</div>
						{/each}
					</div>

					{#if data.nextStatus}
						<form method="POST" action="?/advanceStatus">
							<input type="hidden" name="nextStatus" value={data.nextStatus} />
							<Button type="submit">Move to {BATCH_STATUS_LABELS[data.nextStatus]}</Button>
						</form>
					{:else}
						<div class="rounded-2xl border bg-background/80 p-4 text-sm text-muted-foreground">
							This batch has completed the full tracking flow.
						</div>
					{/if}
				</CardContent>
			</Card>

			<form id="batch-log-form" method="POST" action="?/saveLog">
				<Card class="border-border/70 bg-card/95 shadow-sm">
					<CardHeader>
						<CardTitle class="text-xl font-bold">Batch log</CardTitle>
						<CardDescription
							>Keep practical notes for brew day, fermentation, and packaging.</CardDescription
						>
					</CardHeader>
					<CardContent class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<label for="brewDate" class="text-sm font-medium">Brew date</label>
							<Input
								id="brewDate"
								name="brewDate"
								type="date"
								value={data.batch.brewDate ? data.batch.brewDate.toISOString().slice(0, 10) : ''}
							/>
						</div>
						<div class="space-y-2">
							<label for="actualBatchSizeL" class="text-sm font-medium">Actual batch size (L)</label
							>
							<Input
								id="actualBatchSizeL"
								name="actualBatchSizeL"
								type="number"
								step="0.001"
								value={data.batch.actualBatchSizeL ?? ''}
							/>
						</div>
						<div class="space-y-2 md:col-span-2">
							<label for="notes" class="text-sm font-medium">Batch notes</label>
							<Textarea id="notes" name="notes" rows={6} value={data.batch.notes ?? ''} />
						</div>
					</CardContent>
				</Card>
			</form>

			<Card class="border-border/70 bg-card/95 shadow-sm">
				<CardHeader>
					<CardTitle class="text-xl font-bold">Fermentation log</CardTitle>
					<CardDescription>Record gravity and temperature readings over time.</CardDescription>
				</CardHeader>
				<CardContent class="space-y-6">
					<form method="POST" action="?/addTelemetry" class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<label for="recordedAt" class="text-sm font-medium">Recorded at</label>
							<Input id="recordedAt" name="recordedAt" type="datetime-local" />
						</div>
						<div class="space-y-2">
							<label for="gravity" class="text-sm font-medium">Gravity</label>
							<Input id="gravity" name="gravity" type="number" step="0.001" />
						</div>
						<div class="space-y-2">
							<label for="temperatureC" class="text-sm font-medium">Temperature (C)</label>
							<Input id="temperatureC" name="temperatureC" type="number" step="0.01" />
						</div>
						<div class="space-y-2 md:col-span-2">
							<label for="telemetryNotes" class="text-sm font-medium">Reading notes</label>
							<Textarea id="telemetryNotes" name="telemetryNotes" rows={3} />
						</div>
						<div class="md:col-span-2">
							<Button type="submit">Add reading</Button>
						</div>
					</form>

					{#if data.batch.telemetry.length}
						<div class="space-y-3">
							{#each data.batch.telemetry as entry (entry.id)}
								<div class="rounded-2xl border bg-background/80 p-4">
									<div class="flex flex-wrap items-center justify-between gap-3">
										<div>
											<p class="font-medium">
												{entry.recordedAt.toLocaleString()}
											</p>
											<p class="text-sm text-muted-foreground">{entry.notes || 'No notes'}</p>
										</div>
										<div class="flex flex-wrap gap-4 text-sm">
											<span>Gravity {entry.gravity ?? '--'}</span>
											<span>Temp {entry.temperatureC ?? '--'} C</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
							No readings yet. Add gravity or temperature entries as fermentation progresses.
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>

		<aside class="space-y-6 xl:sticky xl:top-6 xl:self-start">
			<Card class="border-border/70 bg-card/95 shadow-sm">
				<CardHeader>
					<CardTitle class="text-xl font-bold">Batch summary</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4 text-sm text-muted-foreground">
					<div class="rounded-2xl border bg-background/80 p-4">
						<p class="text-xs tracking-[0.2em] text-muted-foreground uppercase">Recipe</p>
						<p class="mt-2 text-base font-semibold text-foreground">{data.batch.recipeName}</p>
						<p class="mt-1">{data.batch.recipeStyle || 'No style selected'}</p>
					</div>
					<div class="rounded-2xl border bg-background/80 p-4">
						<p class="text-xs tracking-[0.2em] text-muted-foreground uppercase">Setup</p>
						<p class="mt-2 text-base font-semibold text-foreground">
							{data.batch.equipmentName || 'Default setup'}
						</p>
					</div>
					<div class="rounded-2xl border bg-background/80 p-4">
						<p class="text-xs tracking-[0.2em] text-muted-foreground uppercase">Telemetry</p>
						<p class="mt-2 text-base font-semibold text-foreground">
							{data.batch.telemetry.length} readings
						</p>
					</div>
				</CardContent>
			</Card>

			<Card class="border-border/70 bg-card/95 shadow-sm">
				<CardHeader>
					<CardTitle class="text-xl font-bold">Delete batch</CardTitle>
				</CardHeader>
				<CardContent>
					<p class="mb-4 text-sm text-muted-foreground">
						Remove this batch if it was created by mistake.
					</p>
					<form method="POST" action="?/delete">
						<Button type="submit" variant="destructive">Delete batch</Button>
					</form>
				</CardContent>
			</Card>
		</aside>
	</div>
</div>
