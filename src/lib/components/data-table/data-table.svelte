<script lang="ts" generics="TData extends RowData">
	import type { Snippet } from 'svelte';
	import { Portal } from 'bits-ui';
	import {
		createTable,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		type Cell,
		type CellContext,
		type ColumnDef,
		type ColumnDefTemplate,
		type ColumnPinningState,
		type ColumnFiltersState,
		type HeaderContext,
		type PaginationState,
		type RowData,
		type SortingState,
		type Updater,
		type VisibilityState
	} from '@tanstack/table-core';
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import ArrowUpDownIcon from '@lucide/svelte/icons/arrow-up-down';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import CheckIcon from '@lucide/svelte/icons/check';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import SearchIcon from '@lucide/svelte/icons/search';
	import Settings2Icon from '@lucide/svelte/icons/settings-2';
	import { cn } from '$lib/utils';
	import type { DataTableFilterControl } from './types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import * as m from '$lib/paraglide/messages';

	type Props = {
		data: TData[];
		columns: ColumnDef<TData, unknown>[];
		searchPlaceholder?: string;
		searchColumnIds?: string[];
		filterControls?: DataTableFilterControl[];
		emptyTitle?: string;
		emptyDescription?: string;
		pageSizeOptions?: number[];
		rowActionsLabel?: string;
		rowActions?: Snippet<[TData]>;
		getRowId?: ((row: TData, index: number) => string) | undefined;
	};

	let {
		data,
		columns,
		searchPlaceholder = m.search_this_list(),
		searchColumnIds = [],
		filterControls = [],
		emptyTitle = m.nothing_here_yet(),
		emptyDescription = m.once_records_available(),
		pageSizeOptions = [10, 20, 50],
		rowActionsLabel = m.actions(),
		rowActions,
		getRowId
	}: Props = $props();

	let globalFilter = $state('');
	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let columnVisibility = $state<VisibilityState>({});
	let columnPinning = $state<ColumnPinningState>({
		left: [],
		right: []
	});
	let pagination = $state<PaginationState>({
		pageIndex: 0,
		pageSize: 10
	});
	let columnMenuOpen = $state(false);
	let pageSizeValue = $state('10');
	let openActionRowId = $state<string | null>(null);
	let actionMenuPosition = $state({ top: 0, left: 0 });

	function applyUpdater<T>(updater: Updater<T>, current: T) {
		return typeof updater === 'function' ? (updater as (value: T) => T)(current) : updater;
	}

	function formatValue(value: unknown) {
		if (value == null || value === '') {
			return '-';
		}

		if (Array.isArray(value)) {
			return value.join(', ');
		}

		return String(value);
	}

	function renderTemplate<TContext extends object>(
		template: ColumnDefTemplate<TContext> | undefined,
		context: TContext
	) {
		if (template == null) {
			return '';
		}

		const rendered = typeof template === 'function' ? template(context) : template;
		return formatValue(rendered);
	}

	function renderHeader(context: HeaderContext<TData, unknown>) {
		return renderTemplate(context.header.column.columnDef.header, context);
	}

	function renderCell(cell: Cell<TData, unknown>) {
		return renderTemplate(
			cell.column.columnDef.cell as ColumnDefTemplate<CellContext<TData, unknown>> | undefined,
			cell.getContext()
		);
	}

	const table = createTable<TData>({
		data: [],
		columns: [],
		state: {
			columnPinning: {
				left: [],
				right: []
			}
		},
		onStateChange: () => {},
		renderFallbackValue: '',
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		enableHiding: true,
		onColumnPinningChange: (updater) => {
			columnPinning = applyUpdater(updater, columnPinning);
		},
		onSortingChange: (updater) => {
			sorting = applyUpdater(updater, sorting);
		},
		onColumnFiltersChange: (updater) => {
			columnFilters = applyUpdater(updater, columnFilters);
			pagination = { ...pagination, pageIndex: 0 };
		},
		onColumnVisibilityChange: (updater) => {
			columnVisibility = applyUpdater(updater, columnVisibility);
		},
		onGlobalFilterChange: (updater) => {
			globalFilter = String(applyUpdater(updater, globalFilter) ?? '');
			pagination = { ...pagination, pageIndex: 0 };
		},
		onPaginationChange: (updater) => {
			pagination = applyUpdater(updater, pagination);
		},
		globalFilterFn: buildGlobalFilterFn()
	});

	function getColumnLabel(
		header: ColumnDefTemplate<HeaderContext<TData, unknown>> | undefined,
		id: string
	) {
		if (typeof header === 'string') {
			return header;
		}

		return formatValue(header ?? id);
	}

	function buildGlobalFilterFn() {
		return (row: CellContext<TData, unknown>['row'], _columnId: string, filterValue: unknown) => {
			const normalizedFilter = String(filterValue ?? '')
				.trim()
				.toLowerCase();

			if (!normalizedFilter) {
				return true;
			}

			const targetColumnIds =
				searchColumnIds.length > 0
					? searchColumnIds
					: row
							.getAllCells()
							.filter((cell) => cell.column.getCanGlobalFilter())
							.map((cell) => cell.column.id);

			return targetColumnIds.some((columnId) =>
				formatValue(row.getValue(columnId)).toLowerCase().includes(normalizedFilter)
			);
		};
	}

	function syncTableOptions() {
		table.setOptions((current) => ({
			...current,
			data,
			columns,
			state: {
				...current.state,
				sorting,
				columnFilters,
				columnVisibility,
				columnPinning,
				globalFilter,
				pagination
			},
			getRowId: getRowId ? (row, index) => getRowId(row, index) : undefined,
			globalFilterFn: buildGlobalFilterFn()
		}));
	}

	function touchTableState() {
		return {
			data,
			columns,
			sorting,
			columnFilters,
			columnVisibility,
			columnPinning,
			globalFilter,
			pagination
		};
	}

	syncTableOptions();

	$effect(() => {
		syncTableOptions();
	});

	$effect(() => {
		const firstPageSize = pageSizeOptions[0] ?? 10;

		if (!pageSizeOptions.includes(pagination.pageSize)) {
			pagination = {
				pageIndex: 0,
				pageSize: firstPageSize
			};
		}

		pageSizeValue = String(pagination.pageSize);
	});

	const headerGroups = $derived.by(() => {
		touchTableState();
		return table.getHeaderGroups();
	});

	const rows = $derived.by(() => {
		touchTableState();
		return table.getRowModel().rows;
	});

	const filteredRowCount = $derived.by(() => {
		touchTableState();
		return table.getFilteredRowModel().rows.length;
	});

	const pageCount = $derived.by(() => {
		touchTableState();
		return table.getPageCount();
	});

	const hideableColumns = $derived.by(() => {
		touchTableState();
		return table.getAllLeafColumns().filter((column) => column.getCanHide());
	});

	function handleSearchInput(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		table.setGlobalFilter(target.value);
		syncTableOptions();
	}

	function handleTextFilterInput(columnId: string, event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		table.getColumn(columnId)?.setFilterValue(target.value || undefined);
		syncTableOptions();
	}

	function handleSelectFilterInput(columnId: string, event: Event) {
		const target = event.currentTarget as HTMLSelectElement;
		table.getColumn(columnId)?.setFilterValue(target.value || undefined);
		syncTableOptions();
	}

	function handlePageSizeChange(event: Event) {
		const target = event.currentTarget as HTMLSelectElement;
		pageSizeValue = target.value;
		table.setPageSize(Number(pageSizeValue));
		syncTableOptions();
	}

	function handleSortToggle(columnId: string) {
		table.getColumn(columnId)?.toggleSorting();
		syncTableOptions();
	}

	function handleColumnVisibilityToggle(columnId: string) {
		table.getColumn(columnId)?.toggleVisibility();
		syncTableOptions();
	}

	function getSortDirection(columnId: string) {
		return sorting.find((entry) => entry.id === columnId)?.desc
			? 'desc'
			: sorting.find((entry) => entry.id === columnId)
				? 'asc'
				: false;
	}

	function getColumnIsVisible(columnId: string) {
		return columnVisibility[columnId] ?? true;
	}

	function openActionMenu(rowId: string, event: MouseEvent) {
		const trigger = event.currentTarget as HTMLElement;
		const rect = trigger.getBoundingClientRect();
		actionMenuPosition = {
			top: rect.bottom + 8,
			left: rect.right
		};
		openActionRowId = openActionRowId === rowId ? null : rowId;
	}

	$effect(() => {
		if (!openActionRowId) {
			return;
		}

		const closeMenu = () => {
			openActionRowId = null;
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				closeMenu();
			}
		};

		window.addEventListener('click', closeMenu);
		window.addEventListener('resize', closeMenu);
		window.addEventListener('scroll', closeMenu, true);
		window.addEventListener('keydown', handleEscape);

		return () => {
			window.removeEventListener('click', closeMenu);
			window.removeEventListener('resize', closeMenu);
			window.removeEventListener('scroll', closeMenu, true);
			window.removeEventListener('keydown', handleEscape);
		};
	});
</script>

<div class="space-y-4 rounded-3xl border bg-card/95 p-5 shadow-sm">
	<div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
		<div
			class="grid min-w-0 flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(20rem,1.6fr)_repeat(auto-fit,minmax(11rem,12rem))]"
		>
			<label class="relative block min-w-[16rem] flex-1">
				<SearchIcon
					class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
				/>
				<Input
					value={globalFilter}
					oninput={handleSearchInput}
					placeholder={searchPlaceholder}
					class="pl-9"
				/>
			</label>

			{#each filterControls as control (control.columnId)}
				<div class="min-w-[12rem]">
					<label class="block">
						<span
							class="mb-1 block text-xs font-semibold tracking-wide text-muted-foreground uppercase"
						>
							{control.label}
						</span>
						{#if control.type === 'select'}
							<select
								class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
								value={String(table.getColumn(control.columnId)?.getFilterValue() ?? '')}
								onchange={(event) => handleSelectFilterInput(control.columnId, event)}
							>
								<option value="">{m.all()}</option>
								{#each control.options ?? [] as option (option.value)}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
						{:else}
							<Input
								value={String(table.getColumn(control.columnId)?.getFilterValue() ?? '')}
								oninput={(event) => handleTextFilterInput(control.columnId, event)}
								placeholder={control.placeholder ?? m.filter_label({ label: control.label.toLowerCase() })}
							/>
						{/if}
					</label>
				</div>
			{/each}
		</div>

		<div class="flex flex-wrap items-end gap-3 xl:flex-nowrap">
			<label class="min-w-[8.5rem]">
				<span
					class="mb-1 block text-xs font-semibold tracking-wide text-muted-foreground uppercase"
				>
					{m.rows()}
				</span>
				<select
					bind:value={pageSizeValue}
					class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
					onchange={handlePageSizeChange}
				>
					{#each pageSizeOptions as option (option)}
						<option value={String(option)}>{m.page_of({ page: option })}</option>
					{/each}
				</select>
			</label>

			{#if hideableColumns.length}
				<div class="relative">
					<Button
						variant="outline"
						size="default"
						class="w-full justify-between xl:min-w-[11rem]"
						onclick={() => (columnMenuOpen = !columnMenuOpen)}
					>
						<span class="inline-flex items-center gap-2">
							<Settings2Icon class="size-4" />
							{m.columns()}
						</span>
						<span class="text-xs text-muted-foreground">{hideableColumns.length}</span>
					</Button>

					{#if columnMenuOpen}
						<div
							class="absolute top-full right-0 z-20 mt-2 min-w-[14rem] rounded-2xl border bg-popover p-3 shadow-lg"
						>
							<div class="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
								{m.visible_columns()}
							</div>
							<div class="grid gap-2">
								{#each hideableColumns as column (column.id)}
									<button
										type="button"
										class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-accent/60"
										onclick={() => handleColumnVisibilityToggle(column.id)}
									>
										<span
											class={cn(
												'flex size-4 shrink-0 items-center justify-center rounded-[4px] border',
												getColumnIsVisible(column.id)
													? 'border-primary bg-primary text-primary-foreground'
													: 'border-input bg-background'
											)}
										>
											{#if getColumnIsVisible(column.id)}
												<CheckIcon class="size-3.5" />
											{/if}
										</span>
										<span>{getColumnLabel(column.columnDef.header, column.id)}</span>
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<div
		class="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
	>
			<p>{m.showing_rows({ shown: rows.length, total: filteredRowCount })}</p>
	</div>

	<div class="rounded-2xl border">
		<Table containerClass="rounded-2xl">
			<TableHeader>
				{#each headerGroups as headerGroup (headerGroup.id)}
					<TableRow>
						{#each headerGroup.headers as header (header.id)}
							<TableHead class="bg-muted/20 first:rounded-tl-2xl last:rounded-tr-2xl">
								{#if header.isPlaceholder}
									&nbsp;
								{:else if header.column.getCanSort()}
									<Button
										variant="ghost"
										size="sm"
										class="h-8 w-full justify-between px-2"
										onclick={() => handleSortToggle(header.column.id)}
									>
										<span>{renderHeader(header.getContext())}</span>
										{#if getSortDirection(header.column.id) === 'asc'}
											<ArrowUpIcon class="size-4" />
										{:else if getSortDirection(header.column.id) === 'desc'}
											<ArrowDownIcon class="size-4" />
										{:else}
											<ArrowUpDownIcon class="size-4 text-muted-foreground" />
										{/if}
									</Button>
								{:else}
									<span>{renderHeader(header.getContext())}</span>
								{/if}
							</TableHead>
						{/each}

						{#if rowActions}
							<TableHead class="w-0 bg-muted/20 text-right whitespace-nowrap">
								{rowActionsLabel}
							</TableHead>
						{/if}
					</TableRow>
				{/each}
			</TableHeader>

			<TableBody>
				{#if rows.length}
					{#each rows as row (row.id)}
						<TableRow>
							{#each row.getVisibleCells() as cell (cell.id)}
								<TableCell class={cn(cell.column.id === 'notes' ? 'max-w-[24rem]' : undefined)}>
									<div
										class={cn(
											cell.column.id === 'notes'
												? 'line-clamp-2 text-muted-foreground'
												: 'leading-5'
										)}
									>
										{renderCell(cell)}
									</div>
								</TableCell>
							{/each}

							{#if rowActions}
								<TableCell class="w-0 text-right whitespace-nowrap">
									<div class="relative flex justify-end">
										<Button
											variant="ghost"
											size="icon-sm"
											aria-label="Open row actions"
											onclick={(event) => {
												event.stopPropagation();
												openActionMenu(row.id, event);
											}}
										>
											<EllipsisIcon class="size-4" />
										</Button>
									</div>
								</TableCell>
							{/if}
						</TableRow>
					{/each}
				{:else}
					<TableRow>
						<TableCell
							colspan={table.getVisibleLeafColumns().length + (rowActions ? 1 : 0)}
							class="py-12 text-center"
						>
							<p class="font-semibold">{emptyTitle}</p>
							<p class="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
						</TableCell>
					</TableRow>
				{/if}
			</TableBody>
		</Table>
	</div>

	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<p class="text-sm text-muted-foreground">
			Page {pageCount === 0 ? 0 : pagination.pageIndex + 1} of {pageCount}
		</p>

		<div class="flex flex-wrap items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				onclick={() => table.firstPage()}
				disabled={!table.getCanPreviousPage()}
			>
				First
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => table.previousPage()}
				disabled={!table.getCanPreviousPage()}
			>
				Previous
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => table.nextPage()}
				disabled={!table.getCanNextPage()}
			>
				Next
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => table.lastPage()}
				disabled={!table.getCanNextPage()}
			>
				Last
			</Button>
		</div>
	</div>

	{#if rowActions && openActionRowId}
		<Portal>
			<div
				class="fixed z-50 min-w-[10rem] -translate-x-full rounded-xl border bg-popover p-1 shadow-lg [&_a]:flex [&_a]:w-full [&_a]:items-center [&_a]:rounded-md [&_a]:px-2 [&_a]:py-1.5 [&_a]:text-sm [&_a]:hover:bg-accent/60 [&_button]:flex [&_button]:w-full [&_button]:items-center [&_button]:rounded-md [&_button]:px-2 [&_button]:py-1.5 [&_button]:text-sm [&_button]:hover:bg-accent/60"
				style={`top:${actionMenuPosition.top}px;left:${actionMenuPosition.left}px;`}
			>
				{#each rows as row (row.id)}
					{#if row.id === openActionRowId}
						{@render rowActions(row.original)}
					{/if}
				{/each}
			</div>
		</Portal>
	{/if}
</div>
