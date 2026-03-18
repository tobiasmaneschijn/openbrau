import { and, asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { withAuditContext } from '$lib/server/db/audit';
import { equipment } from '$lib/server/db/schema';

export type EquipmentRecord = typeof equipment.$inferSelect;

export type CreateEquipmentInput = {
	ownerId: string;
	name: string;
	description?: string | null;
	efficiencyPct: string;
	batchSizeL: string;
	boilOffRateLph: string;
	mashTunLossL?: string;
	trubLossL?: string;
	isDefault?: boolean;
};

export type UpdateEquipmentInput = Omit<CreateEquipmentInput, 'ownerId'>;

export async function listEquipmentByOwner(ownerId: string) {
	return db
		.select()
		.from(equipment)
		.where(eq(equipment.ownerId, ownerId))
		.orderBy(asc(equipment.name));
}

export async function getEquipmentForOwner(id: string, ownerId: string) {
	const [record] = await db
		.select()
		.from(equipment)
		.where(and(eq(equipment.id, id), eq(equipment.ownerId, ownerId)))
		.limit(1);

	return record ?? null;
}

export async function createEquipment(input: CreateEquipmentInput) {
	return withAuditContext(input.ownerId, async (tx) => {
		const [record] = await tx
			.insert(equipment)
			.values({
				ownerId: input.ownerId,
				name: input.name,
				description: input.description ?? null,
				efficiencyPct: input.efficiencyPct,
				batchSizeL: input.batchSizeL,
				boilOffRateLph: input.boilOffRateLph,
				mashTunLossL: input.mashTunLossL ?? '0',
				trubLossL: input.trubLossL ?? '0',
				isDefault: input.isDefault ?? false
			})
			.returning();

		return record;
	});
}

export async function updateEquipmentForOwner(
	id: string,
	ownerId: string,
	input: UpdateEquipmentInput
) {
	return withAuditContext(ownerId, async (tx) => {
		const [record] = await tx
			.update(equipment)
			.set({
				name: input.name,
				description: input.description ?? null,
				efficiencyPct: input.efficiencyPct,
				batchSizeL: input.batchSizeL,
				boilOffRateLph: input.boilOffRateLph,
				mashTunLossL: input.mashTunLossL ?? '0',
				trubLossL: input.trubLossL ?? '0',
				isDefault: input.isDefault ?? false,
				updatedAt: new Date()
			})
			.where(and(eq(equipment.id, id), eq(equipment.ownerId, ownerId)))
			.returning();

		return record ?? null;
	});
}

export async function deleteEquipmentForOwner(id: string, ownerId: string) {
	return withAuditContext(ownerId, async (tx) => {
		const [record] = await tx
			.delete(equipment)
			.where(and(eq(equipment.id, id), eq(equipment.ownerId, ownerId)))
			.returning();

		return record ?? null;
	});
}
