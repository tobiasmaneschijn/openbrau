import type { ButtonSize, ButtonVariant } from '$lib/components/ui/button/button.svelte';

export type AppPageHeaderAction = {
	label: string;
	href?: string;
	onClick?: () => void;
	type?: 'button' | 'submit';
	form?: string;
	variant?: ButtonVariant;
	size?: ButtonSize;
};

export type AppPageHeaderConfig = {
	eyebrow?: string;
	title: string;
	description?: string;
	meta?: string;
	actions?: AppPageHeaderAction[];
};

export type SetAppPageHeader = (config: AppPageHeaderConfig) => () => void;

export const APP_PAGE_HEADER_CONTEXT = Symbol('app-page-header');
