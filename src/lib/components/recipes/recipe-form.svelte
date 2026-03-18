<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { RecipeSummary } from '$lib/server/recipes';
	import {
		BREW_TYPES,
		BREW_TYPE_CONFIG,
		IBU_FORMULAS,
		IBU_FORMULA_LABELS,
		RECIPE_FIELD_LABELS,
		RECIPE_FIELD_KEYS,
		RECIPE_MODULE_DESCRIPTIONS,
		RECIPE_MODULE_KEYS,
		RECIPE_MODULE_LABELS,
		getHiddenFieldsForBrewType
	} from '$lib/recipes/config';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';

	type EquipmentOption = {
		id: string;
		name: string;
	};

	type Props = {
		recipe?: RecipeSummary;
		equipment: EquipmentOption[];
		formId: string;
		formAction: string;
		deleteAction?: string;
		children?: Snippet;
	};

	let { recipe, equipment, formId, formAction, deleteAction, children }: Props = $props();

	const getInitialBrewType = () => recipe?.brewType ?? 'beer';
	const getInitialHiddenFields = () =>
		recipe?.hiddenFields ?? getHiddenFieldsForBrewType(getInitialBrewType());
	const getInitialAdvancedMode = () => recipe?.advancedMode ?? false;
	const getInitialEnabledModules = () => recipe?.enabledModules ?? ['core'];
	const getInitialIbuFormula = () => recipe?.ibuFormula ?? 'tinseth';

	let brewType = $state(getInitialBrewType());
	let advancedMode = $state(getInitialAdvancedMode());
	let hiddenFields = $state<string[]>(getInitialHiddenFields());
	let enabledModules = $state<string[]>(getInitialEnabledModules());
	let ibuFormula = $state(getInitialIbuFormula());

	const fieldSet = $derived(new Set(hiddenFields));
	const hiddenFieldsJson = $derived(JSON.stringify(hiddenFields));
	const normalizedEnabledModules = $derived(
		advancedMode ? ['core', ...enabledModules.filter((module) => module !== 'core')] : ['core']
	);
	const enabledModulesJson = $derived(JSON.stringify(normalizedEnabledModules));
	const brewTypeConfig = $derived(BREW_TYPE_CONFIG[brewType]);
	const enabledModuleSet = $derived(new Set(normalizedEnabledModules));

	function applyBrewTypePreset(nextBrewType: (typeof BREW_TYPES)[number]) {
		brewType = nextBrewType;
		hiddenFields = [...getHiddenFieldsForBrewType(nextBrewType)];
	}

	function toggleField(field: string, enabled: boolean) {
		if (enabled) {
			hiddenFields = hiddenFields.filter((entry) => entry !== field);
			return;
		}

		if (!fieldSet.has(field)) {
			hiddenFields = [...hiddenFields, field];
		}
	}

	function isVisible(field: string) {
		return !fieldSet.has(field);
	}

	function toggleModule(module: string, enabled: boolean) {
		if (module === 'core') {
			return;
		}

		if (enabled) {
			enabledModules = [...new Set([...enabledModules, module])];
			return;
		}

		enabledModules = enabledModules.filter((entry) => entry !== module);
	}
</script>

<div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
	<div class="space-y-6">
		{@render children?.()}

		<form id={formId} method="POST" action={formAction} class="space-y-6">
			<input type="hidden" name="hiddenFields" value={hiddenFieldsJson} />
			<input type="hidden" name="enabledModules" value={enabledModulesJson} />
			<input type="hidden" name="ibuFormula" value={ibuFormula} />
			<input type="hidden" name="brewType" value={brewType} />
			{#if advancedMode}
				<input type="hidden" name="advancedMode" value="on" />
			{/if}

			<Card class="border-border/70 bg-card/95 shadow-sm">
				<CardHeader class="space-y-4">
					<div class="flex flex-wrap items-center gap-2">
						{#each BREW_TYPES as type}
							<button
								type="button"
								class={`rounded-full border px-3 py-1 text-sm transition ${
									brewType === type
										? 'border-primary bg-primary text-primary-foreground'
										: 'bg-background hover:bg-accent'
								}`}
								onclick={() => applyBrewTypePreset(type)}
							>
								{BREW_TYPE_CONFIG[type].label}
							</button>
						{/each}
					</div>
				</CardHeader>

				<CardContent class="space-y-5">
					<section class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2 md:col-span-2">
							<label for="name" class="text-sm font-medium">Recipe name</label>
							<Input id="name" name="name" required value={recipe?.name ?? ''} />
						</div>

						{#if isVisible('style')}
							<div class="space-y-2">
								<label for="style" class="text-sm font-medium">{brewTypeConfig.styleLabel}</label>
								<Input id="style" name="style" value={recipe?.style ?? ''} />
							</div>
						{/if}

						<div class="space-y-2">
							<label for="targetBatchSizeL" class="text-sm font-medium">Batch size (L)</label>
							<Input
								id="targetBatchSizeL"
								name="targetBatchSizeL"
								type="number"
								step="0.001"
								value={recipe?.targetBatchSizeL ?? '20'}
								required
							/>
						</div>

						{#if isVisible('boilTimeMin')}
							<div class="space-y-2">
								<label for="boilTimeMin" class="text-sm font-medium"
									>{brewTypeConfig.processTimeLabel}</label
								>
								<Input
									id="boilTimeMin"
									name="boilTimeMin"
									type="number"
									step="1"
									value={recipe?.boilTimeMin ?? 60}
									required
								/>
							</div>
						{/if}

						{#if isVisible('targetOg')}
							<div class="space-y-2">
								<label for="targetOg" class="text-sm font-medium">Original gravity target</label>
								<Input
									id="targetOg"
									name="targetOg"
									type="number"
									step="0.001"
									value={recipe?.targetOg ?? ''}
								/>
							</div>
						{/if}

						{#if isVisible('targetFg')}
							<div class="space-y-2">
								<label for="targetFg" class="text-sm font-medium">Final gravity target</label>
								<Input
									id="targetFg"
									name="targetFg"
									type="number"
									step="0.001"
									value={recipe?.targetFg ?? ''}
								/>
							</div>
						{/if}

						{#if isVisible('targetIbu')}
							<div class="space-y-2">
								<label for="targetIbu" class="text-sm font-medium">Bitterness target (IBU)</label>
								<Input
									id="targetIbu"
									name="targetIbu"
									type="number"
									step="0.01"
									value={recipe?.targetIbu ?? ''}
								/>
							</div>
						{/if}

						{#if isVisible('targetSrm')}
							<div class="space-y-2">
								<label for="targetSrm" class="text-sm font-medium">Color target (SRM)</label>
								<Input
									id="targetSrm"
									name="targetSrm"
									type="number"
									step="0.01"
									value={recipe?.targetSrm ?? ''}
								/>
							</div>
						{/if}

						{#if isVisible('equipmentId')}
							<div class="space-y-2 md:col-span-2">
								<label for="equipmentId" class="text-sm font-medium">Brewing setup</label>
								<select
									id="equipmentId"
									name="equipmentId"
									class="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background transition-[color,box-shadow] outline-none focus-visible:ring-1 focus-visible:ring-ring"
								>
									<option value="">Use default setup</option>
									{#each equipment as profile (profile.id)}
										<option value={profile.id} selected={profile.id === recipe?.equipmentId}
											>{profile.name}</option
										>
									{/each}
								</select>
							</div>
						{/if}

						{#if isVisible('notes')}
							<div class="space-y-2 md:col-span-2">
								<label for="notes" class="text-sm font-medium">Brewer's notes</label>
								<Textarea id="notes" name="notes" rows={5} value={recipe?.notes ?? ''} />
							</div>
						{/if}
					</section>
				</CardContent>
			</Card>
		</form>
	</div>

	<aside class="space-y-6 xl:sticky xl:top-6 xl:self-start">
		<Card class="border-border/70 bg-card/95 shadow-sm">
			<CardHeader>
				<CardTitle class="text-xl font-bold">Recipe settings</CardTitle>
			</CardHeader>
			<CardContent class="space-y-6">
				<div class="space-y-3">
					<div>
						<p class="text-sm font-semibold">Visible sections</p>
						<p class="text-sm text-muted-foreground">
							Choose which planning details appear in this recipe.
						</p>
					</div>
					<div class="grid gap-3">
						{#each RECIPE_FIELD_KEYS as field}
							<label
								class="flex items-center justify-between gap-3 rounded-2xl border bg-background/80 px-4 py-3"
							>
								<div class="min-w-0">
									<p class="text-sm font-medium">
										{field === 'style' ? brewTypeConfig.styleLabel : RECIPE_FIELD_LABELS[field]}
									</p>
								</div>
								<Checkbox
									checked={isVisible(field)}
									onclick={() => toggleField(field, !isVisible(field))}
								/>
							</label>
						{/each}
					</div>
				</div>

				<div class="space-y-3 border-t pt-6">
					<div class="flex items-center gap-2">
						<Badge variant="secondary">{BREW_TYPE_CONFIG[brewType].label}</Badge>
					</div>

					<label
						class="flex items-center justify-between gap-3 rounded-2xl border bg-background/80 px-4 py-3"
					>
						<div>
							<p class="text-sm font-medium">Show advanced planning tools</p>
							<p class="text-xs text-muted-foreground">Keep this off for a simpler recipe sheet.</p>
						</div>
						<Checkbox bind:checked={advancedMode} />
					</label>

					<div class="space-y-3">
						<div>
							<p class="text-sm font-semibold">Bitterness estimate</p>
							<p class="text-sm text-muted-foreground">
								Choose the bitterness method that best matches how you like to plan recipes.
							</p>
						</div>
						<div class="grid gap-2">
							{#each IBU_FORMULAS as formula}
								<button
									type="button"
									class={`flex flex-col items-start rounded-2xl border px-4 py-3 text-left text-sm transition ${
										ibuFormula === formula
											? 'border-primary bg-primary text-primary-foreground'
											: 'bg-background hover:bg-accent'
									}`}
									onclick={() => (ibuFormula = formula)}
								>
									<span class="font-medium">{IBU_FORMULA_LABELS[formula]}</span>
									<span class="text-xs opacity-80">
										{formula === 'tinseth'
											? 'A dependable default for most modern recipes.'
											: 'A classic estimate often used in older brewing software.'}
									</span>
								</button>
							{/each}
						</div>
					</div>

					<div class="space-y-3">
						<div>
							<p class="text-sm font-semibold">Extra planning tools</p>
							<p class="text-sm text-muted-foreground">
								Turn on only the tools you want to use for this recipe.
							</p>
						</div>
						<div class="grid gap-3">
							{#each RECIPE_MODULE_KEYS as module}
								<label
									class="flex items-center justify-between gap-3 rounded-2xl border bg-background/80 px-4 py-3"
								>
									<div class="min-w-0">
										<p class="text-sm font-medium">{RECIPE_MODULE_LABELS[module]}</p>
										<p class="text-xs text-muted-foreground">
											{RECIPE_MODULE_DESCRIPTIONS[module]}
										</p>
									</div>
									<Checkbox
										checked={enabledModuleSet.has(module)}
										disabled={module === 'core' || !advancedMode}
										onclick={() => toggleModule(module, !enabledModuleSet.has(module))}
									/>
								</label>
							{/each}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>

		{#if deleteAction}
			<Card class="border-border/70 bg-card/95 shadow-sm">
				<CardHeader>
					<CardTitle class="text-xl font-bold">Delete recipe</CardTitle>
				</CardHeader>
				<CardContent>
					<p class="mb-4 text-sm text-muted-foreground">
						Remove this recipe if you no longer need it.
					</p>
					<form method="POST" action={deleteAction}>
						<button
							type="submit"
							class="inline-flex h-9 items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-destructive/90"
						>
							Delete recipe
						</button>
					</form>
				</CardContent>
			</Card>
		{/if}
	</aside>
</div>
