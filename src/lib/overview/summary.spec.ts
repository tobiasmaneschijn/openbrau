import { describe, expect, it } from 'vitest';
import { countBatchesByStatus, countIngredients } from './summary';

describe('overview summary helpers', () => {
	it('counts all ingredient kinds into one total', () => {
		expect(
			countIngredients({
				fermentables: [{ id: 'f-1' }],
				hops: [{ id: 'h-1' }, { id: 'h-2' }],
				yeasts: [],
				miscs: [{ id: 'm-1' }]
			} as never)
		).toBe(4);
	});

	it('returns batch counts for every known status including zeros', () => {
		expect(
			countBatchesByStatus([
				{ status: 'draft' },
				{ status: 'brewing' },
				{ status: 'brewing' },
				{ status: 'finished' }
			] as never)
		).toEqual({
			draft: 1,
			brewing: 2,
			fermenting: 0,
			conditioning: 0,
			finished: 1
		});
	});
});
