<script lang="ts">
	import type { EquipmentRecord } from '$lib/server/equipment';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as m from '$lib/paraglide/messages';

	type Props = {
		profile?: EquipmentRecord;
		formId?: string;
		formAction: string;
		submitLabel: string;
		cancelHref: string;
		deleteAction?: string;
	};

	let { profile, formId, formAction, submitLabel, cancelHref, deleteAction }: Props = $props();
	const getInitialIsDefault = () => profile?.isDefault ?? false;
	let isDefault = $state(getInitialIsDefault());
</script>

<form id={formId} method="POST" action={formAction} class="space-y-6">
	<div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
		<Card class="border-border/70 bg-card/95 shadow-sm">
			<CardHeader>
				<CardTitle class="text-xl font-bold">{m.profile()}</CardTitle>
			</CardHeader>
			<CardContent class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2 md:col-span-2">
					<label for="name" class="text-sm font-medium">{m.name_label()}</label>
					<Input id="name" name="name" required value={profile?.name ?? ''} />
				</div>

				<div class="space-y-2">
					<label for="batchSizeL" class="text-sm font-medium">{m.batch_size_label()}</label>
					<Input
						id="batchSizeL"
						name="batchSizeL"
						type="number"
						step="0.001"
						value={profile?.batchSizeL ?? '20'}
						required
					/>
				</div>

				<div class="space-y-2">
					<label for="efficiencyPct" class="text-sm font-medium">{m.efficiency()}</label>
					<Input
						id="efficiencyPct"
						name="efficiencyPct"
						type="number"
						step="0.01"
						value={profile?.efficiencyPct ?? '75'}
						required
					/>
				</div>

				<div class="space-y-2">
					<label for="boilOffRateLph" class="text-sm font-medium">{m.boil_off()}</label>
					<Input
						id="boilOffRateLph"
						name="boilOffRateLph"
						type="number"
						step="0.001"
						value={profile?.boilOffRateLph ?? '3.5'}
						required
					/>
				</div>

				<div class="space-y-2">
					<label for="mashTunLossL" class="text-sm font-medium">{m.mash_loss()} (L)</label>
					<Input
						id="mashTunLossL"
						name="mashTunLossL"
						type="number"
						step="0.001"
						value={profile?.mashTunLossL ?? '0'}
					/>
				</div>

				<div class="space-y-2 md:col-span-2">
					<label for="trubLossL" class="text-sm font-medium">{m.trub_loss()} (L)</label>
					<Input
						id="trubLossL"
						name="trubLossL"
						type="number"
						step="0.001"
						value={profile?.trubLossL ?? '0'}
					/>
				</div>

				<div class="space-y-2 md:col-span-2">
					<label for="description" class="text-sm font-medium">{m.notes()}</label>
					<Textarea
						id="description"
						name="description"
						rows={4}
						value={profile?.description ?? ''}
					/>
				</div>
			</CardContent>
		</Card>

		<Card class="border-border/70 bg-card/95 shadow-sm">
			<CardHeader>
				<CardTitle class="text-xl font-bold">{m.options()}</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<label
					class="flex items-center justify-between gap-3 rounded-2xl border bg-background/80 px-4 py-3"
				>
					<p class="text-sm font-medium">{m.default_profile()}</p>
					<Checkbox bind:checked={isDefault} />
				</label>
				{#if isDefault}
					<input type="hidden" name="isDefault" value="on" />
				{/if}

				<div class="flex flex-col gap-3">
					<Button type="submit">{submitLabel}</Button>
					<Button href={cancelHref} variant="outline">{m.back()}</Button>
					{#if deleteAction}
						<Button type="submit" formaction={deleteAction} variant="ghost">{m.delete()}</Button>
					{/if}
				</div>
			</CardContent>
		</Card>
	</div>
</form>
