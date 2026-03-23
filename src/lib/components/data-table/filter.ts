import { filterFns, type FilterFn } from '@tanstack/table-core';

export type ColumnFilterOperator =
	| 'contains'
	| 'equals'
	| 'starts_with'
	| 'is_empty'
	| 'gt'
	| 'lt'
	| 'eq'
	| 'between'
	| 'is_before'
	| 'is_after'
	| 'is_same_as'
	| 'is_true'
	| 'is_false'
	| 'is_one_of'
	| 'is_none_of';

export type ColumnFilterState = {
	operator: ColumnFilterOperator;
	value?: any;
	value2?: any;
};

export type ColumnFilterType = 'string' | 'number' | 'date' | 'boolean' | 'enum';

export type ColumnFilterDef = {
	type: ColumnFilterType;
	options?: { label: string; value: string }[];
};

export const typeAwareFilterFn: FilterFn<any> = (row, columnId, filterValue: ColumnFilterState) => {
	if (!filterValue || !filterValue.operator) return true;
	const { operator, value, value2 } = filterValue;

	const rowValue = row.getValue(columnId);

	switch (operator) {
		case 'contains':
			if (value === undefined || value === '') return true;
			return filterFns.includesString(row, columnId, value, () => {});
		case 'equals':
			if (value === undefined || value === '') return true;
			return filterFns.equalsString(row, columnId, value, () => {});
		case 'starts_with':
			if (value === undefined || value === '') return true;
			return String(rowValue ?? '')
				.toLowerCase()
				.startsWith(String(value).toLowerCase());
		case 'is_empty':
			return rowValue === null || rowValue === undefined || rowValue === '';
		case 'gt':
			if (value === undefined || value === '') return true;
			return Number(rowValue) > Number(value);
		case 'lt':
			if (value === undefined || value === '') return true;
			return Number(rowValue) < Number(value);
		case 'eq':
			if (value === undefined || value === '') return true;
			return Number(rowValue) === Number(value);
		case 'between':
			if ((value === undefined || value === '') && (value2 === undefined || value2 === ''))
				return true;
			return filterFns.inNumberRange(
				row,
				columnId,
				[
					value !== undefined && value !== '' ? Number(value) : -Infinity,
					value2 !== undefined && value2 !== '' ? Number(value2) : Infinity
				],
				() => {}
			);
		case 'is_before':
			if (!value) return true;
			if (!rowValue) return false;
			return new Date(rowValue as any).getTime() < new Date(value).getTime();
		case 'is_after':
			if (!value) return true;
			if (!rowValue) return false;
			return new Date(rowValue as any).getTime() > new Date(value).getTime();
		case 'is_same_as':
			if (!value) return true;
			if (!rowValue) return false;
			const d1 = new Date(rowValue as any);
			const d2 = new Date(value);
			return (
				d1.getFullYear() === d2.getFullYear() &&
				d1.getMonth() === d2.getMonth() &&
				d1.getDate() === d2.getDate()
			);
		case 'is_true':
			return Boolean(rowValue) === true;
		case 'is_false':
			return Boolean(rowValue) === false;
		case 'is_one_of':
			if (!Array.isArray(value) || value.length === 0) return true;
			return value.includes(rowValue);
		case 'is_none_of':
			if (!Array.isArray(value) || value.length === 0) return true;
			return !value.includes(rowValue);
	}

	return true;
};
