import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { hashPassword } from '../auth/password';
import { randomUUID } from 'crypto';

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/openbrau';
const client = postgres(dbUrl);
const db = drizzle(client, { schema });

async function main() {
	console.log('Seeding database...');

	try {
		console.log('Seeding users...');
		const user1Id = randomUUID();
		const user2Id = randomUUID();
		await db
			.insert(schema.users)
			.values([
				{
					id: user1Id,
					username: 'test_admin',
					passwordHash: hashPassword('password123'),
					isAdmin: true,
					preferences: { units: 'metric', enabled_features: [], advanced_mode: true }
				},
				{
					id: user2Id,
					username: 'test_user',
					passwordHash: hashPassword('password123'),
					isAdmin: false,
					preferences: { units: 'imperial', enabled_features: [], advanced_mode: false }
				}
			])
			.onConflictDoNothing();

		console.log('Seeding ingredients...');
		await db
			.insert(schema.fermentables)
			.values([
				{
					id: randomUUID(),
					ownerId: user1Id,
					name: 'Pilsner Malt',
					type: 'grain',
					yieldPct: '80.5',
					colorLovibond: '1.8'
				},
				{
					id: randomUUID(),
					ownerId: user1Id,
					name: 'Vienna Malt',
					type: 'grain',
					yieldPct: '79.0',
					colorLovibond: '3.5'
				},
				{
					id: randomUUID(),
					ownerId: user1Id,
					name: 'Munich Malt',
					type: 'grain',
					yieldPct: '78.5',
					colorLovibond: '9.0'
				},
				{
					id: randomUUID(),
					ownerId: user1Id,
					name: 'Caramel / Crystal 60L',
					type: 'grain',
					yieldPct: '74.0',
					colorLovibond: '60.0'
				}
			])
			.onConflictDoNothing();

		await db
			.insert(schema.hops)
			.values([
				{
					id: randomUUID(),
					ownerId: user1Id,
					name: 'Cascade',
					form: 'pellet',
					type: 'aroma',
					alphaAcidPct: '5.5'
				},
				{
					id: randomUUID(),
					ownerId: user1Id,
					name: 'Centennial',
					form: 'pellet',
					type: 'dual',
					alphaAcidPct: '10.0'
				},
				{
					id: randomUUID(),
					ownerId: user1Id,
					name: 'Citra',
					form: 'pellet',
					type: 'dual',
					alphaAcidPct: '12.0'
				},
				{
					id: randomUUID(),
					ownerId: user1Id,
					name: 'Magnum',
					form: 'pellet',
					type: 'bittering',
					alphaAcidPct: '14.0'
				}
			])
			.onConflictDoNothing();

		await db
			.insert(schema.yeasts)
			.values([
				{
					id: randomUUID(),
					ownerId: user1Id,
					name: 'US-05',
					type: 'ale',
					form: 'dry',
					attenuationPct: '81.0'
				},
				{
					id: randomUUID(),
					ownerId: user1Id,
					name: 'WLP001',
					type: 'ale',
					form: 'liquid',
					attenuationPct: '76.0'
				},
				{
					id: randomUUID(),
					ownerId: user1Id,
					name: 'S-04',
					type: 'ale',
					form: 'dry',
					attenuationPct: '75.0'
				}
			])
			.onConflictDoNothing();

		console.log('Seeding recipes...');
		const recipe1Id = randomUUID();
		await db
			.insert(schema.recipes)
			.values([
				{
					id: recipe1Id,
					authorId: user1Id,
					name: 'Smash IPA',
					brewType: 'beer',
					style: 'American IPA',
					targetBatchSizeL: '21.000',
					boilTimeMin: 60,
					targetOg: '1.060',
					targetFg: '1.012',
					targetIbu: '55.00'
				}
			])
			.onConflictDoNothing();

		console.log('Seeding batches...');
		await db
			.insert(schema.batches)
			.values([
				{
					id: randomUUID(),
					recipeId: recipe1Id,
					status: 'fermenting',
					actualBatchSizeL: '20.000'
				},
				{
					id: randomUUID(),
					recipeId: recipe1Id,
					status: 'draft'
				}
			])
			.onConflictDoNothing();

		console.log('Database seeded successfully!');
	} catch (e) {
		console.error('Error seeding DB:', e);
	} finally {
		await client.end();
	}
}

main();
