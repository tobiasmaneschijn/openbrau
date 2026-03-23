import { describe, expect, it } from 'vitest';
import {
	fromBeerXmlRecord,
	parseBeerXmlRecipe,
	serializeBeerXmlRecipe,
	toBeerXmlRecord
} from './beerxml';

describe('BeerXML boundary mapping', () => {
	it('maps internal recipe definitions to BeerXML-friendly records', () => {
		const record = toBeerXmlRecord({
			name: 'Export Lager',
			brewType: 'beer',
			notes: 'Crisp and dry',
			advancedMode: true,
			enabledModules: ['core', 'water_chemistry'],
			process: {
				targetBatchSizeL: 23,
				boilTimeMin: 75,
				ibuFormula: 'rager'
			},
			targets: {
				og: 1.05,
				fg: 1.01,
				ibu: 28,
				srm: 4
			},

			fermentables: [
				{
					name: 'Pilsner Malt',
					amountKg: 4.8,
					yieldPct: 81,
					colorLovibond: 1.8,
					type: 'Grain',
					origin: 'Germany',
					supplier: 'BestMalz',
					recommendMash: true
				}
			],
			hops: [
				{
					name: 'Saaz',
					amountKg: 0.05,
					alphaAcidPct: 3.5,
					timeMin: 60,
					usePhase: 'boil',
					form: 'Pellet',
					origin: 'Czechia'
				}
			],
			yeasts: [
				{
					name: '34/70',
					attenuationPct: 78,
					lab: 'Fermentis',
					form: 'Dry'
				}
			],
			miscs: [
				{
					name: 'Yeast Nutrient',
					type: 'Nutrient',
					useFor: 'Fermentation health',
					timeMin: 10,
					usePhase: 'boil',
					amountKg: 0.001,
					amountIsWeight: true
				}
			]
		});

		expect(record.batchSizeL).toBe(23);
		expect(record.boilTimeMin).toBe(75);
		expect(record.hops[0]?.use).toBe('Boil');
		expect(record.notes).toBe('Crisp and dry');
		expect(record.fermentables[0]?.supplier).toBe('BestMalz');
		expect(record.yeasts[0]?.laboratory).toBe('Fermentis');
		expect(record.miscs[0]?.amountIsWeight).toBe(true);
	});

	it('maps BeerXML records back into internal metric-first recipes', () => {
		const recipe = fromBeerXmlRecord({
			name: 'Imported IPA',
			type: 'Extract',
			batchSizeL: 19,
			boilTimeMin: 45,
			og: 1.058,
			fg: 1.012,
			ibu: 42,
			colorSrm: 8,
			fermentables: [
				{
					name: 'Pale Extract',
					type: 'Extract',
					amountKg: 3.5,
					yieldPct: 95,
					colorLovibond: 6,
					origin: 'United States',
					supplier: 'Briess',
					addAfterBoil: true
				}
			],
			hops: [
				{
					name: 'Mosaic',
					amountKg: 0.035,
					alphaAcidPct: 12,
					timeMin: 15,
					use: 'Whirlpool',
					form: 'Pellet',
					type: 'Aroma'
				}
			],
			yeasts: [
				{
					name: 'US-05',
					type: 'Ale',
					form: 'Dry',
					attenuationPct: 78,
					laboratory: 'Fermentis',
					amount: 0.011,
					amountIsWeight: true
				}
			],
			miscs: [
				{
					name: 'Nutrient',
					type: 'Nutrient',
					use: 'Boil',
					useFor: 'Fermentation support',
					timeMin: 10,
					amount: 0.001,
					amountIsWeight: true,
					notes: 'Add near the end of the boil.'
				}
			]
		});

		expect(recipe.process.targetBatchSizeL).toBe(19);
		expect(recipe.fermentables[0]?.isExtract).toBe(true);
		expect(recipe.hops[0]?.usePhase).toBe('whirlpool');
		expect(recipe.miscs[0]?.usePhase).toBe('boil');
		expect(recipe.yeasts[0]?.lab).toBe('Fermentis');
		expect(recipe.miscs[0]?.type).toBe('Nutrient');
	});

	it('serializes a BeerXML recipe document', () => {
		const xml = serializeBeerXmlRecipe({
			name: 'XML Bitter',
			type: 'All Grain',
			batchSizeL: 20,
			boilTimeMin: 60,
			og: 1.046,
			fg: 1.01,
			ibu: 30,
			colorSrm: 9,
			fermentables: [],
			hops: [],
			yeasts: [],
			miscs: []
		});

		expect(xml).toContain('<RECIPES>');
		expect(xml).toContain('<NAME>XML Bitter</NAME>');
		expect(xml).toContain('<BATCH_SIZE>20</BATCH_SIZE>');
		expect(xml).toContain('<TYPE>All Grain</TYPE>');
	});

	it('parses a BeerXML recipe document', () => {
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<RECIPES>
  <RECIPE>
    <NAME>Parsed Porter</NAME>
    <TYPE>All Grain</TYPE>
    <BATCH_SIZE>21</BATCH_SIZE>
    <BOIL_TIME>70</BOIL_TIME>
    <OG>1.056</OG>
    <FG>1.014</FG>
    <IBU>32</IBU>
    <COLOR>28</COLOR>
    <FERMENTABLES>
      <FERMENTABLE>
        <NAME>Maris Otter</NAME>
        <TYPE>Grain</TYPE>
        <AMOUNT>4.8</AMOUNT>
        <YIELD>80</YIELD>
        <COLOR>3</COLOR>
        <ORIGIN>United Kingdom</ORIGIN>
        <SUPPLIER>Crisp</SUPPLIER>
      </FERMENTABLE>
    </FERMENTABLES>
    <HOPS>
      <HOP>
        <NAME>East Kent Goldings</NAME>
        <AMOUNT>0.04</AMOUNT>
        <ALPHA>5.5</ALPHA>
        <TIME>60</TIME>
        <USE>Boil</USE>
        <FORM>Leaf</FORM>
      </HOP>
    </HOPS>
    <YEASTS>
      <YEAST>
        <NAME>S-04</NAME>
        <LABORATORY>Fermentis</LABORATORY>
        <ATTENUATION>75</ATTENUATION>
      </YEAST>
    </YEASTS>
    <MISCS>
      <MISC>
        <NAME>Irish Moss</NAME>
        <TYPE>Fining</TYPE>
        <USE>Boil</USE>
        <TIME>10</TIME>
        <AMOUNT>0.003</AMOUNT>
        <AMOUNT_IS_WEIGHT>TRUE</AMOUNT_IS_WEIGHT>
      </MISC>
    </MISCS>
  </RECIPE>
</RECIPES>`;

		const record = parseBeerXmlRecipe(xml);

		expect(record.name).toBe('Parsed Porter');
		expect(record.batchSizeL).toBe(21);
		expect(record.hops[0]?.use).toBe('Boil');
		expect(record.fermentables[0]?.amountKg).toBe(4.8);
		expect(record.fermentables[0]?.origin).toBe('United Kingdom');
		expect(record.yeasts[0]?.laboratory).toBe('Fermentis');
		expect(record.miscs[0]?.amountIsWeight).toBe(true);
	});
});
