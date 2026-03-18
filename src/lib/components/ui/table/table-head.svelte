<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLThAttributes } from 'svelte/elements';

	let { class: className, children, ...restProps }: HTMLThAttributes = $props();
</script>

<th
	data-slot="table-head"
	class={cn(
		'h-11 px-4 text-left align-middle font-semibold text-foreground [&:has([role=checkbox])]:pr-0',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</th>
