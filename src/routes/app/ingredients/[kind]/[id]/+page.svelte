<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';
	import type { AppPageHeaderAction } from '$lib/components/app/page-header';
	import { INGREDIENT_KIND_LABELS } from '$lib/ingredients/config';
	import PageHeaderConfig from '$lib/components/app/page-header-config.svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import type {
		FermentableRecord,
		HopRecord,
		MiscRecord,
		YeastRecord
	} from '$lib/server/ingredients';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as m from '$lib/paraglide/messages';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const fermentable = $derived(
		data.kind === 'fermentables' ? (data.ingredient as FermentableRecord) : null
	);
	const hop = $derived(data.kind === 'hops' ? (data.ingredient as HopRecord) : null);
	const yeast = $derived(data.kind === 'yeasts' ? (data.ingredient as YeastRecord) : null);
	const misc = $derived(data.kind === 'miscs' ? (data.ingredient as MiscRecord) : null);

	function toDateInputValue(value: Date | null) {
		return value ? value.toISOString().slice(0, 10) : '';
	}

	const ingredientDetailHeaderActions: AppPageHeaderAction[] = [
		{ label: m.back(), href: resolve('/app/ingredients'), variant: 'outline' },
		{ label: m.save_details(), type: 'submit', form: 'ingredient-form', variant: 'default' }
	];
</script>

<div class="space-y-6">
	<PageHeaderConfig
		eyebrow={m.ingredients()}
		title={data.ingredient.name}
		description={m.edit_ingredient_description()}
		actions={ingredientDetailHeaderActions}
	/>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>{m.could_not_save_ingredient()}</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<form id="ingredient-form" method="POST" action="?/save">
		<div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
			<Card class="border-border/70 bg-card/95 shadow-sm">
				<CardHeader>
					<CardTitle class="text-xl font-bold">{m.ingredient_details()}</CardTitle>
					<CardDescription>{m.edit_ingredient_description()}</CardDescription>
				</CardHeader>
				<CardContent class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2 md:col-span-2">
						<label for="name" class="text-sm font-medium">{m.name_label()}</label>
						<Input id="name" name="name" value={data.ingredient.name} required />
					</div>

					{#if fermentable}
						<div class="space-y-2">
							<label for="type" class="text-sm font-medium">{m.type()}</label>
							<Input id="type" name="type" value={fermentable.type ?? ''} />
						</div>
						<div class="space-y-2">
							<label for="brand" class="text-sm font-medium">{m.brand()}</label>
							<Input id="brand" name="brand" value={fermentable.brand ?? ''} />
						</div>
						<div class="space-y-2">
							<label for="origin" class="text-sm font-medium">{m.origin()}</label>
							<Input id="origin" name="origin" value={fermentable.origin ?? ''} />
						</div>
						<div class="space-y-2">
							<label for="yieldPct" class="text-sm font-medium">{m.yield_pct()}</label>
							<Input
								id="yieldPct"
								name="yieldPct"
								type="number"
								step="0.01"
								value={fermentable.yieldPct}
								required
							/>
						</div>
						<div class="space-y-2">
							<label for="colorLovibond" class="text-sm font-medium">{m.color_lovibond()}</label>
							<Input
								id="colorLovibond"
								name="colorLovibond"
								type="number"
								step="0.01"
								value={fermentable.colorLovibond}
							/>
						</div>
						<div class="space-y-2">
							<label for="moisturePct" class="text-sm font-medium">{m.moisture_pct()}</label>
							<Input
								id="moisturePct"
								name="moisturePct"
								type="number"
								step="0.01"
								value={fermentable.moisturePct ?? ''}
							/>
						</div>
						<div class="space-y-2">
							<label for="coarseFineDiffPct" class="text-sm font-medium"
								>{m.coarse_fine_diff_pct()}</label
							>
							<Input
								id="coarseFineDiffPct"
								name="coarseFineDiffPct"
								type="number"
								step="0.01"
								value={fermentable.coarseFineDiffPct ?? ''}
							/>
						</div>
						<div class="space-y-2">
							<label for="diastaticPowerLintner" class="text-sm font-medium"
								>{m.diastatic_power_lintner()}</label
							>
							<Input
								id="diastaticPowerLintner"
								name="diastaticPowerLintner"
								type="number"
								step="0.01"
								value={fermentable.diastaticPowerLintner ?? ''}
							/>
						</div>
						<div class="space-y-2">
							<label for="proteinPct" class="text-sm font-medium">{m.protein_pct()}</label>
							<Input
								id="proteinPct"
								name="proteinPct"
								type="number"
								step="0.01"
								value={fermentable.proteinPct ?? ''}
							/>
						</div>
						<div class="space-y-2">
							<label for="maxInBatchPct" class="text-sm font-medium">{m.max_in_batch_pct()}</label>
							<Input
								id="maxInBatchPct"
								name="maxInBatchPct"
								type="number"
								step="0.01"
								value={fermentable.maxInBatchPct ?? ''}
							/>
						</div>
						<label
							class="flex items-center justify-between gap-3 rounded-2xl border bg-background/80 px-4 py-3 md:col-span-2"
						>
							<div>
								<p class="text-sm font-medium">{m.recommend_mash()}</p>
							</div>
							<Checkbox checked={fermentable.recommendMash} name="recommendMash" value="on" />
						</label>
						<label
							class="flex items-center justify-between gap-3 rounded-2xl border bg-background/80 px-4 py-3 md:col-span-2"
						>
							<div>
								<p class="text-sm font-medium">{m.extract_ingredient()}</p>
							</div>
							<Checkbox checked={fermentable.isExtract} name="isExtract" value="on" />
						</label>
					{/if}

					{#if hop}
						<div class="space-y-2">
							<label for="type" class="text-sm font-medium">{m.hop_use()}</label>
							<Input id="type" name="type" value={hop.type ?? ''} />
						</div>
						<div class="space-y-2">
							<label for="form" class="text-sm font-medium">{m.form_label()}</label>
							<Input id="form" name="form" value={hop.form ?? ''} />
						</div>
						<div class="space-y-2">
							<label for="origin" class="text-sm font-medium">{m.origin()}</label>
							<Input id="origin" name="origin" value={hop.origin ?? ''} />
						</div>
						<div class="space-y-2">
							<label for="alphaAcidPct" class="text-sm font-medium">{m.alpha_acid_pct()}</label>
							<Input
								id="alphaAcidPct"
								name="alphaAcidPct"
								type="number"
								step="0.01"
								value={hop.alphaAcidPct}
								required
							/>
						</div>
						<div class="space-y-2">
							<label for="betaAcidPct" class="text-sm font-medium">{m.beta_acid_pct()}</label>
							<Input
								id="betaAcidPct"
								name="betaAcidPct"
								type="number"
								step="0.01"
								value={hop.betaAcidPct ?? ''}
							/>
						</div>
						<div class="space-y-2">
							<label for="hsiPct" class="text-sm font-medium">{m.hsi_pct()}</label>
							<Input id="hsiPct" name="hsiPct" type="number" step="0.01" value={hop.hsiPct ?? ''} />
						</div>
						<div class="space-y-2">
							<label for="cohumulonePct" class="text-sm font-medium">{m.cohumulone_pct()}</label>
							<Input
								id="cohumulonePct"
								name="cohumulonePct"
								type="number"
								step="0.01"
								value={hop.cohumulonePct ?? ''}
							/>
						</div>
						<div class="space-y-2">
							<label for="myrcenePct" class="text-sm font-medium">{m.myrcene_pct()}</label>
							<Input
								id="myrcenePct"
								name="myrcenePct"
								type="number"
								step="0.01"
								value={hop.myrcenePct ?? ''}
							/>
						</div>
						<div class="space-y-2 md:col-span-2">
							<label for="substitutes" class="text-sm font-medium">{m.substitutes()}</label>
							<Input id="substitutes" name="substitutes" value={hop.substitutes ?? ''} />
						</div>
					{/if}

					{#if yeast}
						<div class="space-y-2">
							<label for="lab" class="text-sm font-medium">{m.lab_label()}</label>
							<Input id="lab" name="lab" value={yeast.lab ?? ''} />
						</div>
						<div class="space-y-2">
							<label for="productCode" class="text-sm font-medium">{m.product_code()}</label>
							<Input id="productCode" name="productCode" value={yeast.productCode ?? ''} />
						</div>
						<div class="space-y-2">
							<label for="type" class="text-sm font-medium">{m.type()}</label>
							<Input id="type" name="type" value={yeast.type ?? ''} />
						</div>
						<div class="space-y-2">
							<label for="form" class="text-sm font-medium">{m.form_label()}</label>
							<Input id="form" name="form" value={yeast.form ?? ''} />
						</div>
						<div class="space-y-2">
							<label for="attenuationPct" class="text-sm font-medium">{m.attenuation_pct()}</label>
							<Input
								id="attenuationPct"
								name="attenuationPct"
								type="number"
								step="0.01"
								value={yeast.attenuationPct ?? ''}
							/>
						</div>
						<div class="space-y-2">
							<label for="flocculation" class="text-sm font-medium">{m.flocculation()}</label>
							<Input id="flocculation" name="flocculation" value={yeast.flocculation ?? ''} />
						</div>
						<div class="space-y-2">
							<label for="minTemperatureC" class="text-sm font-medium"
								>{m.min_temperature_c()}</label
							>
							<Input
								id="minTemperatureC"
								name="minTemperatureC"
								type="number"
								step="0.01"
								value={yeast.minTemperatureC ?? ''}
							/>
						</div>
						<div class="space-y-2">
							<label for="maxTemperatureC" class="text-sm font-medium"
								>{m.max_temperature_c()}</label
							>
							<Input
								id="maxTemperatureC"
								name="maxTemperatureC"
								type="number"
								step="0.01"
								value={yeast.maxTemperatureC ?? ''}
							/>
						</div>
						<div class="space-y-2">
							<label for="bestFor" class="text-sm font-medium">{m.best_for()}</label>
							<Input id="bestFor" name="bestFor" value={yeast.bestFor ?? ''} />
						</div>
						<div class="space-y-2">
							<label for="maxReuse" class="text-sm font-medium">{m.max_reuse()}</label>
							<Input
								id="maxReuse"
								name="maxReuse"
								type="number"
								step="1"
								value={yeast.maxReuse ?? ''}
							/>
						</div>
						<div class="space-y-2">
							<label for="inventory" class="text-sm font-medium">{m.inventory()}</label>
							<Input id="inventory" name="inventory" value={yeast.inventory ?? ''} />
						</div>
						<div class="space-y-2">
							<label for="cultureDate" class="text-sm font-medium">{m.culture_date()}</label>
							<Input
								id="cultureDate"
								name="cultureDate"
								type="date"
								value={toDateInputValue(yeast.cultureDate)}
							/>
						</div>
						<label
							class="flex items-center justify-between gap-3 rounded-2xl border bg-background/80 px-4 py-3 md:col-span-2"
						>
							<div>
								<p class="text-sm font-medium">{m.add_to_secondary()}</p>
							</div>
							<Checkbox checked={yeast.addToSecondary} name="addToSecondary" value="on" />
						</label>
					{/if}

					{#if misc}
						<div class="space-y-2">
							<label for="type" class="text-sm font-medium">{m.type()}</label>
							<Input id="type" name="type" value={misc.type ?? ''} required />
						</div>
						<div class="space-y-2">
							<label for="useFor" class="text-sm font-medium">{m.use_for()}</label>
							<Input id="useFor" name="useFor" value={misc.useFor ?? ''} />
						</div>
						<div class="space-y-2 md:col-span-2">
							<label for="description" class="text-sm font-medium">{m.notes()}</label>
							<Textarea
								id="description"
								name="description"
								rows={4}
								value={misc.description ?? ''}
							/>
						</div>
					{/if}

					<div class="space-y-2">
						<label for="supplier" class="text-sm font-medium">{m.supplier_label()}</label>
						<Input id="supplier" name="supplier" value={data.ingredient.supplier ?? ''} />
					</div>
					<div class="space-y-2">
						<label for="sourceUrl" class="text-sm font-medium">{m.source_url_label()}</label>
						<Input id="sourceUrl" name="sourceUrl" value={data.ingredient.sourceUrl ?? ''} />
					</div>
					<div class="space-y-2 md:col-span-2">
						<label for="notes" class="text-sm font-medium">{m.notes()}</label>
						<Textarea id="notes" name="notes" rows={5} value={data.ingredient.notes ?? ''} />
					</div>
				</CardContent>
			</Card>

			<Card class="border-border/70 bg-card/95 shadow-sm xl:sticky xl:top-6 xl:self-start">
				<CardHeader>
					<CardTitle class="text-xl font-bold">{m.remove_from_library()}</CardTitle>
				</CardHeader>
				<CardContent>
					<p class="mb-4 text-sm text-muted-foreground">
						{m.remove_ingredient_description()}
					</p>
					<form method="POST" action="?/delete">
						<Button type="submit" variant="destructive">{m.delete_ingredient()}</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	</form>
</div>
