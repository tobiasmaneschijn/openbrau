import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

type Database = PostgresJsDatabase<typeof schema>;

let database: Database | undefined;

function createDatabase() {
	const databaseUrl = env.DATABASE_URL;

	if (!databaseUrl) throw new Error('DATABASE_URL is not set');

	const client = postgres(databaseUrl);

	return drizzle(client, { schema });
}

export function getDb() {
	database ??= createDatabase();
	return database;
}

export const db = new Proxy({} as Database, {
	get(_target, property, receiver) {
		const value = Reflect.get(getDb(), property, receiver);
		return typeof value === 'function' ? value.bind(getDb()) : value;
	}
});
