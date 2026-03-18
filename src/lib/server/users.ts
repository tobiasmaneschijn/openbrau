import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { hashPassword, verifyPassword } from '$lib/server/auth/password';

function normalizeUsername(username: string) {
	return username.trim().toLowerCase();
}

export async function findUserByUsername(username: string) {
	const normalizedUsername = normalizeUsername(username);

	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.username, normalizedUsername))
		.limit(1);

	return user ?? null;
}

export async function registerUser(username: string, password: string) {
	const normalizedUsername = normalizeUsername(username);

	const [user] = await db
		.insert(users)
		.values({
			username: normalizedUsername,
			passwordHash: hashPassword(password),
			preferences: {
				units: 'metric',
				enabled_features: [],
				advanced_mode: false
			}
		})
		.returning();

	return user;
}

export async function authenticateUser(username: string, password: string) {
	const user = await findUserByUsername(username);
	if (!user) return null;

	return verifyPassword(password, user.passwordHash) ? user : null;
}
