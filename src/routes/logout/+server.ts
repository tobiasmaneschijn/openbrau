import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { clearSessionCookie, invalidateSession } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies }) => {
	const token = cookies.get('openbrau_session');
	if (token) {
		await invalidateSession(token);
	}

	clearSessionCookie(cookies);
	throw redirect(302, '/');
};
