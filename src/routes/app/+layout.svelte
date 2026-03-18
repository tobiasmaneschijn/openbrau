<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import { setContext } from 'svelte';
	import BarrelIcon from '@lucide/svelte/icons/barrel';
	import BarChart3Icon from '@lucide/svelte/icons/bar-chart-3';
	import FlaskConicalIcon from '@lucide/svelte/icons/flask-conical';
	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import PackageIcon from '@lucide/svelte/icons/package';
	import Settings2Icon from '@lucide/svelte/icons/settings-2';
	import SlidersHorizontalIcon from '@lucide/svelte/icons/sliders-horizontal';
	import type { LayoutData } from './$types';
	import {
		APP_PAGE_HEADER_CONTEXT,
		type AppPageHeaderConfig,
		type SetAppPageHeader
	} from '$lib/components/app/page-header';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { readUserSettings } from '$lib/settings';
	import * as m from '$lib/paraglide/messages';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
	const uiLocale = $derived(readUserSettings(data.user?.preferences).language as 'en' | 'da');

	const navItems = $derived.by(
		() =>
			[
				{
					href: '/app',
					label: m.overview({}, { locale: uiLocale }),
					description: m.dashboard({}, { locale: uiLocale }),
					icon: LayoutDashboardIcon
				},
				{
					href: '/app/recipes',
					label: m.recipes({}, { locale: uiLocale }),
					description: m.brew_library({}, { locale: uiLocale }),
					icon: FlaskConicalIcon
				},
				{
					href: '/app/batches',
					label: m.batches({}, { locale: uiLocale }),
					description: m.fermentation_log({}, { locale: uiLocale }),
					icon: BarChart3Icon
				},
				{
					href: '/app/ingredients',
					label: m.ingredients({}, { locale: uiLocale }),
					description: m.saved_library({}, { locale: uiLocale }),
					icon: PackageIcon
				},
				{
					href: '/app/equipment',
					label: m.equipment({}, { locale: uiLocale }),
					description: m.profiles({}, { locale: uiLocale }),
					icon: Settings2Icon
				},
				{
					href: '/app/settings',
					label: m.settings({}, { locale: uiLocale }),
					description: m.preferences({}, { locale: uiLocale }),
					icon: SlidersHorizontalIcon
				}
			] as const
	);

	let currentPageHeader = $state<AppPageHeaderConfig | null>(null);
	let registeredHeaderPath = $state<string | null>(null);
	let lastPathname = $state(page.url.pathname);
	const registerPageHeader: SetAppPageHeader = (config) => {
		currentPageHeader = config;
		registeredHeaderPath = page.url.pathname;

		return () => {
			if (currentPageHeader === config) {
				currentPageHeader = null;
				registeredHeaderPath = null;
			}
		};
	};

	setContext(APP_PAGE_HEADER_CONTEXT, registerPageHeader);

	$effect(() => {
		const pathname = page.url.pathname;

		if (pathname !== lastPathname) {
			lastPathname = pathname;

			if (registeredHeaderPath !== pathname) {
				currentPageHeader = null;
				registeredHeaderPath = null;
			}
		}
	});

	const defaultPageHeader = $derived.by(() => {
		const pathname = page.url.pathname;
		const matchedItem = navItems.find((item) =>
			item.href === '/app' ? pathname === item.href : pathname.startsWith(item.href)
		);

		if (matchedItem) {
			const header: AppPageHeaderConfig = {
				eyebrow: m.app_workspace({}, { locale: uiLocale }),
				title: matchedItem.label,
				description: matchedItem.description
			};

			return header;
		}

		const fallbackHeader: AppPageHeaderConfig = {
			eyebrow: m.app_workspace({}, { locale: uiLocale }),
			title: `${m.app_name({}, { locale: uiLocale })} ${m.app_workspace({}, { locale: uiLocale })}`,
			description: `${m.recipes({}, { locale: uiLocale })}, ${m.batches({}, { locale: uiLocale })}, ${m.equipment({}, { locale: uiLocale })}`
		};

		return fallbackHeader;
	});

	const activePageHeader = $derived(currentPageHeader ?? defaultPageHeader);
</script>

<Sidebar.Provider>
	<Sidebar.Root variant="inset" collapsible="icon">
		<Sidebar.Header class="gap-4 px-3 py-4">
			<div
				class="flex items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
			>
				<div
					class="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"
				>
					<BarrelIcon class="size-5" />
				</div>
				<div class="min-w-0 group-data-[collapsible=icon]:hidden">
					<p class="truncate text-sm font-semibold tracking-[0.2em] uppercase">{m.app_name()}</p>
				</div>
			</div>
		</Sidebar.Header>

		<Sidebar.Content class="px-2">
			<Sidebar.Group>
				<Sidebar.GroupLabel>{m.app_workspace()}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each navItems as item (item.href)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									isActive={item.href === '/app'
										? page.url.pathname === item.href
										: page.url.pathname.startsWith(item.href)}
									tooltipContent={item.label}
									size="lg"
								>
									{#snippet child({ props })}
										<a {...props} href={resolve(item.href)}>
											<item.icon />
											<div class="grid text-left group-data-[collapsible=icon]:hidden">
												<span>{item.label}</span>
												<span class="text-xs font-normal text-muted-foreground">
													{item.description}
												</span>
											</div>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>

		<Sidebar.Footer class="gap-3 px-3 py-4">
			<Separator />
			<div class="rounded-xl bg-sidebar-accent/60 p-3 group-data-[collapsible=icon]:hidden">
				<p class="text-sm font-medium">{data.user.username}</p>
			</div>

			<form method="POST" action="/logout" class="group-data-[collapsible=icon]:hidden">
				<Button type="submit" variant="outline" class="w-full justify-start">{m.sign_out()}</Button>
			</form>
		</Sidebar.Footer>
		<Sidebar.Rail />
	</Sidebar.Root>

	<Sidebar.Inset
		class="bg-[radial-gradient(circle_at_top,_rgba(216,190,145,0.18),_transparent_40%),linear-gradient(180deg,_var(--color-background)_0%,_color-mix(in_oklab,var(--color-background)_94%,var(--color-sidebar)_6%)_100%)]"
	>
		<header
			class="sticky top-0 z-20 flex items-center justify-between border-b bg-background/85 px-4 py-3 backdrop-blur md:px-6"
		>
			<div class="flex min-w-0 items-center gap-3">
				<Sidebar.Trigger />
				<div class="min-w-0">
					{#if activePageHeader.eyebrow}
						<p class="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
							{activePageHeader.eyebrow}
						</p>
					{/if}
					<p class="truncate text-sm font-semibold md:text-base">{activePageHeader.title}</p>
					{#if activePageHeader.description}
						<p class="truncate text-xs text-muted-foreground">{activePageHeader.description}</p>
					{/if}
					{#if activePageHeader.meta}
						<p class="truncate text-xs text-muted-foreground">{activePageHeader.meta}</p>
					{/if}
				</div>
			</div>
			<div class="flex flex-wrap items-center justify-end gap-2">
				{#if activePageHeader.actions}
					{#each activePageHeader.actions as action (`${action.label}-${action.href ?? action.form ?? action.type ?? 'button'}`)}
						<Button
							href={action.href}
							onclick={action.onClick}
							type={action.type ?? (action.href ? 'button' : 'button')}
							form={action.form}
							variant={action.variant ?? 'outline'}
							size={action.size ?? 'default'}
						>
							{action.label}
						</Button>
					{/each}
				{/if}
				<Badge variant="outline" class="rounded-full px-3 py-1">
					{data.user.preferences.advanced_mode ? m.advanced_mode() : m.simple_mode()}
				</Badge>
			</div>
		</header>

		<main class="mx-auto w-full px-4 py-6 md:px-6 md:py-8">
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
