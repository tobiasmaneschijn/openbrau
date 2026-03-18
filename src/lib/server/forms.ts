import { fail } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages';

export function requiredString(formData: FormData, key: string) {
	const value = formData.get(key);
	if (typeof value !== 'string' || !value.trim()) {
		throw fail(400, { message: m.field_required() });
	}

	return value.trim();
}

export function optionalString(formData: FormData, key: string) {
	const value = formData.get(key);
	if (typeof value !== 'string') return null;

	const trimmed = value.trim();
	return trimmed ? trimmed : null;
}

export function booleanField(formData: FormData, key: string) {
	return formData.get(key) === 'on';
}

export function enumField<T extends string>(formData: FormData, key: string, values: readonly T[]) {
	const value = requiredString(formData, key);
	if (!values.includes(value as T)) {
		throw fail(400, { message: m.field_invalid_selection() });
	}

	return value as T;
}

export function stringArrayField(formData: FormData, key: string) {
	const value = formData.get(key);
	if (typeof value !== 'string' || !value.trim()) {
		return [];
	}

	try {
		const parsed = JSON.parse(value) as unknown;
		if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== 'string')) {
			throw new Error('Invalid array');
		}

		return parsed;
	} catch {
		throw fail(400, { message: m.field_invalid_list() });
	}
}
