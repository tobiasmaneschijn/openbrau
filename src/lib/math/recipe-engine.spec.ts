import { describe, expect, it } from 'vitest';
import { calculateRecipeSummary } from './recipe-engine';

describe('recipe engine summary', () => {
	it('calculates derived brewing stats from recipe inputs', () => {
		const summary = calculateRecipeSummary({
			name: 'House Pale Ale',
			brewType: 'beer',
			advancedMode: true,
			enabledModules: ['core', 'mash_steps'],
			process: {
				targetBatchSizeL: 20,
				boilTimeMin: 60,
				ibuFormula: 'tinseth'
			},
			targets: {
				og: 1.050,
				ibu: 34,
				srm: 6
			},
			fermentables: [
				{
					name: 'Pale Malt',
					amountKg: 4.6,
					yieldPct: 80,
					colorLovibond: 2
				},
				{
					name: 'Crystal 40',
					amountKg: 0.35,
					yieldPct: 74,
					colorLovibond: 40
				}
			],
			hops: [
				{
					name: 'Cascade',
					amountKg: 0.03,
					alphaAcidPct: 7,
					timeMin: 60,
					usePhase: 'boil'
				},
				{
					name: 'Cascade',
					amountKg: 0.025,
					alphaAcidPct: 7,
					timeMin: 10,
					usePhase: 'boil'
				}
			],
			yeasts: [
				{
					name: 'US-05',
					attenuationPct: 78
				}
			],
			miscs: []
		});

		expect(summary.modules).toEqual(['core', 'mash_steps']);
		expect(summary.batch.preBoilVolumeL).toBeCloseTo(23.25, 1);
		expect(summary.batch.totalLiquorRequirementL).toBeCloseTo(24.0, 1);
		expect(summary.computed.og).toBeCloseTo(1.054, 3);
		expect(summary.computed.fg).toBeCloseTo(1.012, 3);
		expect(summary.computed.abvPct).toBeCloseTo(5.51, 1);
		expect(summary.computed.ibu).toBeCloseTo(30.4, 1);
		expect(summary.computed.srm).toBeCloseTo(7.1, 1);
		expect(summary.warnings.some((warning) => warning.code === 'target-og-mismatch')).toBeTruthy();
		expect(summary.warnings.some((warning) => warning.code === 'target-ibu-mismatch')).toBeFalsy();
	});

	it('treats extract recipes as full-yield fermentables and ignores dry-hop bitterness', () => {
		const summary = calculateRecipeSummary({
			name: 'Quick IPA',
			brewType: 'beer',
			advancedMode: true,
			enabledModules: ['core', 'yeast_starter'],
			process: {
				targetBatchSizeL: 20,
				boilTimeMin: 30,
				ibuFormula: 'rager'
			},
			targets: {},
			fermentables: [
				{
					name: 'Light DME',
					amountKg: 3.2,
					yieldPct: 95,
					colorLovibond: 4,
					isExtract: true
				}
			],
			hops: [
				{
					name: 'Citra',
					amountKg: 0.04,
					alphaAcidPct: 12,
					timeMin: 30,
					usePhase: 'boil'
				},
				{
					name: 'Citra',
					amountKg: 0.06,
					alphaAcidPct: 12,
					timeMin: 0,
					usePhase: 'dry_hop'
				}
			],
			yeasts: [
				{
					name: 'Verdant',
					attenuationPct: 74
				}
			],
			miscs: [
				{
					name: 'Whirlfloc',
					timeMin: 10,
					usePhase: 'boil'
				}
			]
		});

		expect(summary.computed.og).toBeGreaterThan(1.05);
		expect(summary.computed.ibu).toBeGreaterThan(20);
		expect(summary.totals.miscCount).toBe(1);
		expect(summary.totals.hopsKg).toBeCloseTo(0.1, 3);
	});

	it('returns actionable warnings when the composition is incomplete', () => {
		const summary = calculateRecipeSummary({
			name: 'Placeholder',
			brewType: 'beer',
			advancedMode: false,
			enabledModules: ['core'],
			process: {
				targetBatchSizeL: 20,
				boilTimeMin: 60,
				ibuFormula: 'tinseth'
			},
			targets: {
				og: 1.05,
				fg: 1.01,
				ibu: 25,
				srm: 5
			},
			fermentables: [],
			hops: [],
			yeasts: [],
			miscs: []
		});

		expect(summary.computed.og).toBe(1.05);
		expect(summary.computed.fg).toBe(1.01);
		expect(summary.computed.ibu).toBe(25);
		expect(summary.computed.srm).toBe(5);
		expect(summary.warnings.map((warning) => warning.code)).toEqual(
			expect.arrayContaining(['missing-fermentables', 'missing-hops', 'missing-yeast'])
		);
	});
});
