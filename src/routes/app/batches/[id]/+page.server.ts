import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { buildBatchDashboardState } from '$lib/batches/dashboard';
import { BATCH_STATUS_ORDER, nextBatchStatus, previousBatchStatus } from '$lib/batches/config';
import { buildBatchSnapshotFromRecipe, snapshotToRecipeDefinition } from '$lib/batches/snapshot';
import { calculateRecipeSummary } from '$lib/math/recipe-engine';
import { enumField } from '$lib/server/forms';
import { listRecipeIngredientsForAuthor } from '$lib/server/recipe-items';
import { getRecipeForAuthor } from '$lib/server/recipes';
import {
	addBatchTelemetryForOwner,
	deleteBatchTelemetryForOwner,
	type BatchStatus,
	deleteBatchForOwner,
	getBatchForOwner,
	listBatchActivityForOwner,
	transitionBatchStatusForOwner,
	updateBatchSnapshotForOwner,
	updateBatchTelemetryForOwner,
	updateBatchLogForOwner
} from '$lib/server/batches';
import { optionalString, requiredString } from '$lib/server/forms';
import * as m from '$lib/paraglide/messages';

export const load: PageServerLoad = async ({ params, locals }) => {
	const batch = await getBatchForOwner(params.id, locals.user!.id);

	if (!batch) {
		throw redirect(302, '/app/batches');
	}

	const [recipe, ingredients, activity] = await Promise.all([
		getRecipeForAuthor(batch.recipeId, locals.user!.id),
		listRecipeIngredientsForAuthor(batch.recipeId, locals.user!.id),
		listBatchActivityForOwner(params.id, locals.user!.id)
	]);

	if (!recipe || !activity) {
		throw redirect(302, '/app/batches');
	}

	const formulationSnapshot = batch.snapshot ?? buildBatchSnapshotFromRecipe(recipe, ingredients);
	const formulationDefinition = snapshotToRecipeDefinition(formulationSnapshot);
	const engineSummary = calculateRecipeSummary(formulationDefinition);

	return {
		batch,
		engineSummary,
		formulationSnapshot,
		formulationJson: JSON.stringify(formulationSnapshot, null, 2),
		dashboard: buildBatchDashboardState({
			batch,
			definition: formulationDefinition,
			engineSummary,
			activity
		}),
		availableStatuses: BATCH_STATUS_ORDER,
		previousStatus: previousBatchStatus(batch.status),
		nextStatus: nextBatchStatus(batch.status)
	};
};

export const actions: Actions = {
	saveLog: async ({ request, params, locals }) => {
		const formData = await request.formData();

		const batch = await updateBatchLogForOwner(params.id, locals.user!.id, {
			brewDate: optionalString(formData, 'brewDate')
				? new Date(requiredString(formData, 'brewDate'))
				: null,
			actualBatchSizeL: optionalString(formData, 'actualBatchSizeL'),
			notes: optionalString(formData, 'notes')
		});

		if (!batch) {
			return fail(404, { message: m.batch_not_found() });
		}

		return { success: true };
	},
	changeStatus: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const nextStatus = enumField(formData, 'nextStatus', BATCH_STATUS_ORDER);

		try {
			const batch = await transitionBatchStatusForOwner(
				params.id,
				locals.user!.id,
				nextStatus as BatchStatus
			);

			if (!batch) {
				return fail(404, { message: m.batch_not_found() });
			}

			return { success: true };
		} catch (error) {
			if (error instanceof Response) throw error;
			return fail(400, { message: m.unable_to_change_batch_status() });
		}
	},
	saveFormulation: async ({ request, params, locals }) => {
		const formData = await request.formData();

		try {
			const batch = await updateBatchSnapshotForOwner(params.id, locals.user!.id, {
				name: requiredString(formData, 'name'),
				brewType: enumField(formData, 'brewType', ['beer', 'wine', 'mead'] as const),
				style: optionalString(formData, 'style'),
				notes: optionalString(formData, 'formulationNotes'),
				targetBatchSizeL: Number(requiredString(formData, 'targetBatchSizeL')),
				boilTimeMin: Number(requiredString(formData, 'boilTimeMin')),
				targetOg: optionalString(formData, 'targetOg')
					? Number(requiredString(formData, 'targetOg'))
					: null,
				targetFg: optionalString(formData, 'targetFg')
					? Number(requiredString(formData, 'targetFg'))
					: null,
				targetIbu: optionalString(formData, 'targetIbu')
					? Number(requiredString(formData, 'targetIbu'))
					: null,
				targetSrm: optionalString(formData, 'targetSrm')
					? Number(requiredString(formData, 'targetSrm'))
					: null,
				snapshotJson: optionalString(formData, 'snapshotJson')
			});

			if (!batch) {
				return fail(404, { message: m.batch_not_found() });
			}

			return { success: true };
		} catch (error) {
			if (error instanceof Response) throw error;
			if (error instanceof Error) {
				return fail(400, { message: error.message });
			}
			return fail(400, { message: m.unable_to_update_batch() });
		}
	},
	addTelemetry: async ({ request, params, locals }) => {
		const formData = await request.formData();

		try {
			const entry = await addBatchTelemetryForOwner(params.id, locals.user!.id, {
				recordedAt: optionalString(formData, 'recordedAt')
					? new Date(requiredString(formData, 'recordedAt'))
					: null,
				gravity: optionalString(formData, 'gravity'),
				temperatureC: optionalString(formData, 'temperatureC'),
				notes: optionalString(formData, 'telemetryNotes')
			});

			if (!entry) {
				return fail(404, { message: m.batch_not_found() });
			}

			return { success: true };
		} catch (error) {
			if (error instanceof Response) throw error;
			return fail(400, { message: m.unable_to_update_batch() });
		}
	},
	updateTelemetry: async ({ request, params, locals }) => {
		const formData = await request.formData();

		try {
			const entry = await updateBatchTelemetryForOwner(
				params.id,
				requiredString(formData, 'telemetryId'),
				locals.user!.id,
				{
					recordedAt: optionalString(formData, 'recordedAt')
						? new Date(requiredString(formData, 'recordedAt'))
						: null,
					gravity: optionalString(formData, 'gravity'),
					temperatureC: optionalString(formData, 'temperatureC'),
					notes: optionalString(formData, 'telemetryNotes')
				}
			);

			if (!entry) {
				return fail(404, { message: m.batch_not_found() });
			}

			return { success: true };
		} catch (error) {
			if (error instanceof Response) throw error;
			return fail(400, { message: m.unable_to_update_batch() });
		}
	},
	deleteTelemetry: async ({ request, params, locals }) => {
		const formData = await request.formData();

		try {
			const entry = await deleteBatchTelemetryForOwner(
				params.id,
				requiredString(formData, 'telemetryId'),
				locals.user!.id
			);

			if (!entry) {
				return fail(404, { message: m.batch_not_found() });
			}

			return { success: true };
		} catch (error) {
			if (error instanceof Response) throw error;
			return fail(400, { message: m.unable_to_update_batch() });
		}
	},
	delete: async ({ params, locals }) => {
		await deleteBatchForOwner(params.id, locals.user!.id);
		throw redirect(302, '/app/batches');
	}
};
