<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className, children, ...restProps } = $props();
</script>

<caption
	data-slot="table-caption"
	class={cn('mt-4 text-sm text-muted-foreground', className)}
	{...restProps}
>
	{@render children?.()}
</caption>
