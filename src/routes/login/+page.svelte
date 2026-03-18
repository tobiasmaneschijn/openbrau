<script lang="ts">
	import type { ActionData } from './$types';
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

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Login | OpenBrau</title>
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
						<p class="text-sm font-semibold tracking-[0.26em] uppercase">OpenBrau</p>
						<p class="text-sm text-muted-foreground">shadcn-svelte workspace refresh</p>
					</div>
				</div>
				<Badge variant="secondary" class="w-fit rounded-full px-3 py-1 tracking-[0.18em] uppercase">
					Local First
				</Badge>
				<CardTitle class="max-w-2xl text-4xl leading-tight font-black sm:text-5xl">
					Recipes, process profiles, and production planning in a calmer control room.
				</CardTitle>
				<CardDescription class="max-w-2xl text-base leading-7">
					Create a local account to open the Phase 1 workspace. The app stores process data in SI
					base units and renders the UI using your preferences at display time.
				</CardDescription>
			</CardHeader>
			<CardContent class="grid gap-4 md:grid-cols-2">
				<div class="rounded-2xl border bg-background/80 p-5">
					<div class="mb-3 flex items-center gap-2">
						<SparklesIcon class="size-4 text-primary" />
						<p class="font-semibold">Adaptive complexity</p>
					</div>
					<p class="text-sm leading-6 text-muted-foreground">
						Start with a simple formulation and grow into advanced inputs as the product expands.
					</p>
				</div>
				<div class="rounded-2xl border bg-background/80 p-5">
					<div class="mb-3 flex items-center gap-2">
						<KeyRoundIcon class="size-4 text-primary" />
						<p class="font-semibold">Local auth</p>
					</div>
					<p class="text-sm leading-6 text-muted-foreground">
						Registration and login are database-backed, with session cookies managed on the server.
					</p>
				</div>
			</CardContent>
		</Card>

		<Card class="border-border/70 bg-sidebar/95 shadow-2xl">
			<CardHeader>
				<CardTitle class="text-2xl font-bold">Open your workspace</CardTitle>
				<CardDescription>
					Create your first account or sign in with an existing one.
				</CardDescription>
			</CardHeader>
			<CardContent class="space-y-5">
				{#if form?.message}
					<Alert variant="destructive">
						<AlertTitle>Authentication failed</AlertTitle>
						<AlertDescription>{form.message}</AlertDescription>
					</Alert>
				{/if}

				<form method="POST" class="space-y-4">
					<div class="space-y-2">
						<label for="username" class="text-sm font-medium">Username</label>
						<Input id="username" name="username" type="text" required placeholder="cellar-team" />
					</div>

					<div class="space-y-2">
						<label for="password" class="text-sm font-medium">Password</label>
						<Input
							id="password"
							name="password"
							type="password"
							required
							minlength={8}
							placeholder="At least 8 characters"
						/>
					</div>

					<div class="grid gap-3 sm:grid-cols-2">
						<Button name="intent" value="login" type="submit" class="w-full">Sign in</Button>
						<Button name="intent" value="register" type="submit" variant="outline" class="w-full">
							Create account
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	</div>
</div>
