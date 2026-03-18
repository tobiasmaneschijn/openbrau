import { sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { db } from './index';
import type * as schema from './schema';

type Database = PostgresJsDatabase<typeof schema>;
type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

export async function withAuditContext<T>(
	userId: string | null | undefined,
	operation: (tx: Transaction) => Promise<T>
) {
	return db.transaction(async (tx) => {
		if (userId) {
			await tx.execute(sql`select set_config('app.current_user_id', ${userId}, true)`);
		}

		return operation(tx);
	});
}
