import { and, asc, eq, ne } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { withAuditContext } from '$lib/server/db/audit';
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

export async function hasAnyUsers() {
	const [user] = await db.select({ id: users.id }).from(users).limit(1);
	return Boolean(user);
}

export async function listUsers() {
	return db
		.select({
			id: users.id,
			username: users.username,
			isAdmin: users.isAdmin,
			createdAt: users.createdAt,
			updatedAt: users.updatedAt
		})
		.from(users)
		.orderBy(asc(users.createdAt));
}

export async function getUserById(id: string) {
	const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);

	return user ?? null;
}

type CreateUserInput = {
	username: string;
	password: string;
	isAdmin?: boolean;
	createdByUserId?: string | null;
};

export async function createUserAccount(input: CreateUserInput) {
	const normalizedUsername = normalizeUsername(input.username);

	if (input.password.length < 8) {
		throw new Error('Password must be at least 8 characters long.');
	}

	const existingUser = await findUserByUsername(normalizedUsername);
	if (existingUser) {
		throw new Error('Username is already taken.');
	}

	const shouldBeAdmin = input.isAdmin ?? false;
	const isAdmin = !(await hasAnyUsers()) || shouldBeAdmin;

	return withAuditContext(input.createdByUserId ?? null, async (tx) => {
		const [user] = await tx
			.insert(users)
			.values({
				username: normalizedUsername,
				passwordHash: hashPassword(input.password),
				isAdmin,
				preferences: {
					units: 'metric',
					enabled_features: [],
					advanced_mode: false
				}
			})
			.returning();

		return user;
	});
}

export async function registerUser(username: string, password: string) {
	return createUserAccount({
		username,
		password,
		isAdmin: !(await hasAnyUsers())
	});
}

type UpdateUserAccountInput = {
	username: string;
	password?: string | null;
	isAdmin: boolean;
	updatedByUserId?: string | null;
};

export async function updateUserAccount(id: string, input: UpdateUserAccountInput) {
	const normalizedUsername = normalizeUsername(input.username);
	const existingUser = await getUserById(id);

	if (!existingUser) {
		throw new Error('User not found.');
	}

	if (
		input.password != null &&
		input.password.trim().length > 0 &&
		input.password.trim().length < 8
	) {
		throw new Error('Password must be at least 8 characters long.');
	}

	const duplicateUser = await db
		.select({ id: users.id })
		.from(users)
		.where(and(eq(users.username, normalizedUsername), ne(users.id, id)))
		.limit(1);

	if (duplicateUser.length > 0) {
		throw new Error('Username is already taken.');
	}

	if (existingUser.isAdmin && !input.isAdmin) {
		const [anotherAdmin] = await db
			.select({ id: users.id })
			.from(users)
			.where(and(eq(users.isAdmin, true), ne(users.id, id)))
			.limit(1);

		if (!anotherAdmin) {
			throw new Error('At least one admin account must remain active.');
		}
	}

	return withAuditContext(input.updatedByUserId ?? null, async (tx) => {
		const updateValues: Partial<typeof users.$inferInsert> = {
			username: normalizedUsername,
			isAdmin: input.isAdmin,
			updatedAt: new Date()
		};

		if (input.password?.trim()) {
			updateValues.passwordHash = hashPassword(input.password.trim());
		}

		const [user] = await tx.update(users).set(updateValues).where(eq(users.id, id)).returning();

		return user ?? null;
	});
}

export async function deleteUserAccount(id: string, deletedByUserId?: string | null) {
	const existingUser = await getUserById(id);

	if (!existingUser) {
		throw new Error('User not found.');
	}

	if (deletedByUserId && deletedByUserId === id) {
		throw new Error('You cannot delete the account you are signed in as.');
	}

	if (existingUser.isAdmin) {
		const [anotherAdmin] = await db
			.select({ id: users.id })
			.from(users)
			.where(and(eq(users.isAdmin, true), ne(users.id, id)))
			.limit(1);

		if (!anotherAdmin) {
			throw new Error('At least one admin account must remain active.');
		}
	}

	return withAuditContext(deletedByUserId ?? null, async (tx) => {
		const [user] = await tx.delete(users).where(eq(users.id, id)).returning();

		return user ?? null;
	});
}

export async function authenticateUser(username: string, password: string) {
	const user = await findUserByUsername(username);
	if (!user) return null;

	return verifyPassword(password, user.passwordHash) ? user : null;
}
