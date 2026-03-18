import type { SQL } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { db } from './index';

export async function withTransaction<T>(callback: Parameters<typeof db.transaction<T>>[0]) {
	return db.transaction(callback);
}

export async function checkDatabaseConnection() {
	const [result] = await db.execute<{ connected: number }>(sql`
		select 1 as connected
	`);

	return result?.connected === 1;
}

export function buildSearchFilter(column: SQL, query?: string) {
	if (!query?.trim()) return undefined;

	return sql`lower(${column}) like ${`%${query.trim().toLowerCase()}%`}`;
}
