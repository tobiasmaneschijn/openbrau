<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import type { AppPageHeaderAction } from '$lib/components/app/page-header';
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
	import {
		DEFAULT_USER_SETTINGS,
		createDateFormatter,
		createNumberFormatter,
		getEffectiveDateLocale,
		getEffectiveNumberLocale,
		getEffectiveTimeZone
	} from '$lib/settings';
	import * as m from '$lib/paraglide/messages';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const settingsHeaderActions: AppPageHeaderAction[] = [
		{ label: m.save_settings(), type: 'submit', form: 'settings-form', variant: 'default' }
	];

	const currentSettings = $derived(data.settings);
	let language = $state(DEFAULT_USER_SETTINGS.language);
	let dateLocale = $state(DEFAULT_USER_SETTINGS.dateLocale);
	let numberLocale = $state(DEFAULT_USER_SETTINGS.numberLocale);
	let timeZone = $state(DEFAULT_USER_SETTINGS.timeZone);
	let units = $state<'metric' | 'imperial'>(DEFAULT_USER_SETTINGS.units);
	let advancedMode = $state(DEFAULT_USER_SETTINGS.advancedMode);
	let registrationEnabled = $state(true);
	let newUsername = $state('');
	let newPassword = $state('');
	let newIsAdmin = $state(false);
	let editingUserId = $state<string | null>(null);
	let editUsername = $state('');
	let editPassword = $state('');
	let editIsAdmin = $state(false);
	let deleteUserId = $state<string | null>(null);

	$effect(() => {
		language = currentSettings.language;
		dateLocale = currentSettings.dateLocale;
		numberLocale = currentSettings.numberLocale;
		timeZone = currentSettings.timeZone;
		units = currentSettings.units;
		advancedMode = currentSettings.advancedMode;
		registrationEnabled = data.appSettings?.allowRegistrations ?? true;
	});

	const editingUser = $derived.by(() => data.users.find((user) => user.id === editingUserId) ?? null);
	const deletingUser = $derived.by(() => data.users.find((user) => user.id === deleteUserId) ?? null);

	function openEditUser(user: PageData['users'][number]) {
		editingUserId = user.id;
		editUsername = user.username;
		editPassword = '';
		editIsAdmin = user.isAdmin;
	}

	function closeEditUser() {
		editingUserId = null;
		editUsername = '';
		editPassword = '';
		editIsAdmin = false;
	}

	function closeDeleteUser() {
		deleteUserId = null;
	}

	const previewSettings = $derived({
		language,
		dateLocale,
		numberLocale,
		timeZone,
		units,
		advancedMode
	});

	const sampleDate = new Date('2026-03-18T14:35:00Z');
	const sampleGravity = 1.056;
	const sampleVolume = 23.5;

	const datePreview = $derived(
		createDateFormatter(previewSettings, {
			dateStyle: 'full',
			timeStyle: 'short'
		}).format(sampleDate)
	);

	const numberPreview = $derived(
		createNumberFormatter(previewSettings, {
			minimumFractionDigits: 3,
			maximumFractionDigits: 3
		}).format(sampleGravity)
	);

	const volumePreview = $derived(
		createNumberFormatter(previewSettings, {
			maximumFractionDigits: 1
		}).format(sampleVolume)
	);
</script>

<div class="space-y-6">
	<PageHeaderConfig
		eyebrow={m.app_workspace()}
		title={m.settings()}
		description={m.manage_interface_settings()}
		actions={settingsHeaderActions}
	/>

	{#if data.updated}
		<Alert>
			<AlertTitle>{m.settings_updated()}</AlertTitle>
			<AlertDescription>{m.settings_saved()}</AlertDescription>
		</Alert>
	{/if}

	{#if form?.message}
		<Alert variant="destructive">
			<AlertTitle>{m.could_not_save_settings()}</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<form id="settings-form" method="POST" action="?/update">
		<div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
			<div class="space-y-6">
				<Card class="border-border/70 bg-card/95 shadow-sm">
					<CardHeader>
						<CardTitle class="text-xl font-bold">{m.language_and_regional_format()}</CardTitle>
						<CardDescription>{m.choose_app_language()}</CardDescription>
					</CardHeader>
					<CardContent class="grid gap-4 md:grid-cols-2">
						<label class="space-y-2">
							<span class="text-sm font-medium">{m.app_language()}</span>
							<select
								name="language"
								bind:value={language}
								class="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background transition-[color,box-shadow] outline-none focus-visible:ring-1 focus-visible:ring-ring"
							>
								{#each data.languageOptions as option (option.value)}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
							<p class="text-xs text-muted-foreground">{m.choose_language_workspace()}</p>
						</label>

						<label class="space-y-2">
							<span class="text-sm font-medium">{m.time_zone()}</span>
							<Input name="timeZone" bind:value={timeZone} list="time-zone-options" />
							<datalist id="time-zone-options">
								<option value="system">{m.use_system_time_zone()}</option>
								{#each data.timeZoneOptions as zone (zone)}
									<option value={zone}></option>
								{/each}
							</datalist>
							<p class="text-xs text-muted-foreground">{m.time_zone_description()}</p>
						</label>

						<label class="space-y-2">
							<span class="text-sm font-medium">{m.date_format_locale()}</span>
							<select
								name="dateLocale"
								bind:value={dateLocale}
								class="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background transition-[color,box-shadow] outline-none focus-visible:ring-1 focus-visible:ring-ring"
							>
								{#each data.formatLocaleOptions as option (option.value)}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
							<p class="text-xs text-muted-foreground">{m.date_format_locale_description()}</p>
						</label>

						<label class="space-y-2">
							<span class="text-sm font-medium">{m.number_format_locale()}</span>
							<select
								name="numberLocale"
								bind:value={numberLocale}
								class="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background transition-[color,box-shadow] outline-none focus-visible:ring-1 focus-visible:ring-ring"
							>
								{#each data.formatLocaleOptions as option (option.value)}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
							<p class="text-xs text-muted-foreground">{m.number_format_locale_description()}</p>
						</label>
					</CardContent>
				</Card>

				<Card class="border-border/70 bg-card/95 shadow-sm">
					<CardHeader>
						<CardTitle class="text-xl font-bold">{m.brewing_defaults()}</CardTitle>
						<CardDescription>{m.brewing_defaults_description()}</CardDescription>
					</CardHeader>
					<CardContent class="grid gap-4 md:grid-cols-2">
						<label class="space-y-2">
							<span class="text-sm font-medium">{m.display_units()}</span>
							<select
								name="units"
								bind:value={units}
								class="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background transition-[color,box-shadow] outline-none focus-visible:ring-1 focus-visible:ring-ring"
							>
								{#each data.unitSystemOptions as option (option.value)}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
							<p class="text-xs text-muted-foreground">{m.choose_measurements()}</p>
						</label>

						<div class="rounded-2xl border border-border/70 bg-background/50 p-4">
							<div class="flex items-start justify-between gap-4">
								<div class="space-y-1">
									<p class="text-sm font-medium">{m.advanced_brewing_mode()}</p>
									<p class="text-xs text-muted-foreground">
										{m.advanced_brewing_mode_description()}
									</p>
								</div>
								<label class="inline-flex cursor-pointer items-center gap-2">
									<input
										name="advancedMode"
										type="checkbox"
										class="size-4 rounded border border-input"
										bind:checked={advancedMode}
									/>
									<span class="text-sm">{advancedMode ? m.on() : m.off()}</span>
								</label>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card class="border-border/70 bg-card/95 shadow-sm xl:sticky xl:top-6 xl:self-start">
				<CardHeader>
					<CardTitle class="text-xl font-bold">{m.preview()}</CardTitle>
					<CardDescription>{m.preview_description()}</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4 text-sm">
					<div class="rounded-2xl border border-border/70 bg-background/60 p-4">
						<p class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{m.date_and_time()}</p>
						<p class="mt-2 font-medium">{datePreview}</p>
						<p class="mt-1 text-xs text-muted-foreground">
							{m.current_locale({ locale: getEffectiveDateLocale(previewSettings) })} | {m.current_time_zone({ timeZone: getEffectiveTimeZone(previewSettings) })}
						</p>
					</div>

					<div class="rounded-2xl border border-border/70 bg-background/60 p-4">
						<p class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{m.number_formatting()}</p>
						<p class="mt-2 font-medium">{m.original_gravity_label({ value: numberPreview })}</p>
						<p class="mt-1 text-xs text-muted-foreground">{m.current_locale({ locale: getEffectiveNumberLocale(previewSettings) })}</p>
					</div>

					<div class="rounded-2xl border border-border/70 bg-background/60 p-4">
						<p class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{m.brewhouse_defaults()}</p>
						<p class="mt-2 font-medium">
							{m.volume_example({ value: volumePreview, unit: units === 'imperial' ? 'gal' : 'L' })}
						</p>
						<p class="mt-1 text-xs text-muted-foreground">{m.mode_label({ mode: advancedMode ? m.advanced_mode() : m.simple_mode() })}</p>
					</div>

					<div class="rounded-2xl border border-dashed border-border/70 bg-background/40 p-4 text-xs text-muted-foreground">
						{m.preview_language_note()}
					</div>
				</CardContent>
			</Card>
		</div>
	</form>

	{#if data.isAdmin}
		<div class="grid gap-6">
			<Card class="border-border/70 bg-card/95 shadow-sm">
				<CardHeader>
					<div class="flex flex-wrap items-start justify-between gap-3">
						<div class="space-y-1">
							<CardTitle class="text-xl font-bold">Registration access</CardTitle>
							<CardDescription>
								Control whether new users can create accounts on this installation.
							</CardDescription>
						</div>
						<Badge variant="secondary" class="rounded-full px-3 py-1">
							{registrationEnabled ? 'Registrations open' : 'Registrations closed'}
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<form method="POST" action="?/updateRegistration" class="flex flex-wrap items-end gap-4">
						<label class="space-y-2">
							<span class="text-sm font-medium">Allow new registrations</span>
							<div class="flex h-10 items-center gap-3 rounded-xl border border-input bg-background px-3">
								<input
									name="allowRegistrations"
									type="checkbox"
									class="size-4 rounded border border-input"
									bind:checked={registrationEnabled}
								/>
								<span class="text-sm text-muted-foreground">
									{registrationEnabled
										? 'Anyone with the login page can create an account.'
										: 'Only existing accounts can sign in.'}
								</span>
							</div>
						</label>

						<Button type="submit">Save registration setting</Button>
					</form>
				</CardContent>
			</Card>

			<Card class="border-border/70 bg-card/95 shadow-sm">
				<CardHeader>
					<CardTitle class="text-xl font-bold">Account management</CardTitle>
					<CardDescription>Create, edit, and remove user accounts.</CardDescription>
				</CardHeader>
				<CardContent class="space-y-8">
					<form method="POST" action="?/createUser" class="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
						<label class="space-y-2">
							<span class="text-sm font-medium">Username</span>
							<Input name="username" bind:value={newUsername} autocomplete="off" />
						</label>

						<label class="space-y-2">
							<span class="text-sm font-medium">Password</span>
							<Input
								name="password"
								type="password"
								bind:value={newPassword}
								minlength={8}
								autocomplete="new-password"
							/>
						</label>

						<div class="flex items-end">
							<label class="flex h-10 items-center gap-2 rounded-xl border border-input bg-background px-3 text-sm">
								<input
									name="isAdmin"
									type="checkbox"
									class="size-4 rounded border border-input"
									bind:checked={newIsAdmin}
								/>
								<span>Admin access</span>
							</label>
						</div>

						<div class="lg:col-span-3">
							<Button type="submit">Create account</Button>
						</div>
					</form>

					<div class="overflow-hidden rounded-2xl border border-border/70">
						<div class="overflow-x-auto">
							<table class="w-full text-left text-sm">
								<thead class="bg-muted/40 text-muted-foreground">
									<tr>
										<th class="px-4 py-3 font-medium">Account</th>
										<th class="px-4 py-3 font-medium">Role</th>
										<th class="px-4 py-3 font-medium">Created</th>
										<th class="px-4 py-3 font-medium text-right">Actions</th>
									</tr>
								</thead>
								<tbody>
									{#each data.users as user (user.id)}
										<tr class="border-t border-border/70">
											<td class="px-4 py-3">
												<div class="font-medium">{user.username}</div>
												<div class="text-xs text-muted-foreground">{user.id}</div>
											</td>
											<td class="px-4 py-3">
												<Badge variant={user.isAdmin ? 'default' : 'outline'} class="rounded-full px-3 py-1">
													{user.isAdmin ? 'Admin' : 'User'}
												</Badge>
											</td>
											<td class="px-4 py-3 text-muted-foreground">
												{new Intl.DateTimeFormat(undefined, {
													dateStyle: 'medium',
													timeStyle: 'short'
												}).format(new Date(user.createdAt))}
											</td>
											<td class="px-4 py-3">
												<div class="flex justify-end gap-2">
													<Button type="button" variant="outline" size="sm" onclick={() => openEditUser(user)}>
														Edit
													</Button>
													<Button
														type="button"
														variant="destructive"
														size="sm"
														onclick={() => (deleteUserId = user.id)}
														disabled={user.id === data.user?.id}
													>
														Delete
													</Button>
												</div>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	{/if}

	{#if editingUser}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
			<div class="w-full max-w-lg rounded-3xl border border-border/70 bg-background p-6 shadow-2xl">
				<div class="mb-6 space-y-2">
					<p class="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
						Account editor
					</p>
					<h2 class="text-2xl font-bold">Edit {editingUser.username}</h2>
					<p class="text-sm text-muted-foreground">
						Leave the password blank to keep the current password.
					</p>
				</div>

				<form method="POST" action="?/updateUser" class="space-y-4">
					<input type="hidden" name="id" value={editingUser.id} />

					<label class="space-y-2">
						<span class="text-sm font-medium">Username</span>
						<Input name="username" bind:value={editUsername} autocomplete="off" />
					</label>

					<label class="space-y-2">
						<span class="text-sm font-medium">New password</span>
						<Input
							name="password"
							type="password"
							bind:value={editPassword}
							minlength={8}
							autocomplete="new-password"
						/>
					</label>

					<label class="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
						<input
							name="isAdmin"
							type="checkbox"
							class="size-4 rounded border border-input"
							bind:checked={editIsAdmin}
						/>
						<div>
							<p class="text-sm font-medium">Admin access</p>
							<p class="text-xs text-muted-foreground">
								Admins can manage registrations and other user accounts.
							</p>
						</div>
					</label>

					<div class="flex flex-wrap justify-end gap-3 pt-2">
						<Button type="button" variant="outline" onclick={closeEditUser}>Cancel</Button>
						<Button type="submit">Save account</Button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	{#if deletingUser}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
			<div class="w-full max-w-md rounded-3xl border border-border/70 bg-background p-6 shadow-2xl">
				<div class="mb-6 space-y-2">
					<p class="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
						Delete account
					</p>
					<h2 class="text-2xl font-bold">Delete {deletingUser.username}?</h2>
					<p class="text-sm text-muted-foreground">
						This removes the account and its sessions. This cannot be undone.
					</p>
				</div>

				<form method="POST" action="?/deleteUser" class="flex flex-wrap justify-end gap-3">
					<input type="hidden" name="id" value={deletingUser.id} />
					<Button type="button" variant="outline" onclick={closeDeleteUser}>Cancel</Button>
					<Button type="submit" variant="destructive">
						Delete account
					</Button>
				</form>
			</div>
		</div>
	{/if}
</div>
