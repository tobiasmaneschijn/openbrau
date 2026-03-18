import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => ({
	session: locals.session,
	user: locals.user
		? {
				id: locals.user.id,
				username: locals.user.username,
				preferences: locals.user.preferences
			}
		: null
});
