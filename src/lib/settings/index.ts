import { baseLocale, locales } from '$lib/paraglide/runtime';
import type { UnitSystem } from '$lib/units';

export type StoredUserPreferences = {
	locale?: string;
	date_locale?: string;
	number_locale?: string;
	timezone?: string;
	theme?: 'system' | 'light' | 'dark';
	units?: UnitSystem;
	enabled_features?: string[];
	advanced_mode?: boolean;
};

export type UserSettings = {
	language: string;
	dateLocale: string;
	numberLocale: string;
	timeZone: string;
	units: UnitSystem;
	advancedMode: boolean;
};

export type SettingsOption = {
	value: string;
	label: string;
	description?: string;
};

export const APP_LANGUAGE_AUTO = String(baseLocale ?? 'en');
export const FORMAT_LOCALE_FOLLOW_LANGUAGE = 'app';
export const TIMEZONE_SYSTEM = 'system';

export const DEFAULT_USER_SETTINGS: UserSettings = {
	language: APP_LANGUAGE_AUTO,
	dateLocale: FORMAT_LOCALE_FOLLOW_LANGUAGE,
	numberLocale: FORMAT_LOCALE_FOLLOW_LANGUAGE,
	timeZone: TIMEZONE_SYSTEM,
	units: 'metric',
	advancedMode: false
};

const FALLBACK_FORMAT_LOCALE = 'en-US';
const FALLBACK_TIME_ZONE = 'UTC';

function toOptionLabel(locale: string) {
	try {
		const displayNames = new Intl.DisplayNames([APP_LANGUAGE_AUTO], { type: 'language' });
		const language = displayNames.of(locale) ?? locale;

		return `${language} (${locale})`;
	} catch {
		return locale;
	}
}

export const APP_LANGUAGE_OPTIONS: SettingsOption[] = Array.from(
	new Set([APP_LANGUAGE_AUTO, ...locales])
).map((locale) => ({
	value: locale,
	label: toOptionLabel(locale)
}));

export const FORMAT_LOCALE_OPTIONS: SettingsOption[] = [
	{
		value: FORMAT_LOCALE_FOLLOW_LANGUAGE,
		label: 'Follow app language',
		description: 'Use the same locale as the interface language.'
	},
	{ value: 'da-DK', label: 'Danish (Denmark)' },
	{ value: 'en-US', label: 'English (United States)' },
	{ value: 'en-GB', label: 'English (United Kingdom)' },
	{ value: 'fr-FR', label: 'French (France)' },
	{ value: 'de-DE', label: 'German (Germany)' },
	{ value: 'es-ES', label: 'Spanish (Spain)' }
];

export const UNIT_SYSTEM_OPTIONS: SettingsOption[] = [
	{
		value: 'metric',
		label: 'Metric',
		description: 'Display liters, kilograms, and celsius in the interface.'
	},
	{
		value: 'imperial',
		label: 'Imperial',
		description: 'Display gallons, pounds, and fahrenheit in the interface.'
	}
];

export function getSupportedTimeZones() {
	if (typeof Intl.supportedValuesOf === 'function') {
		return Intl.supportedValuesOf('timeZone');
	}

	return [
		'UTC',
		'America/New_York',
		'America/Chicago',
		'America/Denver',
		'America/Los_Angeles',
		'Europe/London',
		'Europe/Paris'
	];
}

export function isValidLocale(value: string) {
	try {
		return Intl.getCanonicalLocales(value).length > 0;
	} catch {
		return false;
	}
}

export function isValidTimeZone(value: string) {
	try {
		new Intl.DateTimeFormat(FALLBACK_FORMAT_LOCALE, { timeZone: value });
		return true;
	} catch {
		return false;
	}
}

export function readUserSettings(preferences?: StoredUserPreferences | null): UserSettings {
	const language =
		preferences?.locale && isValidLocale(preferences.locale)
			? Intl.getCanonicalLocales(preferences.locale)[0]
			: DEFAULT_USER_SETTINGS.language;
	const dateLocale =
		preferences?.date_locale && isValidLocale(preferences.date_locale)
			? Intl.getCanonicalLocales(preferences.date_locale)[0]
			: DEFAULT_USER_SETTINGS.dateLocale;
	const numberLocale =
		preferences?.number_locale && isValidLocale(preferences.number_locale)
			? Intl.getCanonicalLocales(preferences.number_locale)[0]
			: DEFAULT_USER_SETTINGS.numberLocale;
	const timeZone =
		preferences?.timezone && isValidTimeZone(preferences.timezone)
			? preferences.timezone
			: DEFAULT_USER_SETTINGS.timeZone;

	return {
		language,
		dateLocale,
		numberLocale,
		timeZone,
		units: preferences?.units === 'imperial' ? 'imperial' : 'metric',
		advancedMode: preferences?.advanced_mode ?? DEFAULT_USER_SETTINGS.advancedMode
	};
}

export function getEffectiveDateLocale(settings: UserSettings) {
	const candidate =
		settings.dateLocale === FORMAT_LOCALE_FOLLOW_LANGUAGE ? settings.language : settings.dateLocale;

	return isValidLocale(candidate) ? Intl.getCanonicalLocales(candidate)[0] : FALLBACK_FORMAT_LOCALE;
}

export function getEffectiveNumberLocale(settings: UserSettings) {
	const candidate =
		settings.numberLocale === FORMAT_LOCALE_FOLLOW_LANGUAGE
			? settings.language
			: settings.numberLocale;

	return isValidLocale(candidate) ? Intl.getCanonicalLocales(candidate)[0] : FALLBACK_FORMAT_LOCALE;
}

export function getEffectiveTimeZone(settings: UserSettings) {
	if (settings.timeZone !== TIMEZONE_SYSTEM && isValidTimeZone(settings.timeZone)) {
		return settings.timeZone;
	}

	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TIME_ZONE;
	} catch {
		return FALLBACK_TIME_ZONE;
	}
}

export function createDateFormatter(settings: UserSettings, options?: Intl.DateTimeFormatOptions) {
	return new Intl.DateTimeFormat(getEffectiveDateLocale(settings), {
		timeZone: getEffectiveTimeZone(settings),
		...options
	});
}

export function createNumberFormatter(settings: UserSettings, options?: Intl.NumberFormatOptions) {
	return new Intl.NumberFormat(getEffectiveNumberLocale(settings), options);
}

export function toStoredUserPreferences(
	settings: UserSettings,
	existingPreferences?: StoredUserPreferences | null
): StoredUserPreferences {
	return {
		...existingPreferences,
		locale: settings.language,
		date_locale:
			settings.dateLocale === FORMAT_LOCALE_FOLLOW_LANGUAGE ? undefined : settings.dateLocale,
		number_locale:
			settings.numberLocale === FORMAT_LOCALE_FOLLOW_LANGUAGE ? undefined : settings.numberLocale,
		timezone: settings.timeZone === TIMEZONE_SYSTEM ? undefined : settings.timeZone,
		units: settings.units,
		advanced_mode: settings.advancedMode,
		enabled_features: existingPreferences?.enabled_features ?? []
	};
}
