import { describe, expect, it } from 'vitest';
import { canTransitionBatchStatus, nextBatchStatus, previousBatchStatus } from './config';

describe('batch status flow', () => {
	it('advances batches through the expected sequence', () => {
		expect(nextBatchStatus('draft')).toBe('brewing');
		expect(nextBatchStatus('brewing')).toBe('fermenting');
		expect(nextBatchStatus('fermenting')).toBe('conditioning');
		expect(nextBatchStatus('conditioning')).toBe('finished');
		expect(nextBatchStatus('finished')).toBeNull();
	});

	it('steps backward through the expected sequence', () => {
		expect(previousBatchStatus('draft')).toBeNull();
		expect(previousBatchStatus('brewing')).toBe('draft');
		expect(previousBatchStatus('fermenting')).toBe('brewing');
		expect(previousBatchStatus('conditioning')).toBe('fermenting');
		expect(previousBatchStatus('finished')).toBe('conditioning');
	});

	it('allows reversible phase changes and blocks no-op updates', () => {
		expect(canTransitionBatchStatus('draft', 'brewing')).toBe(true);
		expect(canTransitionBatchStatus('draft', 'fermenting')).toBe(true);
		expect(canTransitionBatchStatus('conditioning', 'brewing')).toBe(true);
		expect(canTransitionBatchStatus('conditioning', 'finished')).toBe(true);
		expect(canTransitionBatchStatus('conditioning', 'conditioning')).toBe(false);
	});
});
