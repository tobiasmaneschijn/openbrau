import { describe, expect, it } from 'vitest';
import { canTransitionBatchStatus, nextBatchStatus } from './config';

describe('batch status flow', () => {
	it('advances batches through the expected sequence', () => {
		expect(nextBatchStatus('draft')).toBe('brewing');
		expect(nextBatchStatus('brewing')).toBe('fermenting');
		expect(nextBatchStatus('fermenting')).toBe('conditioning');
		expect(nextBatchStatus('conditioning')).toBe('finished');
		expect(nextBatchStatus('finished')).toBeNull();
	});

	it('only allows one-step transitions', () => {
		expect(canTransitionBatchStatus('draft', 'brewing')).toBe(true);
		expect(canTransitionBatchStatus('draft', 'fermenting')).toBe(false);
		expect(canTransitionBatchStatus('conditioning', 'finished')).toBe(true);
	});
});
