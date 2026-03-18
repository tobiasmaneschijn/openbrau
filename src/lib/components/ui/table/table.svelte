<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLTableAttributes } from 'svelte/elements';

	type Props = HTMLTableAttributes & {
		containerClass?: string;
	};

	let { class: className, containerClass, children, ...restProps }: Props = $props();
</script>

<div data-slot="table-container" class={cn('relative w-full overflow-visible', containerClass)}>
	<div class="w-full overflow-x-auto overflow-y-visible">
		<table data-slot="table" class={cn('w-full caption-bottom text-sm', className)} {...restProps}>
			{@render children?.()}
		</table>
	</div>
</div>
