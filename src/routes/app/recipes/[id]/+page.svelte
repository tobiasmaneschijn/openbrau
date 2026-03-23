<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';
	import type { AppPageHeaderAction } from '$lib/components/app/page-header';
	import type { RecipeModuleKey } from '$lib/recipes/domain';
	import { IBU_FORMULA_LABELS, RECIPE_MODULE_LABELS } from '$lib/recipes/config';
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
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import RecipeForm from '$lib/components/recipes/recipe-form.svelte';
	import * as m from '$lib/paraglide/messages';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const fermentableSuggestionId = 'fermentable-suggestions';
	const hopSuggestionId = 'hop-suggestions';
	const yeastSuggestionId = 'yeast-suggestions';
	const miscSuggestionId = 'misc-suggestions';
	const hopUseOptions = [
		{ value: 'mash', label: m.mash_phase() },
		{ value: 'first_wort', label: m.first_wort_phase() },
		{ value: 'boil', label: m.boil_phase() },
		{ value: 'whirlpool', label: m.whirlpool_phase() },
		{ value: 'dry_hop', label: m.dry_hop_phase() }
	] as const;
	const miscUseOptions = [
		{ value: 'mash', label: m.mash_phase() },
		{ value: 'boil', label: m.boil_phase() },
		{ value: 'whirlpool', label: m.whirlpool_phase() },
		{ value: 'fermentation', label: m.fermentation_phase() },
		{ value: 'packaging', label: m.packaging_phase() }
	] as const;

	function formatMetric(value: number | string | null, decimals: number) {
		if (value == null) {
			return '--';
		}

		const numeric = typeof value === 'number' ? value : Number(value);
		if (Number.isNaN(numeric)) {
			return '--';
		}

		return numeric.toFixed(decimals);
	}

	function moduleLabel(module: string) {
		return RECIPE_MODULE_LABELS[module as RecipeModuleKey] ?? module;
	}

	function usePhaseLabel(value: string) {
		switch (value) {
			case 'mash':
				return m.mash_phase();
			case 'steep':
				return m.steep_phase();
			case 'boil':
				return m.boil_phase();
			case 'fermentation':
				return m.fermentation_phase();
			case 'first_wort':
				return m.first_wort_phase();
			case 'whirlpool':
				return m.whirlpool_phase();
			case 'dry_hop':
				return m.dry_hop_phase();
			case 'packaging':
				return m.packaging_phase();
			default:
				return value;
		}
	}

	const recipeDetailHeaderActions = $derived([
		{
			label: m.start_batch(),
			href: resolve(`/app/batches/new?recipeId=${data.recipe.id}`),
			variant: 'secondary'
		},
		{
			label: m.export_xml(),
			href: resolve(`/app/recipes/${data.recipe.id}/beerxml`),
			variant: 'outline'
		},
		{ label: m.back(), href: resolve('/app/recipes'), variant: 'outline' },
		{ label: m.save_changes(), type: 'submit', form: 'recipe-edit-form', variant: 'default' }
	] satisfies AppPageHeaderAction[]);
</script>

<div class="space-y-6">
	<PageHeaderConfig
		eyebrow={m.recipes()}
		title={data.recipe.name}
		description={m.recipe_snapshot_description()}
		actions={recipeDetailHeaderActions}
	/>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>{m.could_not_save_recipe()}</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<RecipeForm
		formId="recipe-edit-form"
		recipe={data.recipe}
		formAction="?/update"
		deleteAction="?/delete"
	>
		<div class="grid gap-4 lg:grid-cols-2">
			<Card class="border-border/70 bg-card/95 shadow-sm">
				<CardHeader class="space-y-3">
					<div class="flex flex-wrap items-center gap-2">
						<CardTitle class="text-xl font-bold">{m.recipe_snapshot()}</CardTitle>
						<Badge variant="secondary"
							>{IBU_FORMULA_LABELS[data.engineSummary.process.ibuFormula]}</Badge
						>
					</div>
					<CardDescription>{m.recipe_snapshot_description()}</CardDescription>
					<div class="flex flex-wrap gap-2">
						{#each data.engineSummary.modules as module (module)}
							<Badge variant="outline">{moduleLabel(module)}</Badge>
						{/each}
					</div>
				</CardHeader>
				<CardContent class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					<div class="rounded-2xl border bg-background/80 p-4">
						<p class="text-xs tracking-[0.2em] text-muted-foreground uppercase">
							{m.original_gravity()}
						</p>
						<p class="mt-2 text-2xl font-black">
							{formatMetric(data.engineSummary.computed.og, 3)}
						</p>
						<p class="mt-1 text-sm text-muted-foreground">
							{m.target_value({ value: formatMetric(data.engineSummary.targets.og, 3) })}
						</p>
					</div>
					<div class="rounded-2xl border bg-background/80 p-4">
						<p class="text-xs tracking-[0.2em] text-muted-foreground uppercase">
							{m.final_gravity()}
						</p>
						<p class="mt-2 text-2xl font-black">
							{formatMetric(data.engineSummary.computed.fg, 3)}
						</p>
						<p class="mt-1 text-sm text-muted-foreground">
							{m.target_value({ value: formatMetric(data.engineSummary.targets.fg, 3) })}
						</p>
					</div>
					<div class="rounded-2xl border bg-background/80 p-4">
						<p class="text-xs tracking-[0.2em] text-muted-foreground uppercase">
							{m.estimated_abv()}
						</p>
						<p class="mt-2 text-2xl font-black">
							{formatMetric(data.engineSummary.computed.abvPct, 2)}%
						</p>
					</div>
					<div class="rounded-2xl border bg-background/80 p-4">
						<p class="text-xs tracking-[0.2em] text-muted-foreground uppercase">
							{m.bitterness_label()}
						</p>
						<p class="mt-2 text-2xl font-black">
							{formatMetric(data.engineSummary.computed.ibu, 1)}
						</p>
						<p class="mt-1 text-sm text-muted-foreground">
							{m.target_value({ value: formatMetric(data.engineSummary.targets.ibu, 1) })}
						</p>
					</div>
					<div class="rounded-2xl border bg-background/80 p-4">
						<p class="text-xs tracking-[0.2em] text-muted-foreground uppercase">
							{m.color_label()}
						</p>
						<p class="mt-2 text-2xl font-black">
							{formatMetric(data.engineSummary.computed.srm, 1)}
						</p>
						<p class="mt-1 text-sm text-muted-foreground">
							{m.target_value({ value: formatMetric(data.engineSummary.targets.srm, 1) })}
						</p>
					</div>
					<div class="rounded-2xl border bg-background/80 p-4">
						<p class="text-xs tracking-[0.2em] text-muted-foreground uppercase">
							{m.pre_boil_volume()}
						</p>
						<p class="mt-2 text-2xl font-black">
							{formatMetric(data.engineSummary.batch.preBoilVolumeL, 1)} L
						</p>
						<p class="mt-1 text-sm text-muted-foreground">
							{m.target_value({
								value: `${formatMetric(data.engineSummary.batch.totalLiquorRequirementL, 1)} L`
							})}
						</p>
					</div>
				</CardContent>
			</Card>

			<Card class="border-border/70 bg-card/95 shadow-sm">
				<CardHeader>
					<CardTitle class="text-xl font-bold">{m.things_to_review()}</CardTitle>
					<CardDescription>{m.review_description()}</CardDescription>
				</CardHeader>
				<CardContent class="space-y-3">
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="rounded-2xl border bg-background/80 p-4">
							<p class="text-xs tracking-[0.2em] text-muted-foreground uppercase">
								{m.efficiency()}
							</p>
							<p class="mt-2 text-2xl font-black">
								{formatMetric(data.engineSummary.process.brewhouseEfficiencyPct, 1)}%
							</p>
						</div>
						<div class="rounded-2xl border bg-background/80 p-4">
							<p class="text-xs tracking-[0.2em] text-muted-foreground uppercase">
								{m.boil_off_loss()}
							</p>
							<p class="mt-2 text-2xl font-black">
								{formatMetric(data.engineSummary.batch.boilOffLossL, 1)} L
							</p>
						</div>
					</div>

					{#if data.engineSummary.warnings.length}
						<div class="space-y-2">
							{#each data.engineSummary.warnings as warning (warning.message)}
								<div
									class="rounded-2xl border border-amber-300/50 bg-amber-50/70 p-4 text-sm text-amber-950"
								>
									{warning.message}
								</div>
							{/each}
						</div>
					{:else}
						<div class="rounded-2xl border bg-background/80 p-4 text-sm text-muted-foreground">
							{m.everything_looks_good()}
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>

		<Card class="border-border/70 bg-card/95 shadow-sm">
			<CardHeader class="space-y-3">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div>
						<CardTitle class="text-xl font-bold">{m.ingredients()}</CardTitle>
						<CardDescription>{m.recipe_ingredients_description()}</CardDescription>
					</div>
					<Button href={resolve('/app/ingredients')} variant="outline"
						>{m.open_ingredient_library()}</Button
					>
				</div>
			</CardHeader>
			<CardContent class="grid gap-4 xl:grid-cols-2">
				<section class="rounded-2xl border bg-background/70 p-4">
					<div class="mb-4 flex items-center justify-between gap-3">
						<div>
							<h3 class="font-semibold">{m.ingredient_kind_fermentables()}</h3>
							<p class="text-sm text-muted-foreground">
								{m.ingredient_kind_fermentables_description()}
							</p>
						</div>
						<Badge variant="outline">{data.ingredients.fermentables.length}</Badge>
					</div>

					{#if data.ingredients.fermentables.length}
						<div class="space-y-3">
							{#each data.ingredients.fermentables as item (`${item.fermentableId}-${item.sortOrder}`)}
								<div class="rounded-2xl border bg-card/90 p-4">
									<div class="flex flex-wrap items-start justify-between gap-3">
										<div class="space-y-1">
											<a
												class="font-semibold hover:underline"
												href={resolve(`/app/ingredients/fermentables/${item.ingredient.id}`)}
											>
												{item.ingredient.name}
											</a>
											<p class="text-sm text-muted-foreground">
												{formatMetric(item.amountKg, 3)} kg
												{#if item.ingredient.brand}
													. {item.ingredient.brand}
												{/if}
												{#if item.ingredient.origin}
													. {item.ingredient.origin}
												{/if}
											</p>
											<p class="text-xs tracking-[0.16em] text-muted-foreground uppercase">
												{usePhaseLabel(item.usePhase)} . {m.yield_pct()}
												{formatMetric(item.ingredient.yieldPct, 1)}% . {formatMetric(
													item.ingredient.colorLovibond,
													1
												)} L
											</p>
											{#if item.notes}
												<p class="text-sm text-muted-foreground">{item.notes}</p>
											{/if}
										</div>

										<form method="POST" action="?/removeFermentable">
											<input type="hidden" name="fermentableId" value={item.fermentableId} />
											<input type="hidden" name="sortOrder" value={item.sortOrder} />
											<Button type="submit" variant="outline">{m.remove()}</Button>
										</form>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
							{m.no_fermentables_added_yet()}
						</div>
					{/if}

					<form
						method="POST"
						action="?/addFermentable"
						class="mt-4 space-y-3 rounded-2xl border border-dashed p-4"
					>
						<div class="grid gap-3 md:grid-cols-2">
							<div class="space-y-2 md:col-span-2">
								<label for="fermentable-name" class="text-sm font-medium"
									>{m.ingredient_name()}</label
								>
								<Input id="fermentable-name" name="name" list={fermentableSuggestionId} required />
								<datalist id={fermentableSuggestionId}>
									{#each data.ingredientLibrary.fermentables as ingredient (ingredient.id)}
										<option value={ingredient.name}></option>
									{/each}
								</datalist>
							</div>
							<div class="space-y-2">
								<label for="fermentable-amount" class="text-sm font-medium">{m.amount_kg()}</label>
								<Input
									id="fermentable-amount"
									name="amountKg"
									type="number"
									step="0.001"
									required
								/>
							</div>
							<div class="space-y-2">
								<label for="fermentable-phase" class="text-sm font-medium">{m.use_phase()}</label>
								<select
									id="fermentable-phase"
									name="usePhase"
									class="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background transition-[color,box-shadow] outline-none focus-visible:ring-1 focus-visible:ring-ring"
								>
									<option value="mash">{m.mash_phase()}</option>
									<option value="steep">{m.fermentation_phase()}</option>
									<option value="boil">{m.boil_phase()}</option>
									<option value="fermentation">{m.fermentation_phase()}</option>
								</select>
							</div>
							<div class="space-y-2">
								<label for="fermentable-yield" class="text-sm font-medium">{m.yield_pct()}</label>
								<Input id="fermentable-yield" name="yieldPct" type="number" step="0.01" required />
							</div>
							<div class="space-y-2">
								<label for="fermentable-color" class="text-sm font-medium"
									>{m.color_lovibond()}</label
								>
								<Input id="fermentable-color" name="colorLovibond" type="number" step="0.01" />
							</div>
							<div class="space-y-2">
								<label for="fermentable-type" class="text-sm font-medium">{m.type()}</label>
								<Input
									id="fermentable-type"
									name="type"
									placeholder={m.grain_sugar_extract_placeholder()}
								/>
							</div>
							<div class="space-y-2">
								<label for="fermentable-brand" class="text-sm font-medium">{m.brand()}</label>
								<Input id="fermentable-brand" name="brand" />
							</div>
							<div class="space-y-2 md:col-span-2">
								<label for="fermentable-origin" class="text-sm font-medium">{m.origin()}</label>
								<Input id="fermentable-origin" name="origin" />
							</div>
							<div class="space-y-2 md:col-span-2">
								<label for="fermentable-notes" class="text-sm font-medium">{m.recipe_note()}</label>
								<Textarea id="fermentable-notes" name="notes" rows={3} />
							</div>
						</div>
						<label class="flex items-center gap-3 rounded-2xl border bg-card/80 px-4 py-3">
							<Checkbox name="isExtract" value="on" />
							<div>
								<p class="text-sm font-medium">{m.treat_as_extract()}</p>
								<p class="text-xs text-muted-foreground">
									{m.treat_as_extract_description()}
								</p>
							</div>
						</label>
						<Button type="submit">{m.add_fermentable()}</Button>
					</form>
				</section>

				<section class="rounded-2xl border bg-background/70 p-4">
					<div class="mb-4 flex items-center justify-between gap-3">
						<div>
							<h3 class="font-semibold">{m.ingredient_kind_hops()}</h3>
							<p class="text-sm text-muted-foreground">
								{m.ingredient_kind_hops_description()}
							</p>
						</div>
						<Badge variant="outline">{data.ingredients.hops.length}</Badge>
					</div>

					{#if data.ingredients.hops.length}
						<div class="space-y-3">
							{#each data.ingredients.hops as item (`${item.hopId}-${item.sortOrder}`)}
								<div class="rounded-2xl border bg-card/90 p-4">
									<div class="flex flex-wrap items-start justify-between gap-3">
										<div class="space-y-1">
											<a
												class="font-semibold hover:underline"
												href={resolve(`/app/ingredients/hops/${item.ingredient.id}`)}
											>
												{item.ingredient.name}
											</a>
											<p class="text-sm text-muted-foreground">
												{formatMetric(item.amountKg, 3)} kg . {formatMetric(
													item.ingredient.alphaAcidPct,
													2
												)}% alpha acid
											</p>
											<p class="text-xs tracking-[0.16em] text-muted-foreground uppercase">
												{usePhaseLabel(item.usePhase)}
												{#if item.timeMin != null}
													. {item.timeMin} {m.time_min()}
												{/if}
												{#if item.ingredient.form}
													. {item.ingredient.form}
												{/if}
											</p>
											{#if item.notes}
												<p class="text-sm text-muted-foreground">{item.notes}</p>
											{/if}
										</div>

										<form method="POST" action="?/removeHop">
											<input type="hidden" name="hopId" value={item.hopId} />
											<input type="hidden" name="sortOrder" value={item.sortOrder} />
											<Button type="submit" variant="outline">{m.remove()}</Button>
										</form>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
							{m.no_hops_added_yet()}
						</div>
					{/if}

					<form
						method="POST"
						action="?/addHop"
						class="mt-4 space-y-3 rounded-2xl border border-dashed p-4"
					>
						<div class="grid gap-3 md:grid-cols-2">
							<div class="space-y-2 md:col-span-2">
								<label for="hop-name" class="text-sm font-medium">{m.hop_name()}</label>
								<Input id="hop-name" name="name" list={hopSuggestionId} required />
								<datalist id={hopSuggestionId}>
									{#each data.ingredientLibrary.hops as ingredient (ingredient.id)}
										<option value={ingredient.name}></option>
									{/each}
								</datalist>
							</div>
							<div class="space-y-2">
								<label for="hop-amount" class="text-sm font-medium">{m.amount_kg()}</label>
								<Input id="hop-amount" name="amountKg" type="number" step="0.0001" required />
							</div>
							<div class="space-y-2">
								<label for="hop-alpha" class="text-sm font-medium">{m.alpha_acid_pct()}</label>
								<Input id="hop-alpha" name="alphaAcidPct" type="number" step="0.01" required />
							</div>
							<div class="space-y-2">
								<label for="hop-time" class="text-sm font-medium">{m.time_min()}</label>
								<Input id="hop-time" name="timeMin" type="number" step="1" />
							</div>
							<div class="space-y-2">
								<label for="hop-use" class="text-sm font-medium">{m.use()}</label>
								<select
									id="hop-use"
									name="usePhase"
									class="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background transition-[color,box-shadow] outline-none focus-visible:ring-1 focus-visible:ring-ring"
								>
									{#each hopUseOptions as option (option.value)}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
							</div>
							<div class="space-y-2">
								<label for="hop-form" class="text-sm font-medium">{m.form_label()}</label>
								<Input id="hop-form" name="form" placeholder={m.pellet_whole_plug_placeholder()} />
							</div>
							<div class="space-y-2">
								<label for="hop-type" class="text-sm font-medium">{m.type()}</label>
								<Input
									id="hop-type"
									name="type"
									placeholder={m.bittering_aroma_dual_purpose_placeholder()}
								/>
							</div>
							<div class="space-y-2 md:col-span-2">
								<label for="hop-origin" class="text-sm font-medium">{m.origin()}</label>
								<Input id="hop-origin" name="origin" />
							</div>
							<div class="space-y-2 md:col-span-2">
								<label for="hop-notes" class="text-sm font-medium">{m.recipe_note()}</label>
								<Textarea id="hop-notes" name="notes" rows={3} />
							</div>
						</div>
						<Button type="submit">{m.add_hop()}</Button>
					</form>
				</section>

				<section class="rounded-2xl border bg-background/70 p-4">
					<div class="mb-4 flex items-center justify-between gap-3">
						<div>
							<h3 class="font-semibold">{m.ingredient_kind_yeasts()}</h3>
							<p class="text-sm text-muted-foreground">
								{m.ingredient_kind_yeasts_description()}
							</p>
						</div>
						<Badge variant="outline">{data.ingredients.yeasts.length}</Badge>
					</div>

					{#if data.ingredients.yeasts.length}
						<div class="space-y-3">
							{#each data.ingredients.yeasts as item (`${item.yeastId}-${item.sortOrder}`)}
								<div class="rounded-2xl border bg-card/90 p-4">
									<div class="flex flex-wrap items-start justify-between gap-3">
										<div class="space-y-1">
											<a
												class="font-semibold hover:underline"
												href={resolve(`/app/ingredients/yeasts/${item.ingredient.id}`)}
											>
												{item.ingredient.name}
											</a>
											<p class="text-sm text-muted-foreground">
												{item.ingredient.lab || item.ingredient.supplier || m.saved_culture()}
												{#if item.ingredient.attenuationPct}
													. {formatMetric(item.ingredient.attenuationPct, 1)}% {m.attenuation_pct()}
												{/if}
											</p>
											<p class="text-xs tracking-[0.16em] text-muted-foreground uppercase">
												{item.amountIsWeight
													? `${formatMetric(item.amountKg, 3)} kg`
													: `${formatMetric(item.amountL, 3)} L`}
												{#if item.cellsBillions}
													. {formatMetric(item.cellsBillions, 0)} {m.cells_billions()}
												{/if}
												{#if item.isStarterRequired}
													. {m.starter_required()}
												{/if}
											</p>
											{#if item.notes}
												<p class="text-sm text-muted-foreground">{item.notes}</p>
											{/if}
										</div>

										<form method="POST" action="?/removeYeast">
											<input type="hidden" name="yeastId" value={item.yeastId} />
											<input type="hidden" name="sortOrder" value={item.sortOrder} />
											<Button type="submit" variant="outline">{m.remove()}</Button>
										</form>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
							{m.no_yeast_added_yet()}
						</div>
					{/if}

					<form
						method="POST"
						action="?/addYeast"
						class="mt-4 space-y-3 rounded-2xl border border-dashed p-4"
					>
						<div class="grid gap-3 md:grid-cols-2">
							<div class="space-y-2 md:col-span-2">
								<label for="yeast-name" class="text-sm font-medium">{m.yeast_name()}</label>
								<Input id="yeast-name" name="name" list={yeastSuggestionId} required />
								<datalist id={yeastSuggestionId}>
									{#each data.ingredientLibrary.yeasts as ingredient (ingredient.id)}
										<option value={ingredient.name}></option>
									{/each}
								</datalist>
							</div>
							<div class="space-y-2">
								<label for="yeast-lab" class="text-sm font-medium">{m.lab_label()}</label>
								<Input id="yeast-lab" name="lab" />
							</div>
							<div class="space-y-2">
								<label for="yeast-form" class="text-sm font-medium">{m.form_label()}</label>
								<Input id="yeast-form" name="form" placeholder={m.dry_liquid_placeholder()} />
							</div>
							<div class="space-y-2">
								<label for="yeast-type" class="text-sm font-medium">{m.type()}</label>
								<Input id="yeast-type" name="type" placeholder={m.ale_lager_wine_placeholder()} />
							</div>
							<div class="space-y-2">
								<label for="yeast-attenuation" class="text-sm font-medium"
									>{m.attenuation_pct()}</label
								>
								<Input id="yeast-attenuation" name="attenuationPct" type="number" step="0.01" />
							</div>
							<div class="space-y-2">
								<label for="yeast-amount-weight" class="text-sm font-medium">{m.amount_kg()}</label>
								<Input id="yeast-amount-weight" name="amountKg" type="number" step="0.0001" />
							</div>
							<div class="space-y-2">
								<label for="yeast-amount-volume" class="text-sm font-medium">{m.amount_l()}</label>
								<Input id="yeast-amount-volume" name="amountL" type="number" step="0.0001" />
							</div>
							<div class="space-y-2">
								<label for="yeast-cells" class="text-sm font-medium"
									>{m.cells_billions_label()}</label
								>
								<Input id="yeast-cells" name="cellsBillions" type="number" step="0.01" />
							</div>
							<div class="space-y-2">
								<label for="yeast-amount-mode" class="text-sm font-medium">{m.amount_mode()}</label>
								<select
									id="yeast-amount-mode"
									name="amountIsWeight"
									class="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background transition-[color,box-shadow] outline-none focus-visible:ring-1 focus-visible:ring-ring"
								>
									<option value="weight">{m.weight()}</option>
									<option value="volume">{m.volume()}</option>
								</select>
							</div>
							<div class="space-y-2 md:col-span-2">
								<label for="yeast-notes" class="text-sm font-medium">{m.recipe_note()}</label>
								<Textarea id="yeast-notes" name="notes" rows={3} />
							</div>
						</div>
						<label class="flex items-center gap-3 rounded-2xl border bg-card/80 px-4 py-3">
							<Checkbox name="isStarterRequired" value="on" />
							<div>
								<p class="text-sm font-medium">{m.starter_required()}</p>
								<p class="text-xs text-muted-foreground">{m.starter_required_description()}</p>
							</div>
						</label>
						<Button type="submit">{m.add_yeast()}</Button>
					</form>
				</section>

				<section class="rounded-2xl border bg-background/70 p-4">
					<div class="mb-4 flex items-center justify-between gap-3">
						<div>
							<h3 class="font-semibold">{m.ingredient_kind_miscs()}</h3>
							<p class="text-sm text-muted-foreground">
								{m.ingredient_kind_miscs_description()}
							</p>
						</div>
						<Badge variant="outline">{data.ingredients.miscs.length}</Badge>
					</div>

					{#if data.ingredients.miscs.length}
						<div class="space-y-3">
							{#each data.ingredients.miscs as item (`${item.miscId}-${item.sortOrder}`)}
								<div class="rounded-2xl border bg-card/90 p-4">
									<div class="flex flex-wrap items-start justify-between gap-3">
										<div class="space-y-1">
											<a
												class="font-semibold hover:underline"
												href={resolve(`/app/ingredients/miscs/${item.ingredient.id}`)}
											>
												{item.ingredient.name}
											</a>
											<p class="text-sm text-muted-foreground">
												{item.ingredient.type}
												{#if item.ingredient.useFor}
													. {item.ingredient.useFor}
												{/if}
											</p>
											<p class="text-xs tracking-[0.16em] text-muted-foreground uppercase">
												{item.amountIsWeight
													? `${formatMetric(item.amountKg, 3)} kg`
													: `${formatMetric(item.amountL, 3)} L`}
												{#if item.timeMin != null}
													. {item.timeMin} {m.time_min()}
												{/if}
												. {usePhaseLabel(item.usePhase)}
											</p>
											{#if item.notes}
												<p class="text-sm text-muted-foreground">{item.notes}</p>
											{/if}
										</div>

										<form method="POST" action="?/removeMisc">
											<input type="hidden" name="miscId" value={item.miscId} />
											<input type="hidden" name="sortOrder" value={item.sortOrder} />
											<Button type="submit" variant="outline">Remove</Button>
										</form>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
							{m.no_extra_ingredients_added_yet()}
						</div>
					{/if}

					<form
						method="POST"
						action="?/addMisc"
						class="mt-4 space-y-3 rounded-2xl border border-dashed p-4"
					>
						<div class="grid gap-3 md:grid-cols-2">
							<div class="space-y-2 md:col-span-2">
								<label for="misc-name" class="text-sm font-medium">{m.ingredient_name()}</label>
								<Input id="misc-name" name="name" list={miscSuggestionId} required />
								<datalist id={miscSuggestionId}>
									{#each data.ingredientLibrary.miscs as ingredient (ingredient.id)}
										<option value={ingredient.name}></option>
									{/each}
								</datalist>
							</div>
							<div class="space-y-2">
								<label for="misc-type" class="text-sm font-medium">{m.type()}</label>
								<Input
									id="misc-type"
									name="type"
									placeholder={m.ingredient_kind_miscs_description()}
									required
								/>
							</div>
							<div class="space-y-2">
								<label for="misc-use-for" class="text-sm font-medium">{m.use_for()}</label>
								<Input
									id="misc-use-for"
									name="useFor"
									placeholder="Flavor, clarity, fermentation..."
								/>
							</div>
							<div class="space-y-2">
								<label for="misc-amount-weight" class="text-sm font-medium">{m.amount_kg()}</label>
								<Input id="misc-amount-weight" name="amountKg" type="number" step="0.0001" />
							</div>
							<div class="space-y-2">
								<label for="misc-amount-volume" class="text-sm font-medium">{m.amount_l()}</label>
								<Input id="misc-amount-volume" name="amountL" type="number" step="0.0001" />
							</div>
							<div class="space-y-2">
								<label for="misc-time" class="text-sm font-medium">{m.time_min()}</label>
								<Input id="misc-time" name="timeMin" type="number" step="1" />
							</div>
							<div class="space-y-2">
								<label for="misc-use" class="text-sm font-medium">{m.use()}</label>
								<select
									id="misc-use"
									name="usePhase"
									class="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background transition-[color,box-shadow] outline-none focus-visible:ring-1 focus-visible:ring-ring"
								>
									{#each miscUseOptions as option (option.value)}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
							</div>
							<div class="space-y-2">
								<label for="misc-amount-mode" class="text-sm font-medium">{m.amount_mode()}</label>
								<select
									id="misc-amount-mode"
									name="amountIsWeight"
									class="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background transition-[color,box-shadow] outline-none focus-visible:ring-1 focus-visible:ring-ring"
								>
									<option value="weight">{m.weight()}</option>
									<option value="volume">{m.volume()}</option>
								</select>
							</div>
							<div class="space-y-2 md:col-span-2">
								<label for="misc-description" class="text-sm font-medium">{m.notes()}</label>
								<Textarea id="misc-description" name="description" rows={3} />
							</div>
							<div class="space-y-2 md:col-span-2">
								<label for="misc-notes" class="text-sm font-medium">{m.recipe_note()}</label>
								<Textarea id="misc-notes" name="notes" rows={3} />
							</div>
						</div>
						<Button type="submit">{m.add_ingredient()}</Button>
					</form>
				</section>
			</CardContent>
		</Card>
	</RecipeForm>
</div>
