import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createUserSession, setSessionCookie } from '$lib/server/auth';
import { requiredString } from '$lib/server/forms';
import { authenticateUser, findUserByUsername, hasAnyUsers, registerUser } from '$lib/server/users';
import { canRegisterNewUsers } from '$lib/server/app-settings';
import * as m from '$lib/paraglide/messages';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/app');
	}

	const [hasUsers, registrationAllowed] = await Promise.all([hasAnyUsers(), canRegisterNewUsers()]);

	return {
		registrationOpen: !hasUsers || registrationAllowed
	};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const intent = requiredString(formData, 'intent');
		const username = requiredString(formData, 'username');
		const password = requiredString(formData, 'password');

		if (intent === 'register') {
			const [hasUsers, registrationAllowed] = await Promise.all([
				hasAnyUsers(),
				canRegisterNewUsers()
			]);

			if (hasUsers && !registrationAllowed) {
				return fail(403, {
					message: 'Registration is disabled by the administrator.'
				});
			}

			if (password.length < 8) {
				return fail(400, { message: m.password_too_short() });
			}

			const existingUser = await findUserByUsername(username);
			if (existingUser) {
				return fail(400, { message: m.username_taken() });
			}

			const user = await registerUser(username, password);
			const { session, token } = await createUserSession(user.id);
			setSessionCookie(cookies, token, session.expiresAt);

			throw redirect(302, '/app');
		}

		if (intent !== 'login') {
			return fail(400, { message: m.unknown_login_action() });
		}

		const user = await authenticateUser(username, password);
		if (!user) {
			return fail(400, { message: m.invalid_username_or_password() });
		}

		const { session, token } = await createUserSession(user.id);
		setSessionCookie(cookies, token, session.expiresAt);

		throw redirect(302, '/app');
	}
};
