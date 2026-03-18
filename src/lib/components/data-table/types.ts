export type DataTableFilterControl = {
	columnId: string;
	label: string;
	type?: 'text' | 'select';
	placeholder?: string;
	options?: Array<{
		label: string;
		value: string;
	}>;
};
