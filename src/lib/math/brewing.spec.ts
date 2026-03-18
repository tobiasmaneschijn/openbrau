import { describe, expect, it } from 'vitest';
import {
	estimateAbv,
	estimateFinalGravity,
	gravityPointsFromPpg,
	gravityPointsFromYieldPct,
	maltColorUnits,
	moreySrm,
	ragerIbu,
	specificGravityFromPoints,
	tinsethIbu
} from './brewing';

describe('brewing math', () => {
	it('calculates gravity points and converts them to specific gravity', () => {
		const points = gravityPointsFromPpg(37, 4.5, 20, 75);
		expect(points).toBeGreaterThan(40);
		expect(specificGravityFromPoints(points)).toBeGreaterThan(1.04);
	});

	it('calculates gravity points from yield percentage', () => {
		const points = gravityPointsFromYieldPct(80, 5, 20, 75);
		expect(points).toBeCloseTo(57.58, 1);
	});

	it('estimates abv', () => {
		expect(estimateAbv(1.052, 1.01)).toBeCloseTo(5.51, 2);
	});

	it('estimates final gravity from attenuation', () => {
		expect(estimateFinalGravity(1.06, 75)).toBeCloseTo(1.015, 3);
	});

	it('estimates color with Morey', () => {
		expect(moreySrm(10)).toBeCloseTo(7.24, 1);
	});

	it('calculates MCU from a fermentable addition', () => {
		expect(maltColorUnits(10, 4.5, 20)).toBeCloseTo(18.78, 1);
	});

	it('estimates ibu with Tinseth', () => {
		expect(
			tinsethIbu({
				alphaAcidPct: 10,
				amountKg: 0.05,
				batchSizeL: 20,
				timeMin: 60,
				gravity: 1.05
			})
		).toBeGreaterThan(20);
	});

	it('estimates ibu with Rager', () => {
		expect(
			ragerIbu({
				alphaAcidPct: 10,
				amountKg: 0.05,
				batchSizeL: 20,
				timeMin: 60,
				gravity: 1.05
			})
		).toBeGreaterThan(25);
	});
});
