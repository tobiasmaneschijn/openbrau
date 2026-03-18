import type { BatchStatus } from '$lib/server/batches';

export const BATCH_STATUS_ORDER = [
	'draft',
	'brewing',
	'fermenting',
	'conditioning',
	'finished'
] as const satisfies readonly BatchStatus[];

export const BATCH_STATUS_LABELS: Record<BatchStatus, string> = {
	draft: 'Draft',
	brewing: 'Brewing',
	fermenting: 'Fermenting',
	conditioning: 'Conditioning',
	finished: 'Finished'
};

export const BATCH_STATUS_DESCRIPTIONS: Record<BatchStatus, string> = {
	draft: 'Recipe selected and brew day not started yet.',
	brewing: 'The batch is actively being brewed.',
	fermenting: 'Fermentation is underway.',
	conditioning: 'The beer is conditioning before packaging or serving.',
	finished: 'The batch is complete.'
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
