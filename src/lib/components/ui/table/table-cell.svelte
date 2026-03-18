<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLTdAttributes } from 'svelte/elements';

	let { class: className, children, ...restProps }: HTMLTdAttributes = $props();
</script>

<td
	data-slot="table-cell"
	class={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
	{...restProps}
>
	{@render children?.()}
</td>
