import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createUserSession, setSessionCookie } from '$lib/server/auth';
import { requiredString } from '$lib/server/forms';
import { authenticateUser, findUserByUsername, registerUser } from '$lib/server/users';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/app');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const intent = requiredString(formData, 'intent');
		const username = requiredString(formData, 'username');
		const password = requiredString(formData, 'password');

		if (intent === 'register') {
			if (password.length < 8) {
				return fail(400, { message: 'Password must be at least 8 characters long.' });
			}

			const existingUser = await findUserByUsername(username);
			if (existingUser) {
				return fail(400, { message: 'That username is already taken.' });
			}

			const user = await registerUser(username, password);
			const { session, token } = await createUserSession(user.id);
			setSessionCookie(cookies, token, session.expiresAt);

			throw redirect(302, '/app');
		}

		if (intent !== 'login') {
			return fail(400, { message: 'Unknown login action.' });
		}

		const user = await authenticateUser(username, password);
		if (!user) {
			return fail(400, { message: 'Invalid username or password.' });
		}

		const { session, token } = await createUserSession(user.id);
		setSessionCookie(cookies, token, session.expiresAt);

		throw redirect(302, '/app');
	}
};
