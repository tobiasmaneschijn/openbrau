import * as m from '$lib/paraglide/messages';
import type { BatchStatus } from '$lib/server/batches';

export const BATCH_STATUS_ORDER = [
	'draft',
	'brewing',
	'fermenting',
	'conditioning',
	'finished'
] as const satisfies readonly BatchStatus[];

export const BATCH_STATUS_LABELS: Record<BatchStatus, string> = {
	draft: m.batch_status_draft(),
	brewing: m.batch_status_brewing(),
	fermenting: m.batch_status_fermenting(),
	conditioning: m.batch_status_conditioning(),
	finished: m.batch_status_finished()
};

export const BATCH_STATUS_DESCRIPTIONS: Record<BatchStatus, string> = {
	draft: m.batch_status_draft_description(),
	brewing: m.batch_status_brewing_description(),
	fermenting: m.batch_status_fermenting_description(),
	conditioning: m.batch_status_conditioning_description(),
	finished: m.batch_status_finished_description()
};

export function nextBatchStatus(status: BatchStatus) {
	const currentIndex = BATCH_STATUS_ORDER.indexOf(status);

	if (currentIndex === -1 || currentIndex === BATCH_STATUS_ORDER.length - 1) {
		return null;
	}

	return BATCH_STATUS_ORDER[currentIndex + 1];
}

export function canTransitionBatchStatus(current: BatchStatus, next: BatchStatus) {
	return nextBatchStatus(current) === next;
}
