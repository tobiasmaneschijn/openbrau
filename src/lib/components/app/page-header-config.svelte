<script lang="ts">
	import { getContext } from 'svelte';
	import {
		APP_PAGE_HEADER_CONTEXT,
		type AppPageHeaderConfig,
		type SetAppPageHeader
	} from './page-header';

	let { eyebrow, title, description, meta, actions }: AppPageHeaderConfig = $props();

	const setPageHeader = getContext<SetAppPageHeader>(APP_PAGE_HEADER_CONTEXT);

	$effect(() => {
		return setPageHeader({ eyebrow, title, description, meta, actions });
	});
</script>
