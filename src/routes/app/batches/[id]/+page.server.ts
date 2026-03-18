import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { nextBatchStatus } from '$lib/batches/config';
import {
	addBatchTelemetryForOwner,
	type BatchStatus,
	deleteBatchForOwner,
	getBatchForOwner,
	transitionBatchStatusForOwner,
	updateBatchLogForOwner
} from '$lib/server/batches';
import { optionalString, requiredString } from '$lib/server/forms';

export const load: PageServerLoad = async ({ params, locals }) => {
	const batch = await getBatchForOwner(params.id, locals.user!.id);

	if (!batch) {
		throw redirect(302, '/app/batches');
	}

	return {
		batch,
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
			return fail(404, { message: 'Batch not found.' });
		}

		return { success: true };
	},
	advanceStatus: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const nextStatus = requiredString(formData, 'nextStatus');

		try {
			const batch = await transitionBatchStatusForOwner(
				params.id,
				locals.user!.id,
				nextStatus as BatchStatus
			);

			if (!batch) {
				return fail(404, { message: 'Batch not found.' });
			}

			return { success: true };
		} catch (error) {
			if (error instanceof Response) throw error;
			return fail(400, { message: 'Unable to change batch status.' });
		}
	},
	addTelemetry: async ({ request, params, locals }) => {
		const formData = await request.formData();

		const entry = await addBatchTelemetryForOwner(params.id, locals.user!.id, {
			recordedAt: optionalString(formData, 'recordedAt')
				? new Date(requiredString(formData, 'recordedAt'))
				: null,
			gravity: optionalString(formData, 'gravity'),
			temperatureC: optionalString(formData, 'temperatureC'),
			notes: optionalString(formData, 'telemetryNotes')
		});

		if (!entry) {
			return fail(404, { message: 'Batch not found.' });
		}

		return { success: true };
	},
	delete: async ({ params, locals }) => {
		await deleteBatchForOwner(params.id, locals.user!.id);
		throw redirect(302, '/app/batches');
	}
};
