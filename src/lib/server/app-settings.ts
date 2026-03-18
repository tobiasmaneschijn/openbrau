import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { withAuditContext } from '$lib/server/db/audit';
import { appSettings } from '$lib/server/db/schema';

export type AppSettingsRecord = typeof appSettings.$inferSelect;

export const DEFAULT_APP_SETTINGS: AppSettingsRecord = {
	id: 'global',
	allowRegistrations: true,
	createdAt: new Date(0),
	updatedAt: new Date(0)
};

export async function getAppSettings() {
	const [settings] = await db.select().from(appSettings).limit(1);

	return settings ?? DEFAULT_APP_SETTINGS;
}

export async function canRegisterNewUsers() {
	const settings = await getAppSettings();

	return settings.allowRegistrations;
}

export async function updateAppSettings(
	allowRegistrations: boolean,
	updatedByUserId?: string | null
) {
	return withAuditContext(updatedByUserId ?? null, async (tx) => {
		const [existingSettings] = await tx.select().from(appSettings).limit(1);

		if (existingSettings) {
			const [updatedSettings] = await tx
				.update(appSettings)
				.set({
					allowRegistrations,
					updatedAt: new Date()
				})
				.where(eq(appSettings.id, existingSettings.id))
				.returning();

			return updatedSettings ?? existingSettings;
		}

		const [createdSettings] = await tx
			.insert(appSettings)
			.values({
				id: DEFAULT_APP_SETTINGS.id,
				allowRegistrations
			})
			.returning();

		return createdSettings ?? DEFAULT_APP_SETTINGS;
	});
}
