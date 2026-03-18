import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import {
	type StoredUserPreferences,
	type UserSettings,
	isValidLocale,
	isValidTimeZone,
	readUserSettings,
	toStoredUserPreferences
} from '$lib/settings';

type UpdateUserSettingsInput = {
	language: string;
	dateLocale: string;
	numberLocale: string;
	timeZone: string;
	units: 'metric' | 'imperial';
	advancedMode: boolean;
};

function assertLocale(value: string, field: string) {
	if (!isValidLocale(value)) {
		throw new Error(`${field} is invalid.`);
	}
}

export async function updateUserSettings(userId: string, input: UpdateUserSettingsInput) {
	assertLocale(input.language, 'language');

	if (input.dateLocale !== 'app') {
		assertLocale(input.dateLocale, 'dateLocale');
	}

	if (input.numberLocale !== 'app') {
		assertLocale(input.numberLocale, 'numberLocale');
	}

	if (input.timeZone !== 'system' && !isValidTimeZone(input.timeZone)) {
		throw new Error('timeZone is invalid.');
	}

	if (!['metric', 'imperial'].includes(input.units)) {
		throw new Error('units is invalid.');
	}

	const [existingUser] = await db
		.select({
			preferences: users.preferences
		})
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!existingUser) {
		throw new Error('User not found.');
	}

	const settings: UserSettings = {
		language: input.language,
		dateLocale: input.dateLocale,
		numberLocale: input.numberLocale,
		timeZone: input.timeZone,
		units: input.units,
		advancedMode: input.advancedMode
	};

	const nextPreferences = toStoredUserPreferences(
		settings,
		existingUser.preferences as StoredUserPreferences
	);

	const [updatedUser] = await db
		.update(users)
		.set({
			preferences: nextPreferences,
			updatedAt: new Date()
		})
		.where(eq(users.id, userId))
		.returning({
			id: users.id,
			username: users.username,
			preferences: users.preferences
		});

	if (!updatedUser) {
		throw new Error('Could not update user settings.');
	}

	return {
		user: updatedUser,
		settings: readUserSettings(updatedUser.preferences as StoredUserPreferences)
	};
}
