<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLTableRowElement> = $props();
</script>

<tr
	data-slot="table-row"
	class={cn(
		'border-b transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</tr>
