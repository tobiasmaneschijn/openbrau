<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import BarrelIcon from '@lucide/svelte/icons/barrel';
	import KeyRoundIcon from '@lucide/svelte/icons/key-round';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
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
	import * as m from '$lib/paraglide/messages';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>{m.sign_in()} | {m.app_name()}</title>
</svelte:head>

<div
	class="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(197,153,82,0.22),_transparent_34%),linear-gradient(180deg,_#fbfaf6_0%,_#f3eee4_100%)] px-6 py-16"
>
	<div
		class="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.45)_20%,transparent_40%)]"
	></div>

	<div class="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
		<Card class="border-border/70 bg-card/85 shadow-2xl backdrop-blur">
			<CardHeader class="space-y-4">
				<div class="flex items-center gap-3">
					<div
						class="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
					>
						<BarrelIcon class="size-6" />
					</div>
					<div>
						<p class="text-sm font-semibold tracking-[0.26em] uppercase">{m.app_name()}</p>
						<p class="text-sm text-muted-foreground">{m.homebrew_workspace()}</p>
					</div>
				</div>
				<Badge variant="secondary" class="w-fit rounded-full px-3 py-1 tracking-[0.18em] uppercase">
					{m.local_first()}
				</Badge>
				<CardTitle class="max-w-2xl text-4xl leading-tight font-black sm:text-5xl">
					{m.recipes_process_planning()}
				</CardTitle>
				<CardDescription class="max-w-2xl text-base leading-7">
					{m.landing_description()}
				</CardDescription>
			</CardHeader>
			<CardContent class="grid gap-4 md:grid-cols-2">
				<div class="rounded-2xl border bg-background/80 p-5">
					<div class="mb-3 flex items-center gap-2">
						<SparklesIcon class="size-4 text-primary" />
						<p class="font-semibold">{m.adaptive_complexity()}</p>
					</div>
					<p class="text-sm leading-6 text-muted-foreground">
						{m.adaptive_complexity_description()}
					</p>
				</div>
				<div class="rounded-2xl border bg-background/80 p-5">
					<div class="mb-3 flex items-center gap-2">
						<KeyRoundIcon class="size-4 text-primary" />
						<p class="font-semibold">{m.local_auth()}</p>
					</div>
					<p class="text-sm leading-6 text-muted-foreground">
						{m.local_auth_description()}
					</p>
				</div>
			</CardContent>
		</Card>

		<Card class="border-border/70 bg-sidebar/95 shadow-2xl">
			<CardHeader>
				<CardTitle class="text-2xl font-bold">{m.open_your_workspace()}</CardTitle>
				<CardDescription>{m.create_or_sign_in()}</CardDescription>
			</CardHeader>
			<CardContent class="space-y-5">
				{#if form?.message}
					<Alert variant="destructive">
						<AlertTitle>{m.authentication_failed()}</AlertTitle>
						<AlertDescription>{form.message}</AlertDescription>
					</Alert>
				{/if}

				<form method="POST" class="space-y-4">
					<div class="space-y-2">
						<label for="username" class="text-sm font-medium">{m.username()}</label>
						<Input
							id="username"
							name="username"
							type="text"
							required
							placeholder={m.username_placeholder()}
						/>
					</div>

					<div class="space-y-2">
						<label for="password" class="text-sm font-medium">{m.password()}</label>
						<Input
							id="password"
							name="password"
							type="password"
							required
							minlength={8}
							placeholder={m.password_placeholder()}
						/>
					</div>

					<div class="grid gap-3 sm:grid-cols-2">
						<Button name="intent" value="login" type="submit" class="w-full">{m.sign_in()}</Button>
						{#if data.registrationOpen}
							<Button name="intent" value="register" type="submit" variant="outline" class="w-full">
								{m.create_account()}
							</Button>
						{/if}
					</div>
					{#if !data.registrationOpen}
						<p class="text-sm text-muted-foreground">
							Registration is disabled on this installation.
						</p>
					{/if}
				</form>
			</CardContent>
		</Card>
	</div>
</div>
