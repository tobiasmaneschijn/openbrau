import { cookieName } from '$lib/paraglide/runtime';
import {
	APP_LANGUAGE_OPTIONS,
	FORMAT_LOCALE_OPTIONS,
	getSupportedTimeZones,
	readUserSettings,
	UNIT_SYSTEM_OPTIONS
} from '$lib/settings';
import { updateUserSettings } from '$lib/server/settings';
import { booleanField, enumField, optionalString, requiredString } from '$lib/server/forms';
import { getAppSettings, updateAppSettings } from '$lib/server/app-settings';
import { createUserAccount, deleteUserAccount, listUsers, updateUserAccount } from '$lib/server/users';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const settings = readUserSettings(locals.user?.preferences);
	const isAdmin = Boolean(locals.user?.isAdmin);
	const [appSettings, users] = isAdmin
		? await Promise.all([getAppSettings(), listUsers()])
		: [null, [] as Awaited<ReturnType<typeof listUsers>>];

	return {
		appSettings,
		isAdmin,
		settings,
		languageOptions: APP_LANGUAGE_OPTIONS,
		formatLocaleOptions: FORMAT_LOCALE_OPTIONS,
		unitSystemOptions: UNIT_SYSTEM_OPTIONS,
		timeZoneOptions: getSupportedTimeZones(),
		users,
		updated: url.searchParams.get('updated') === '1'
	};
};

export const actions: Actions = {
	update: async ({ request, locals, cookies }) => {
		const formData = await request.formData();

		try {
			const result = await updateUserSettings(locals.user!.id, {
				language: requiredString(formData, 'language'),
				dateLocale: enumField(formData, 'dateLocale', [
					'app',
					'da-DK',
					'en-US',
					'en-GB',
					'fr-FR',
					'de-DE',
					'es-ES'
				]),
				numberLocale: enumField(formData, 'numberLocale', [
					'app',
					'da-DK',
					'en-US',
					'en-GB',
					'fr-FR',
					'de-DE',
					'es-ES'
				]),
				timeZone: requiredString(formData, 'timeZone'),
				units: enumField(formData, 'units', ['metric', 'imperial']),
				advancedMode: booleanField(formData, 'advancedMode')
			});

			cookies.set(cookieName, result.settings.language, {
				path: '/',
				sameSite: 'lax',
				httpOnly: false,
				maxAge: 60 * 60 * 24 * 365
			});
		} catch (error) {
			if (error instanceof Response) throw error;

			return fail(400, {
				message: error instanceof Error ? error.message : 'Unable to update settings.'
			});
		}

		throw redirect(303, '/app/settings?updated=1');
	},

	updateRegistration: async ({ request, locals }) => {
		if (!locals.user?.isAdmin) {
			return fail(403, { message: 'Only the owner can manage registrations.' });
		}

		const formData = await request.formData();

		try {
			await updateAppSettings(booleanField(formData, 'allowRegistrations'), locals.user.id);
		} catch (error) {
			if (error instanceof Response) throw error;

			return fail(400, {
				message: error instanceof Error ? error.message : 'Unable to update registration settings.'
			});
		}

		throw redirect(303, '/app/settings?updated=1');
	},

	createUser: async ({ request, locals }) => {
		if (!locals.user?.isAdmin) {
			return fail(403, { message: 'Only the owner can manage users.' });
		}

		const formData = await request.formData();

		try {
			await createUserAccount({
				username: requiredString(formData, 'username'),
				password: requiredString(formData, 'password'),
				isAdmin: booleanField(formData, 'isAdmin'),
				createdByUserId: locals.user.id
			});
		} catch (error) {
			if (error instanceof Response) throw error;

			return fail(400, {
				message: error instanceof Error ? error.message : 'Unable to create user.'
			});
		}

		throw redirect(303, '/app/settings?updated=1');
	},

	updateUser: async ({ request, locals }) => {
		if (!locals.user?.isAdmin) {
			return fail(403, { message: 'Only the owner can manage users.' });
		}

		const formData = await request.formData();

		try {
			await updateUserAccount(requiredString(formData, 'id'), {
				username: requiredString(formData, 'username'),
				password: optionalString(formData, 'password'),
				isAdmin: booleanField(formData, 'isAdmin'),
				updatedByUserId: locals.user.id
			});
		} catch (error) {
			if (error instanceof Response) throw error;

			return fail(400, {
				message: error instanceof Error ? error.message : 'Unable to update user.'
			});
		}

		throw redirect(303, '/app/settings?updated=1');
	},

	deleteUser: async ({ request, locals }) => {
		if (!locals.user?.isAdmin) {
			return fail(403, { message: 'Only the owner can manage users.' });
		}

		const formData = await request.formData();

		try {
			await deleteUserAccount(requiredString(formData, 'id'), locals.user.id);
		} catch (error) {
			if (error instanceof Response) throw error;

			return fail(400, {
				message: error instanceof Error ? error.message : 'Unable to delete user.'
			});
		}

		throw redirect(303, '/app/settings?updated=1');
	}
};
