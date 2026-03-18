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
	import * as m from '$lib/paraglide/messages';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const batchDetailHeaderActions = $derived([
		{ label: m.back(), href: resolve('/app/batches'), variant: 'outline' },
		{ label: m.save_log(), type: 'submit', form: 'batch-log-form', variant: 'default' }
	] satisfies AppPageHeaderAction[]);
</script>

<div class="space-y-6">
	<PageHeaderConfig
		eyebrow={m.batches()}
		title={data.batch.recipeName}
		description={`${BATCH_STATUS_LABELS[data.batch.status]} ${m.batch_summary()}`}
		meta={`${data.batch.telemetry.length} ${m.readings()}`}
		actions={batchDetailHeaderActions}
	/>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>{m.could_not_update_batch()}</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
		<div class="space-y-6">
			<Card class="border-border/70 bg-card/95 shadow-sm">
				<CardHeader>
					<CardTitle class="text-xl font-bold">{m.progress_through_stages()}</CardTitle>
					<CardDescription>{m.progress_through_stages()}</CardDescription>
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
							<Button type="submit"
								>{m.move_to_status({ status: BATCH_STATUS_LABELS[data.nextStatus] })}</Button
							>
						</form>
					{:else}
						<div class="rounded-2xl border bg-background/80 p-4 text-sm text-muted-foreground">
							{m.batch_completed()}
						</div>
					{/if}
				</CardContent>
			</Card>

			<form id="batch-log-form" method="POST" action="?/saveLog">
				<Card class="border-border/70 bg-card/95 shadow-sm">
					<CardHeader>
						<CardTitle class="text-xl font-bold">{m.batch_log()}</CardTitle>
						<CardDescription>{m.batch_log_description()}</CardDescription>
					</CardHeader>
					<CardContent class="grid gap-4 md:grid-cols-2">
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
						<div class="space-y-2 md:col-span-2">
							<label for="notes" class="text-sm font-medium">{m.batch_notes()}</label>
							<Textarea id="notes" name="notes" rows={6} value={data.batch.notes ?? ''} />
						</div>
					</CardContent>
				</Card>
			</form>

			<Card class="border-border/70 bg-card/95 shadow-sm">
				<CardHeader>
					<CardTitle class="text-xl font-bold">{m.fermentation_log()}</CardTitle>
					<CardDescription>{m.fermentation_log_description()}</CardDescription>
				</CardHeader>
				<CardContent class="space-y-6">
					<form method="POST" action="?/addTelemetry" class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<label for="recordedAt" class="text-sm font-medium">{m.recorded_at()}</label>
							<Input id="recordedAt" name="recordedAt" type="datetime-local" />
						</div>
						<div class="space-y-2">
							<label for="gravity" class="text-sm font-medium">{m.gravity_label()}</label>
							<Input id="gravity" name="gravity" type="number" step="0.001" />
						</div>
						<div class="space-y-2">
							<label for="temperatureC" class="text-sm font-medium">{m.temperature_label()}</label>
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
						<div class="space-y-3">
							{#each data.batch.telemetry as entry (entry.id)}
								<div class="rounded-2xl border bg-background/80 p-4">
									<div class="flex flex-wrap items-center justify-between gap-3">
										<div>
											<p class="font-medium">
												{entry.recordedAt.toLocaleString()}
											</p>
											<p class="text-sm text-muted-foreground">{entry.notes || m.no_notes()}</p>
										</div>
										<div class="flex flex-wrap gap-4 text-sm">
											<span>{m.gravity_label()} {entry.gravity ?? '--'}</span>
											<span>{m.temperature_label()} {entry.temperatureC ?? '--'}</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
							{m.no_readings_yet()}
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>

		<aside class="space-y-6 xl:sticky xl:top-6 xl:self-start">
			<Card class="border-border/70 bg-card/95 shadow-sm">
				<CardHeader>
					<CardTitle class="text-xl font-bold">{m.batch_summary()}</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4 text-sm text-muted-foreground">
					<div class="rounded-2xl border bg-background/80 p-4">
						<p class="text-xs tracking-[0.2em] text-muted-foreground uppercase">
							{m.recipe_label()}
						</p>
						<p class="mt-2 text-base font-semibold text-foreground">{data.batch.recipeName}</p>
						<p class="mt-1">{data.batch.recipeStyle || m.no_style_selected()}</p>
					</div>
					<div class="rounded-2xl border bg-background/80 p-4">
						<p class="text-xs tracking-[0.2em] text-muted-foreground uppercase">
							{m.setup_label()}
						</p>
						<p class="mt-2 text-base font-semibold text-foreground">
							{data.batch.equipmentName || m.default_setup()}
						</p>
					</div>
					<div class="rounded-2xl border bg-background/80 p-4">
						<p class="text-xs tracking-[0.2em] text-muted-foreground uppercase">
							{m.telemetry_label()}
						</p>
						<p class="mt-2 text-base font-semibold text-foreground">
							{data.batch.telemetry.length}
							{m.readings()}
						</p>
					</div>
				</CardContent>
			</Card>

			<Card class="border-border/70 bg-card/95 shadow-sm">
				<CardHeader>
					<CardTitle class="text-xl font-bold">{m.delete_batch()}</CardTitle>
				</CardHeader>
				<CardContent>
					<p class="mb-4 text-sm text-muted-foreground">{m.remove_batch_description()}</p>
					<form method="POST" action="?/delete">
						<Button type="submit" variant="destructive">{m.delete_batch()}</Button>
					</form>
				</CardContent>
			</Card>
		</aside>
	</div>
</div>
