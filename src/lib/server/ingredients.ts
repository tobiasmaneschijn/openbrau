import { and, asc, eq } from 'drizzle-orm';
import { withAuditContext } from '$lib/server/db/audit';
import { db } from '$lib/server/db';
import { fermentables, hops, miscs, yeasts } from '$lib/server/db/schema';

export type IngredientKind = 'fermentables' | 'hops' | 'yeasts' | 'miscs';

export type FermentableRecord = typeof fermentables.$inferSelect;
export type HopRecord = typeof hops.$inferSelect;
export type YeastRecord = typeof yeasts.$inferSelect;
export type MiscRecord = typeof miscs.$inferSelect;

export type CreateFermentableInput = {
	ownerId: string;
	name: string;
	type?: string | null;
	brand?: string | null;
	origin?: string | null;
	supplier?: string | null;
	sourceUrl?: string | null;
	yieldPct: string;
	colorLovibond?: string | null;
	moisturePct?: string | null;
	coarseFineDiffPct?: string | null;
	diastaticPowerLintner?: string | null;
	proteinPct?: string | null;
	maxInBatchPct?: string | null;
	recommendMash?: boolean;
	isExtract?: boolean;
	notes?: string | null;
};

export type CreateHopInput = {
	ownerId: string;
	name: string;
	origin?: string | null;
	supplier?: string | null;
	sourceUrl?: string | null;
	alphaAcidPct: string;
	betaAcidPct?: string | null;
	form?: string | null;
	type?: string | null;
	hsiPct?: string | null;
	cohumulonePct?: string | null;
	myrcenePct?: string | null;
	substitutes?: string | null;
	notes?: string | null;
};

export type CreateYeastInput = {
	ownerId: string;
	name: string;
	lab?: string | null;
	supplier?: string | null;
	sourceUrl?: string | null;
	productCode?: string | null;
	type?: string | null;
	form?: string | null;
	attenuationPct?: string | null;
	minTemperatureC?: string | null;
	maxTemperatureC?: string | null;
	flocculation?: string | null;
	bestFor?: string | null;
	maxReuse?: number | null;
	inventory?: string | null;
	cultureDate?: Date | null;
	addToSecondary?: boolean;
	notes?: string | null;
};

export type CreateMiscInput = {
	ownerId: string;
	name: string;
	type: string;
	useFor?: string | null;
	supplier?: string | null;
	sourceUrl?: string | null;
	description?: string | null;
	notes?: string | null;
};

export async function listFermentablesByOwner(ownerId: string) {
	return db
		.select()
		.from(fermentables)
		.where(eq(fermentables.ownerId, ownerId))
		.orderBy(asc(fermentables.name));
}

export async function listHopsByOwner(ownerId: string) {
	return db.select().from(hops).where(eq(hops.ownerId, ownerId)).orderBy(asc(hops.name));
}

export async function listYeastsByOwner(ownerId: string) {
	return db.select().from(yeasts).where(eq(yeasts.ownerId, ownerId)).orderBy(asc(yeasts.name));
}

export async function listMiscsByOwner(ownerId: string) {
	return db.select().from(miscs).where(eq(miscs.ownerId, ownerId)).orderBy(asc(miscs.name));
}

export async function listIngredientsByOwner(ownerId: string) {
	const [fermentableList, hopList, yeastList, miscList] = await Promise.all([
		listFermentablesByOwner(ownerId),
		listHopsByOwner(ownerId),
		listYeastsByOwner(ownerId),
		listMiscsByOwner(ownerId)
	]);

	return {
		fermentables: fermentableList,
		hops: hopList,
		yeasts: yeastList,
		miscs: miscList
	};
}

export async function getFermentableForOwner(id: string, ownerId: string) {
	const [record] = await db
		.select()
		.from(fermentables)
		.where(and(eq(fermentables.id, id), eq(fermentables.ownerId, ownerId)))
		.limit(1);

	return record ?? null;
}

export async function getHopForOwner(id: string, ownerId: string) {
	const [record] = await db
		.select()
		.from(hops)
		.where(and(eq(hops.id, id), eq(hops.ownerId, ownerId)))
		.limit(1);

	return record ?? null;
}

export async function getYeastForOwner(id: string, ownerId: string) {
	const [record] = await db
		.select()
		.from(yeasts)
		.where(and(eq(yeasts.id, id), eq(yeasts.ownerId, ownerId)))
		.limit(1);

	return record ?? null;
}

export async function getMiscForOwner(id: string, ownerId: string) {
	const [record] = await db
		.select()
		.from(miscs)
		.where(and(eq(miscs.id, id), eq(miscs.ownerId, ownerId)))
		.limit(1);

	return record ?? null;
}

export async function createFermentable(input: CreateFermentableInput) {
	return withAuditContext(input.ownerId, async (tx) => {
		const [record] = await tx
			.insert(fermentables)
			.values({
				ownerId: input.ownerId,
				name: input.name,
				type: input.type ?? 'grain',
				brand: input.brand ?? null,
				origin: input.origin ?? null,
				supplier: input.supplier ?? null,
				sourceUrl: input.sourceUrl ?? null,
				yieldPct: input.yieldPct,
				colorLovibond: input.colorLovibond ?? '0',
				moisturePct: input.moisturePct ?? null,
				coarseFineDiffPct: input.coarseFineDiffPct ?? null,
				diastaticPowerLintner: input.diastaticPowerLintner ?? null,
				proteinPct: input.proteinPct ?? null,
				maxInBatchPct: input.maxInBatchPct ?? null,
				recommendMash: input.recommendMash ?? true,
				isExtract: input.isExtract ?? false,
				notes: input.notes ?? null
			})
			.returning();

		return record;
	});
}

export async function createHop(input: CreateHopInput) {
	return withAuditContext(input.ownerId, async (tx) => {
		const [record] = await tx
			.insert(hops)
			.values({
				ownerId: input.ownerId,
				name: input.name,
				origin: input.origin ?? null,
				supplier: input.supplier ?? null,
				sourceUrl: input.sourceUrl ?? null,
				alphaAcidPct: input.alphaAcidPct,
				betaAcidPct: input.betaAcidPct ?? null,
				form: input.form ?? 'pellet',
				type: input.type ?? 'bittering',
				hsiPct: input.hsiPct ?? null,
				cohumulonePct: input.cohumulonePct ?? null,
				myrcenePct: input.myrcenePct ?? null,
				substitutes: input.substitutes ?? null,
				notes: input.notes ?? null
			})
			.returning();

		return record;
	});
}

export async function createYeast(input: CreateYeastInput) {
	return withAuditContext(input.ownerId, async (tx) => {
		const [record] = await tx
			.insert(yeasts)
			.values({
				ownerId: input.ownerId,
				name: input.name,
				lab: input.lab ?? null,
				supplier: input.supplier ?? null,
				sourceUrl: input.sourceUrl ?? null,
				productCode: input.productCode ?? null,
				type: input.type ?? 'ale',
				form: input.form ?? 'dry',
				attenuationPct: input.attenuationPct ?? null,
				minTemperatureC: input.minTemperatureC ?? null,
				maxTemperatureC: input.maxTemperatureC ?? null,
				flocculation: input.flocculation ?? null,
				bestFor: input.bestFor ?? null,
				maxReuse: input.maxReuse ?? null,
				inventory: input.inventory ?? null,
				cultureDate: input.cultureDate ?? null,
				addToSecondary: input.addToSecondary ?? false,
				notes: input.notes ?? null
			})
			.returning();

		return record;
	});
}

export async function createMisc(input: CreateMiscInput) {
	return withAuditContext(input.ownerId, async (tx) => {
		const [record] = await tx
			.insert(miscs)
			.values({
				ownerId: input.ownerId,
				name: input.name,
				type: input.type,
				useFor: input.useFor ?? null,
				supplier: input.supplier ?? null,
				sourceUrl: input.sourceUrl ?? null,
				description: input.description ?? null,
				notes: input.notes ?? null
			})
			.returning();

		return record;
	});
}

export async function updateFermentableForOwner(
	id: string,
	ownerId: string,
	input: Omit<CreateFermentableInput, 'ownerId'>
) {
	return withAuditContext(ownerId, async (tx) => {
		const [record] = await tx
			.update(fermentables)
			.set({
				name: input.name,
				type: input.type ?? 'grain',
				brand: input.brand ?? null,
				origin: input.origin ?? null,
				supplier: input.supplier ?? null,
				sourceUrl: input.sourceUrl ?? null,
				yieldPct: input.yieldPct,
				colorLovibond: input.colorLovibond ?? '0',
				moisturePct: input.moisturePct ?? null,
				coarseFineDiffPct: input.coarseFineDiffPct ?? null,
				diastaticPowerLintner: input.diastaticPowerLintner ?? null,
				proteinPct: input.proteinPct ?? null,
				maxInBatchPct: input.maxInBatchPct ?? null,
				recommendMash: input.recommendMash ?? true,
				isExtract: input.isExtract ?? false,
				notes: input.notes ?? null,
				updatedAt: new Date()
			})
			.where(and(eq(fermentables.id, id), eq(fermentables.ownerId, ownerId)))
			.returning();

		return record ?? null;
	});
}

export async function updateHopForOwner(
	id: string,
	ownerId: string,
	input: Omit<CreateHopInput, 'ownerId'>
) {
	return withAuditContext(ownerId, async (tx) => {
		const [record] = await tx
			.update(hops)
			.set({
				name: input.name,
				origin: input.origin ?? null,
				supplier: input.supplier ?? null,
				sourceUrl: input.sourceUrl ?? null,
				alphaAcidPct: input.alphaAcidPct,
				betaAcidPct: input.betaAcidPct ?? null,
				form: input.form ?? 'pellet',
				type: input.type ?? 'bittering',
				hsiPct: input.hsiPct ?? null,
				cohumulonePct: input.cohumulonePct ?? null,
				myrcenePct: input.myrcenePct ?? null,
				substitutes: input.substitutes ?? null,
				notes: input.notes ?? null,
				updatedAt: new Date()
			})
			.where(and(eq(hops.id, id), eq(hops.ownerId, ownerId)))
			.returning();

		return record ?? null;
	});
}

export async function updateYeastForOwner(
	id: string,
	ownerId: string,
	input: Omit<CreateYeastInput, 'ownerId'>
) {
	return withAuditContext(ownerId, async (tx) => {
		const [record] = await tx
			.update(yeasts)
			.set({
				name: input.name,
				lab: input.lab ?? null,
				supplier: input.supplier ?? null,
				sourceUrl: input.sourceUrl ?? null,
				productCode: input.productCode ?? null,
				type: input.type ?? 'ale',
				form: input.form ?? 'dry',
				attenuationPct: input.attenuationPct ?? null,
				minTemperatureC: input.minTemperatureC ?? null,
				maxTemperatureC: input.maxTemperatureC ?? null,
				flocculation: input.flocculation ?? null,
				bestFor: input.bestFor ?? null,
				maxReuse: input.maxReuse ?? null,
				inventory: input.inventory ?? null,
				cultureDate: input.cultureDate ?? null,
				addToSecondary: input.addToSecondary ?? false,
				notes: input.notes ?? null,
				updatedAt: new Date()
			})
			.where(and(eq(yeasts.id, id), eq(yeasts.ownerId, ownerId)))
			.returning();

		return record ?? null;
	});
}

export async function updateMiscForOwner(
	id: string,
	ownerId: string,
	input: Omit<CreateMiscInput, 'ownerId'>
) {
	return withAuditContext(ownerId, async (tx) => {
		const [record] = await tx
			.update(miscs)
			.set({
				name: input.name,
				type: input.type,
				useFor: input.useFor ?? null,
				supplier: input.supplier ?? null,
				sourceUrl: input.sourceUrl ?? null,
				description: input.description ?? null,
				notes: input.notes ?? null,
				updatedAt: new Date()
			})
			.where(and(eq(miscs.id, id), eq(miscs.ownerId, ownerId)))
			.returning();

		return record ?? null;
	});
}

export async function deleteFermentableForOwner(id: string, ownerId: string) {
	return withAuditContext(ownerId, async (tx) => {
		const [record] = await tx
			.delete(fermentables)
			.where(and(eq(fermentables.id, id), eq(fermentables.ownerId, ownerId)))
			.returning();

		return record ?? null;
	});
}

export async function deleteHopForOwner(id: string, ownerId: string) {
	return withAuditContext(ownerId, async (tx) => {
		const [record] = await tx
			.delete(hops)
			.where(and(eq(hops.id, id), eq(hops.ownerId, ownerId)))
			.returning();

		return record ?? null;
	});
}

export async function deleteYeastForOwner(id: string, ownerId: string) {
	return withAuditContext(ownerId, async (tx) => {
		const [record] = await tx
			.delete(yeasts)
			.where(and(eq(yeasts.id, id), eq(yeasts.ownerId, ownerId)))
			.returning();

		return record ?? null;
	});
}

export async function deleteMiscForOwner(id: string, ownerId: string) {
	return withAuditContext(ownerId, async (tx) => {
		const [record] = await tx
			.delete(miscs)
			.where(and(eq(miscs.id, id), eq(miscs.ownerId, ownerId)))
			.returning();

		return record ?? null;
	});
}

export async function findFermentableByName(ownerId: string, name: string) {
	const [record] = await db
		.select()
		.from(fermentables)
		.where(and(eq(fermentables.ownerId, ownerId), eq(fermentables.name, name)))
		.limit(1);

	return record ?? null;
}

export async function findHopByName(ownerId: string, name: string) {
	const [record] = await db
		.select()
		.from(hops)
		.where(and(eq(hops.ownerId, ownerId), eq(hops.name, name)))
		.limit(1);

	return record ?? null;
}

export async function findYeastByName(ownerId: string, name: string) {
	const [record] = await db
		.select()
		.from(yeasts)
		.where(and(eq(yeasts.ownerId, ownerId), eq(yeasts.name, name)))
		.limit(1);

	return record ?? null;
}

export async function findMiscByName(ownerId: string, name: string) {
	const [record] = await db
		.select()
		.from(miscs)
		.where(and(eq(miscs.ownerId, ownerId), eq(miscs.name, name)))
		.limit(1);

	return record ?? null;
}
