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

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const fermentableSuggestionId = 'fermentable-suggestions';
	const hopSuggestionId = 'hop-suggestions';
	const yeastSuggestionId = 'yeast-suggestions';
	const miscSuggestionId = 'misc-suggestions';
	const hopUseOptions = [
		{ value: 'mash', label: 'Mash' },
		{ value: 'first_wort', label: 'First wort' },
		{ value: 'boil', label: 'Boil' },
		{ value: 'whirlpool', label: 'Whirlpool' },
		{ value: 'dry_hop', label: 'Dry hop' }
	] as const;
	const miscUseOptions = [
		{ value: 'mash', label: 'Mash' },
		{ value: 'boil', label: 'Boil' },
		{ value: 'whirlpool', label: 'Whirlpool' },
		{ value: 'fermentation', label: 'Fermentation' },
		{ value: 'packaging', label: 'Packaging' }
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

	const recipeDetailHeaderActions = $derived([
		{
			label: 'Start batch',
			href: resolve(`/app/batches/new?recipeId=${data.recipe.id}`),
			variant: 'secondary'
		},
		{ label: 'Export XML', href: resolve(`/app/recipes/${data.recipe.id}/beerxml`), variant: 'outline' },
		{ label: 'Back', href: resolve('/app/recipes'), variant: 'outline' },
		{ label: 'Save changes', type: 'submit', form: 'recipe-edit-form', variant: 'default' }
	] satisfies AppPageHeaderAction[]);

</script>

<div class="space-y-6">
	<PageHeaderConfig
		eyebrow="Recipes"
		title={data.recipe.name}
		description="Review your targets, ingredients, brewing setup, and planning details in one place."
		actions={recipeDetailHeaderActions}
	/>

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>Could not save recipe</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<RecipeForm
		formId="recipe-edit-form"
		recipe={data.recipe}
		equipment={data.equipment}
		formAction="?/update"
		deleteAction="?/delete"
	>
		<div class="grid gap-4 lg:grid-cols-2">
			<Card class="border-border/70 bg-card/95 shadow-sm">
				<CardHeader class="space-y-3">
					<div class="flex flex-wrap items-center gap-2">
						<CardTitle class="text-xl font-bold">Recipe snapshot</CardTitle>
						<Badge variant="secondary"
							>{IBU_FORMULA_LABELS[data.engineSummary.process.ibuFormula]}</Badge
						>
						{#if data.engineSummary.process.usesGenericEquipmentProfile}
							<Badge>Default setup</Badge>
						{/if}
					</div>
					<CardDescription>
						This summary shows your saved targets, brew-day volumes, and the current estimates for
						this recipe.
					</CardDescription>
					<div class="flex flex-wrap gap-2">
						{#each data.engineSummary.modules as module (module)}
							<Badge variant="outline">{moduleLabel(module)}</Badge>
						{/each}
					</div>
				</CardHeader>
				<CardContent class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					<div class="rounded-2xl border bg-background/80 p-4">
						<p class="text-xs tracking-[0.2em] text-muted-foreground uppercase">Original gravity</p>
						<p class="mt-2 text-2xl font-black">
							{formatMetric(data.engineSummary.computed.og, 3)}
						</p>
						<p class="mt-1 text-sm text-muted-foreground">
							Target {formatMetric(data.engineSummary.targets.og, 3)}
						</p>
					</div>
					<div class="rounded-2xl border bg-background/80 p-4">
						<p class="text-xs tracking-[0.2em] text-muted-foreground uppercase">Final gravity</p>
						<p class="mt-2 text-2xl font-black">
							{formatMetric(data.engineSummary.computed.fg, 3)}
						</p>
						<p class="mt-1 text-sm text-muted-foreground">
							Target {formatMetric(data.engineSummary.targets.fg, 3)}
						</p>
					</div>
					<div class="rounded-2xl border bg-background/80 p-4">
						<p class="text-xs tracking-[0.2em] text-muted-foreground uppercase">Estimated ABV</p>
						<p class="mt-2 text-2xl font-black">
							{formatMetric(data.engineSummary.computed.abvPct, 2)}%
						</p>
					</div>
					<div class="rounded-2xl border bg-background/80 p-4">
						<p class="text-xs tracking-[0.2em] text-muted-foreground uppercase">Bitterness</p>
						<p class="mt-2 text-2xl font-black">
							{formatMetric(data.engineSummary.computed.ibu, 1)}
						</p>
						<p class="mt-1 text-sm text-muted-foreground">
							Target {formatMetric(data.engineSummary.targets.ibu, 1)}
						</p>
					</div>
					<div class="rounded-2xl border bg-background/80 p-4">
						<p class="text-xs tracking-[0.2em] text-muted-foreground uppercase">Color</p>
						<p class="mt-2 text-2xl font-black">
							{formatMetric(data.engineSummary.computed.srm, 1)}
						</p>
						<p class="mt-1 text-sm text-muted-foreground">
							Target {formatMetric(data.engineSummary.targets.srm, 1)}
						</p>
					</div>
					<div class="rounded-2xl border bg-background/80 p-4">
						<p class="text-xs tracking-[0.2em] text-muted-foreground uppercase">Pre-boil volume</p>
						<p class="mt-2 text-2xl font-black">
							{formatMetric(data.engineSummary.batch.preBoilVolumeL, 1)} L
						</p>
						<p class="mt-1 text-sm text-muted-foreground">
							Liquor {formatMetric(data.engineSummary.batch.totalLiquorRequirementL, 1)} L
						</p>
					</div>
				</CardContent>
			</Card>

			<Card class="border-border/70 bg-card/95 shadow-sm">
				<CardHeader>
					<CardTitle class="text-xl font-bold">Things to review</CardTitle>
					<CardDescription>
						Helpful checks to keep your saved targets and brewing setup aligned.
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-3">
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="rounded-2xl border bg-background/80 p-4">
							<p class="text-xs tracking-[0.2em] text-muted-foreground uppercase">Efficiency</p>
							<p class="mt-2 text-2xl font-black">
								{formatMetric(data.engineSummary.process.brewhouseEfficiencyPct, 1)}%
							</p>
						</div>
						<div class="rounded-2xl border bg-background/80 p-4">
							<p class="text-xs tracking-[0.2em] text-muted-foreground uppercase">Boil-off loss</p>
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
							Everything looks good right now.
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>

		<Card class="border-border/70 bg-card/95 shadow-sm">
			<CardHeader class="space-y-3">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div>
						<CardTitle class="text-xl font-bold">Ingredients</CardTitle>
						<CardDescription>
							Add ingredients to this recipe and reuse anything you have already saved in your
							ingredient library.
						</CardDescription>
					</div>
					<Button href={resolve('/app/ingredients')} variant="outline"
						>Open ingredient library</Button
					>
				</div>
			</CardHeader>
			<CardContent class="grid gap-4 xl:grid-cols-2">
				<section class="rounded-2xl border bg-background/70 p-4">
					<div class="mb-4 flex items-center justify-between gap-3">
						<div>
							<h3 class="font-semibold">Fermentables</h3>
							<p class="text-sm text-muted-foreground">
								Malt, sugar, juice concentrate, extract, and fermentable adjuncts.
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
												{item.usePhase} . Yield {formatMetric(item.ingredient.yieldPct, 1)}% . {formatMetric(
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
											<Button type="submit" variant="outline">Remove</Button>
										</form>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
							No fermentables added yet.
						</div>
					{/if}

					<form
						method="POST"
						action="?/addFermentable"
						class="mt-4 space-y-3 rounded-2xl border border-dashed p-4"
					>
						<div class="grid gap-3 md:grid-cols-2">
							<div class="space-y-2 md:col-span-2">
								<label for="fermentable-name" class="text-sm font-medium">Ingredient name</label>
								<Input id="fermentable-name" name="name" list={fermentableSuggestionId} required />
								<datalist id={fermentableSuggestionId}>
									{#each data.ingredientLibrary.fermentables as ingredient (ingredient.id)}
										<option value={ingredient.name}></option>
									{/each}
								</datalist>
							</div>
							<div class="space-y-2">
								<label for="fermentable-amount" class="text-sm font-medium">Amount (kg)</label>
								<Input
									id="fermentable-amount"
									name="amountKg"
									type="number"
									step="0.001"
									required
								/>
							</div>
							<div class="space-y-2">
								<label for="fermentable-phase" class="text-sm font-medium">Use phase</label>
								<select
									id="fermentable-phase"
									name="usePhase"
									class="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background transition-[color,box-shadow] outline-none focus-visible:ring-1 focus-visible:ring-ring"
								>
									<option value="mash">Mash</option>
									<option value="steep">Steep</option>
									<option value="boil">Boil</option>
									<option value="fermentation">Fermentation</option>
								</select>
							</div>
							<div class="space-y-2">
								<label for="fermentable-yield" class="text-sm font-medium">Yield (%)</label>
								<Input id="fermentable-yield" name="yieldPct" type="number" step="0.01" required />
							</div>
							<div class="space-y-2">
								<label for="fermentable-color" class="text-sm font-medium">Color (Lovibond)</label>
								<Input id="fermentable-color" name="colorLovibond" type="number" step="0.01" />
							</div>
							<div class="space-y-2">
								<label for="fermentable-type" class="text-sm font-medium">Type</label>
								<Input id="fermentable-type" name="type" placeholder="Grain, sugar, extract..." />
							</div>
							<div class="space-y-2">
								<label for="fermentable-brand" class="text-sm font-medium">Brand</label>
								<Input id="fermentable-brand" name="brand" />
							</div>
							<div class="space-y-2 md:col-span-2">
								<label for="fermentable-origin" class="text-sm font-medium">Origin</label>
								<Input id="fermentable-origin" name="origin" />
							</div>
							<div class="space-y-2 md:col-span-2">
								<label for="fermentable-notes" class="text-sm font-medium">Recipe note</label>
								<Textarea id="fermentable-notes" name="notes" rows={3} />
							</div>
						</div>
						<label class="flex items-center gap-3 rounded-2xl border bg-card/80 px-4 py-3">
							<Checkbox name="isExtract" value="on" />
							<div>
								<p class="text-sm font-medium">Treat as extract</p>
								<p class="text-xs text-muted-foreground">
									Useful for extract beer, juice concentrates, or syrup additions.
								</p>
							</div>
						</label>
						<Button type="submit">Add fermentable</Button>
					</form>
				</section>

				<section class="rounded-2xl border bg-background/70 p-4">
					<div class="mb-4 flex items-center justify-between gap-3">
						<div>
							<h3 class="font-semibold">Hops</h3>
							<p class="text-sm text-muted-foreground">
								Boil hops, whirlpool additions, mash hops, and dry hops.
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
												{item.usePhase}
												{#if item.timeMin != null}
													. {item.timeMin} min
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
											<Button type="submit" variant="outline">Remove</Button>
										</form>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
							No hops added yet.
						</div>
					{/if}

					<form
						method="POST"
						action="?/addHop"
						class="mt-4 space-y-3 rounded-2xl border border-dashed p-4"
					>
						<div class="grid gap-3 md:grid-cols-2">
							<div class="space-y-2 md:col-span-2">
								<label for="hop-name" class="text-sm font-medium">Hop name</label>
								<Input id="hop-name" name="name" list={hopSuggestionId} required />
								<datalist id={hopSuggestionId}>
									{#each data.ingredientLibrary.hops as ingredient (ingredient.id)}
										<option value={ingredient.name}></option>
									{/each}
								</datalist>
							</div>
							<div class="space-y-2">
								<label for="hop-amount" class="text-sm font-medium">Amount (kg)</label>
								<Input id="hop-amount" name="amountKg" type="number" step="0.0001" required />
							</div>
							<div class="space-y-2">
								<label for="hop-alpha" class="text-sm font-medium">Alpha acid (%)</label>
								<Input id="hop-alpha" name="alphaAcidPct" type="number" step="0.01" required />
							</div>
							<div class="space-y-2">
								<label for="hop-time" class="text-sm font-medium">Time (min)</label>
								<Input id="hop-time" name="timeMin" type="number" step="1" />
							</div>
							<div class="space-y-2">
								<label for="hop-use" class="text-sm font-medium">Use</label>
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
								<label for="hop-form" class="text-sm font-medium">Form</label>
								<Input id="hop-form" name="form" placeholder="Pellet, whole, plug..." />
							</div>
							<div class="space-y-2">
								<label for="hop-type" class="text-sm font-medium">Type</label>
								<Input id="hop-type" name="type" placeholder="Bittering, aroma, dual purpose..." />
							</div>
							<div class="space-y-2 md:col-span-2">
								<label for="hop-origin" class="text-sm font-medium">Origin</label>
								<Input id="hop-origin" name="origin" />
							</div>
							<div class="space-y-2 md:col-span-2">
								<label for="hop-notes" class="text-sm font-medium">Recipe note</label>
								<Textarea id="hop-notes" name="notes" rows={3} />
							</div>
						</div>
						<Button type="submit">Add hop</Button>
					</form>
				</section>

				<section class="rounded-2xl border bg-background/70 p-4">
					<div class="mb-4 flex items-center justify-between gap-3">
						<div>
							<h3 class="font-semibold">Yeast</h3>
							<p class="text-sm text-muted-foreground">
								Dry yeast, liquid cultures, and any pitch notes for this batch.
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
												{item.ingredient.lab || item.ingredient.supplier || 'Saved culture'}
												{#if item.ingredient.attenuationPct}
													. {formatMetric(item.ingredient.attenuationPct, 1)}% attenuation
												{/if}
											</p>
											<p class="text-xs tracking-[0.16em] text-muted-foreground uppercase">
												{item.amountIsWeight
													? `${formatMetric(item.amountKg, 3)} kg`
													: `${formatMetric(item.amountL, 3)} L`}
												{#if item.cellsBillions}
													. {formatMetric(item.cellsBillions, 0)}B cells
												{/if}
												{#if item.isStarterRequired}
													. starter
												{/if}
											</p>
											{#if item.notes}
												<p class="text-sm text-muted-foreground">{item.notes}</p>
											{/if}
										</div>

										<form method="POST" action="?/removeYeast">
											<input type="hidden" name="yeastId" value={item.yeastId} />
											<input type="hidden" name="sortOrder" value={item.sortOrder} />
											<Button type="submit" variant="outline">Remove</Button>
										</form>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
							No yeast added yet.
						</div>
					{/if}

					<form
						method="POST"
						action="?/addYeast"
						class="mt-4 space-y-3 rounded-2xl border border-dashed p-4"
					>
						<div class="grid gap-3 md:grid-cols-2">
							<div class="space-y-2 md:col-span-2">
								<label for="yeast-name" class="text-sm font-medium">Yeast name</label>
								<Input id="yeast-name" name="name" list={yeastSuggestionId} required />
								<datalist id={yeastSuggestionId}>
									{#each data.ingredientLibrary.yeasts as ingredient (ingredient.id)}
										<option value={ingredient.name}></option>
									{/each}
								</datalist>
							</div>
							<div class="space-y-2">
								<label for="yeast-lab" class="text-sm font-medium">Lab</label>
								<Input id="yeast-lab" name="lab" />
							</div>
							<div class="space-y-2">
								<label for="yeast-form" class="text-sm font-medium">Form</label>
								<Input id="yeast-form" name="form" placeholder="Dry, liquid..." />
							</div>
							<div class="space-y-2">
								<label for="yeast-type" class="text-sm font-medium">Type</label>
								<Input id="yeast-type" name="type" placeholder="Ale, lager, wine..." />
							</div>
							<div class="space-y-2">
								<label for="yeast-attenuation" class="text-sm font-medium">Attenuation (%)</label>
								<Input id="yeast-attenuation" name="attenuationPct" type="number" step="0.01" />
							</div>
							<div class="space-y-2">
								<label for="yeast-amount-weight" class="text-sm font-medium">Amount (kg)</label>
								<Input id="yeast-amount-weight" name="amountKg" type="number" step="0.0001" />
							</div>
							<div class="space-y-2">
								<label for="yeast-amount-volume" class="text-sm font-medium">Amount (L)</label>
								<Input id="yeast-amount-volume" name="amountL" type="number" step="0.0001" />
							</div>
							<div class="space-y-2">
								<label for="yeast-cells" class="text-sm font-medium">Cells (billions)</label>
								<Input id="yeast-cells" name="cellsBillions" type="number" step="0.01" />
							</div>
							<div class="space-y-2">
								<label for="yeast-amount-mode" class="text-sm font-medium">Amount mode</label>
								<select
									id="yeast-amount-mode"
									name="amountIsWeight"
									class="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background transition-[color,box-shadow] outline-none focus-visible:ring-1 focus-visible:ring-ring"
								>
									<option value="weight">Weight</option>
									<option value="volume">Volume</option>
								</select>
							</div>
							<div class="space-y-2 md:col-span-2">
								<label for="yeast-notes" class="text-sm font-medium">Pitch note</label>
								<Textarea id="yeast-notes" name="notes" rows={3} />
							</div>
						</div>
						<label class="flex items-center gap-3 rounded-2xl border bg-card/80 px-4 py-3">
							<Checkbox name="isStarterRequired" value="on" />
							<div>
								<p class="text-sm font-medium">Starter required</p>
								<p class="text-xs text-muted-foreground">
									Use this to flag cultures that need a starter before brew day.
								</p>
							</div>
						</label>
						<Button type="submit">Add yeast</Button>
					</form>
				</section>

				<section class="rounded-2xl border bg-background/70 p-4">
					<div class="mb-4 flex items-center justify-between gap-3">
						<div>
							<h3 class="font-semibold">Other ingredients</h3>
							<p class="text-sm text-muted-foreground">
								Nutrients, spices, finings, fruit, stabilizers, and other additions.
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
													. {item.timeMin} min
												{/if}
												. {item.usePhase}
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
							No extra ingredients added yet.
						</div>
					{/if}

					<form
						method="POST"
						action="?/addMisc"
						class="mt-4 space-y-3 rounded-2xl border border-dashed p-4"
					>
						<div class="grid gap-3 md:grid-cols-2">
							<div class="space-y-2 md:col-span-2">
								<label for="misc-name" class="text-sm font-medium">Ingredient name</label>
								<Input id="misc-name" name="name" list={miscSuggestionId} required />
								<datalist id={miscSuggestionId}>
									{#each data.ingredientLibrary.miscs as ingredient (ingredient.id)}
										<option value={ingredient.name}></option>
									{/each}
								</datalist>
							</div>
							<div class="space-y-2">
								<label for="misc-type" class="text-sm font-medium">Type</label>
								<Input
									id="misc-type"
									name="type"
									placeholder="Nutrient, spice, fining..."
									required
								/>
							</div>
							<div class="space-y-2">
								<label for="misc-use-for" class="text-sm font-medium">Use for</label>
								<Input
									id="misc-use-for"
									name="useFor"
									placeholder="Flavor, clarity, fermentation..."
								/>
							</div>
							<div class="space-y-2">
								<label for="misc-amount-weight" class="text-sm font-medium">Amount (kg)</label>
								<Input id="misc-amount-weight" name="amountKg" type="number" step="0.0001" />
							</div>
							<div class="space-y-2">
								<label for="misc-amount-volume" class="text-sm font-medium">Amount (L)</label>
								<Input id="misc-amount-volume" name="amountL" type="number" step="0.0001" />
							</div>
							<div class="space-y-2">
								<label for="misc-time" class="text-sm font-medium">Time (min)</label>
								<Input id="misc-time" name="timeMin" type="number" step="1" />
							</div>
							<div class="space-y-2">
								<label for="misc-use" class="text-sm font-medium">Use</label>
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
								<label for="misc-amount-mode" class="text-sm font-medium">Amount mode</label>
								<select
									id="misc-amount-mode"
									name="amountIsWeight"
									class="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background transition-[color,box-shadow] outline-none focus-visible:ring-1 focus-visible:ring-ring"
								>
									<option value="weight">Weight</option>
									<option value="volume">Volume</option>
								</select>
							</div>
							<div class="space-y-2 md:col-span-2">
								<label for="misc-description" class="text-sm font-medium">Description</label>
								<Textarea id="misc-description" name="description" rows={3} />
							</div>
							<div class="space-y-2 md:col-span-2">
								<label for="misc-notes" class="text-sm font-medium">Recipe note</label>
								<Textarea id="misc-notes" name="notes" rows={3} />
							</div>
						</div>
						<Button type="submit">Add ingredient</Button>
					</form>
				</section>
			</CardContent>
		</Card>
	</RecipeForm>
</div>
