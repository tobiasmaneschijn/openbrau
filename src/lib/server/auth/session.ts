import { env } from '$env/dynamic/private';
import type { Cookies, RequestEvent } from '@sveltejs/kit';
import { and, eq, gt } from 'drizzle-orm';
import { createHash, randomBytes } from 'node:crypto';
import { db } from '$lib/server/db';
import { sessions, users } from '$lib/server/db/schema';

const SESSION_COOKIE_NAME = 'openbrau_session';
const SESSION_TTL_DAYS = 30;
const RENEWAL_WINDOW_DAYS = 7;

export type AuthUser = typeof users.$inferSelect;
export type AuthSession = typeof sessions.$inferSelect;

export function generateSessionToken() {
	return randomBytes(24).toString('base64url');
}

export function hashSessionToken(token: string) {
	return createHash('sha256').update(token).digest('hex');
}

export function createSessionExpiry() {
	return new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export async function createUserSession(userId: string) {
	const token = generateSessionToken();
	const expiresAt = createSessionExpiry();

	const [session] = await db
		.insert(sessions)
		.values({
			userId,
			tokenHash: hashSessionToken(token),
			expiresAt
		})
		.returning();

	return { session, token };
}

export async function validateSessionToken(token: string) {
	const tokenHash = hashSessionToken(token);
	const now = new Date();

	const [result] = await db
		.select({
			session: sessions,
			user: users
		})
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
		.limit(1);

	if (!result) return { session: null, user: null };

	const renewalThreshold = new Date(Date.now() + RENEWAL_WINDOW_DAYS * 24 * 60 * 60 * 1000);

	let session = result.session;
	if (session.expiresAt <= renewalThreshold) {
		const [renewedSession] = await db
			.update(sessions)
			.set({
				expiresAt: createSessionExpiry(),
				lastSeenAt: now
			})
			.where(eq(sessions.id, session.id))
			.returning();

		session = renewedSession ?? session;
	} else {
		await db
			.update(sessions)
			.set({
				lastSeenAt: now
			})
			.where(eq(sessions.id, session.id));
	}

	return { session, user: result.user };
}

export async function invalidateSession(token: string) {
	await db.delete(sessions).where(eq(sessions.tokenHash, hashSessionToken(token)));
}

export function setSessionCookie(cookies: Cookies, token: string, expiresAt: Date) {
	cookies.set(SESSION_COOKIE_NAME, token, {
		httpOnly: true,
		sameSite: 'lax',
		path: '/',
		secure: env.NODE_ENV === 'production',
		expires: expiresAt
	});
}

export function clearSessionCookie(cookies: Cookies) {
	cookies.delete(SESSION_COOKIE_NAME, {
		httpOnly: true,
		sameSite: 'lax',
		path: '/',
		secure: env.NODE_ENV === 'production'
	});
}

export async function resolveRequestSession(event: RequestEvent) {
	const token = event.cookies.get(SESSION_COOKIE_NAME);

	if (!token) {
		return { session: null, user: null };
	}

	const { session, user } = await validateSessionToken(token);

	if (!session || !user) {
		clearSessionCookie(event.cookies);
		return { session: null, user: null };
	}

	setSessionCookie(event.cookies, token, session.expiresAt);
	return { session, user };
}
