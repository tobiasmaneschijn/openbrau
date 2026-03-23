import type { RecipeDefinition } from './domain';

export type BeerXmlRecipeType = 'All Grain' | 'Extract' | 'Partial Mash';

export type BeerXmlFermentable = {
	name: string;
	type?: string | null;
	amountKg: number;
	yieldPct: number;
	colorLovibond: number;
	origin?: string | null;
	supplier?: string | null;
	notes?: string | null;
	coarseFineDiffPct?: number | null;
	moisturePct?: number | null;
	diastaticPowerLintner?: number | null;
	proteinPct?: number | null;
	maxInBatchPct?: number | null;
	recommendMash?: boolean | null;
	addAfterBoil?: boolean | null;
};

export type BeerXmlHop = {
	name: string;
	alphaAcidPct: number;
	amountKg: number;
	use: 'Mash' | 'First Wort' | 'Boil' | 'Whirlpool' | 'Dry Hop';
	timeMin: number;
	notes?: string | null;
	type?: string | null;
	form?: string | null;
	origin?: string | null;
	supplier?: string | null;
	betaAcidPct?: number | null;
	hsiPct?: number | null;
	substitutes?: string | null;
	cohumulonePct?: number | null;
	myrcenePct?: number | null;
};

export type BeerXmlYeast = {
	name: string;
	type?: string | null;
	form?: string | null;
	amount?: number | null;
	amountIsWeight?: boolean | null;
	laboratory?: string | null;
	productId?: string | null;
	minTemperatureC?: number | null;
	maxTemperatureC?: number | null;
	flocculation?: string | null;
	attenuationPct?: number | null;
	notes?: string | null;
	bestFor?: string | null;
	maxReuse?: number | null;
	addToSecondary?: boolean | null;
	inventory?: string | null;
	cultureDate?: string | null;
};

export type BeerXmlMisc = {
	name: string;
	type?: string | null;
	use: 'Mash' | 'Boil' | 'Whirlpool' | 'Fermentation' | 'Packaging';
	useFor?: string | null;
	timeMin?: number | null;
	amount?: number | null;
	amountIsWeight?: boolean | null;
	notes?: string | null;
};

export type BeerXmlRecipeRecord = {
	name: string;
	type: BeerXmlRecipeType;
	batchSizeL: number;
	boilTimeMin: number;
	og?: number | null;
	fg?: number | null;
	ibu?: number | null;
	colorSrm?: number | null;
	notes?: string | null;
	fermentables: BeerXmlFermentable[];
	hops: BeerXmlHop[];
	yeasts: BeerXmlYeast[];
	miscs: BeerXmlMisc[];
};

function escapeXml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

function decodeXml(value: string) {
	return value
		.replaceAll('&lt;', '<')
		.replaceAll('&gt;', '>')
		.replaceAll('&quot;', '"')
		.replaceAll('&apos;', "'")
		.replaceAll('&amp;', '&');
}

function textTag(tag: string, value: string | null | undefined) {
	if (value == null || value === '') {
		return '';
	}

	return `<${tag}>${escapeXml(value)}</${tag}>`;
}

function numberTag(tag: string, value: number | null | undefined) {
	if (value == null || Number.isNaN(value)) {
		return '';
	}

	return `<${tag}>${value}</${tag}>`;
}

function booleanTag(tag: string, value: boolean | null | undefined) {
	if (value == null) {
		return '';
	}

	return `<${tag}>${value ? 'TRUE' : 'FALSE'}</${tag}>`;
}

function dateTag(tag: string, value: Date | string | null | undefined) {
	if (value == null || value === '') {
		return '';
	}

	const iso = value instanceof Date ? value.toISOString().slice(0, 10) : value;
	return `<${tag}>${escapeXml(iso)}</${tag}>`;
}

function wrapBlock(tag: string, lines: string[], indent = '      ') {
	return [
		`${indent}<${tag}>`,
		...lines.map((line) => `${indent}  ${line}`),
		`${indent}</${tag}>`
	].join('\n');
}

function extractTagValue(source: string, tag: string) {
	const match = source.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
	return match ? decodeXml(match[1].trim()) : null;
}

function extractBlocks(source: string, tag: string) {
	return [...source.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'gi'))].map((match) =>
		match[1].trim()
	);
}

function extractNumber(source: string, tag: string) {
	const value = extractTagValue(source, tag);
	return value == null || value === '' ? null : Number(value);
}

function extractBoolean(source: string, tag: string) {
	const value = extractTagValue(source, tag);
	if (value == null || value === '') {
		return null;
	}

	return ['true', 't', '1', 'yes'].includes(value.toLowerCase());
}

function hopUseToBeerXml(value: string | undefined): BeerXmlHop['use'] {
	switch (value) {
		case 'mash':
			return 'Mash';
		case 'first_wort':
			return 'First Wort';
		case 'whirlpool':
			return 'Whirlpool';
		case 'dry_hop':
			return 'Dry Hop';
		default:
			return 'Boil';
	}
}

function hopUseFromBeerXml(value: BeerXmlHop['use']) {
	switch (value) {
		case 'Mash':
			return 'mash' as const;
		case 'First Wort':
			return 'first_wort' as const;
		case 'Whirlpool':
			return 'whirlpool' as const;
		case 'Dry Hop':
			return 'dry_hop' as const;
		default:
			return 'boil' as const;
	}
}

function miscUseToBeerXml(value: string | undefined): BeerXmlMisc['use'] {
	switch (value) {
		case 'mash':
			return 'Mash';
		case 'whirlpool':
			return 'Whirlpool';
		case 'fermentation':
			return 'Fermentation';
		case 'packaging':
			return 'Packaging';
		default:
			return 'Boil';
	}
}

function miscUseFromBeerXml(value: BeerXmlMisc['use']) {
	switch (value) {
		case 'Mash':
			return 'mash' as const;
		case 'Whirlpool':
			return 'whirlpool' as const;
		case 'Fermentation':
			return 'fermentation' as const;
		case 'Packaging':
			return 'packaging' as const;
		default:
			return 'boil' as const;
	}
}

export function toBeerXmlRecord(recipe: RecipeDefinition): BeerXmlRecipeRecord {
	return {
		name: recipe.name,
		type: recipe.fermentables.some((fermentable) => fermentable.isExtract)
			? 'Extract'
			: 'All Grain',
		batchSizeL: recipe.process.targetBatchSizeL,
		boilTimeMin: recipe.process.boilTimeMin,
		og: recipe.targets.og ?? null,
		fg: recipe.targets.fg ?? null,
		ibu: recipe.targets.ibu ?? null,
		colorSrm: recipe.targets.srm ?? null,
		notes: recipe.notes ?? null,
		fermentables: recipe.fermentables.map((fermentable) => ({
			name: fermentable.name,
			type: fermentable.type ?? (fermentable.isExtract ? 'Extract' : 'Grain'),
			amountKg: fermentable.amountKg,
			yieldPct: fermentable.yieldPct,
			colorLovibond: fermentable.colorLovibond,
			origin: fermentable.origin ?? null,
			supplier: fermentable.supplier ?? null,
			notes: fermentable.notes ?? null,
			coarseFineDiffPct: fermentable.coarseFineDiffPct ?? null,
			moisturePct: fermentable.moisturePct ?? null,
			diastaticPowerLintner: fermentable.diastaticPowerLintner ?? null,
			proteinPct: fermentable.proteinPct ?? null,
			maxInBatchPct: fermentable.maxInBatchPct ?? null,
			recommendMash: fermentable.recommendMash ?? null,
			addAfterBoil: fermentable.addAfterBoil ?? (fermentable.isExtract ? true : null)
		})),
		hops: recipe.hops.map((hop) => ({
			name: hop.name,
			alphaAcidPct: hop.alphaAcidPct,
			amountKg: hop.amountKg,
			use: hopUseToBeerXml(hop.usePhase),
			timeMin: hop.timeMin,
			notes: hop.notes ?? null,
			type: hop.type ?? null,
			form: hop.form ?? null,
			origin: hop.origin ?? null,
			supplier: hop.supplier ?? null,
			betaAcidPct: hop.betaAcidPct ?? null,
			hsiPct: hop.hsiPct ?? null,
			substitutes: hop.substitutes ?? null,
			cohumulonePct: hop.cohumulonePct ?? null,
			myrcenePct: hop.myrcenePct ?? null
		})),
		yeasts: recipe.yeasts.map((yeast) => ({
			name: yeast.name,
			type: yeast.type ?? null,
			form: yeast.form ?? null,
			amount: yeast.amountIsWeight === false ? (yeast.amountL ?? null) : (yeast.amountKg ?? null),
			amountIsWeight: yeast.amountIsWeight ?? null,
			laboratory: yeast.lab ?? null,
			productId: yeast.productCode ?? null,
			minTemperatureC: yeast.minTemperatureC ?? null,
			maxTemperatureC: yeast.maxTemperatureC ?? null,
			flocculation: yeast.flocculation ?? null,
			attenuationPct: yeast.attenuationPct ?? null,
			notes: yeast.notes ?? null,
			bestFor: yeast.bestFor ?? null,
			maxReuse: yeast.maxReuse ?? null,
			addToSecondary: yeast.addToSecondary ?? null,
			inventory: yeast.inventory ?? null,
			cultureDate: yeast.cultureDate ? yeast.cultureDate.toISOString().slice(0, 10) : null
		})),
		miscs: recipe.miscs.map((misc) => ({
			name: misc.name,
			type: misc.type ?? null,
			use: miscUseToBeerXml(misc.usePhase),
			useFor: misc.useFor ?? null,
			timeMin: misc.timeMin ?? null,
			amount: misc.amountIsWeight === false ? (misc.amountL ?? null) : (misc.amountKg ?? null),
			amountIsWeight: misc.amountIsWeight ?? null,
			notes: misc.notes ?? misc.description ?? null
		}))
	};
}

export function fromBeerXmlRecord(record: BeerXmlRecipeRecord): RecipeDefinition {
	return {
		name: record.name,
		brewType: 'beer',
		notes: record.notes ?? null,
		advancedMode: false,
		enabledModules: ['core'],
		process: {
			targetBatchSizeL: record.batchSizeL,
			boilTimeMin: record.boilTimeMin,
			ibuFormula: 'tinseth'
		},
		targets: {
			og: record.og ?? null,
			fg: record.fg ?? null,
			ibu: record.ibu ?? null,
			srm: record.colorSrm ?? null
		},

		fermentables: record.fermentables.map((fermentable) => ({
			name: fermentable.name,
			amountKg: fermentable.amountKg,
			yieldPct: fermentable.yieldPct,
			colorLovibond: fermentable.colorLovibond,
			type: fermentable.type ?? null,
			origin: fermentable.origin ?? null,
			supplier: fermentable.supplier ?? null,
			notes: fermentable.notes ?? null,
			coarseFineDiffPct: fermentable.coarseFineDiffPct ?? null,
			moisturePct: fermentable.moisturePct ?? null,
			diastaticPowerLintner: fermentable.diastaticPowerLintner ?? null,
			proteinPct: fermentable.proteinPct ?? null,
			maxInBatchPct: fermentable.maxInBatchPct ?? null,
			recommendMash: fermentable.recommendMash ?? undefined,
			addAfterBoil: fermentable.addAfterBoil ?? undefined,
			isExtract: record.type === 'Extract' || fermentable.type === 'Extract'
		})),
		hops: record.hops.map((hop) => ({
			name: hop.name,
			amountKg: hop.amountKg,
			alphaAcidPct: hop.alphaAcidPct,
			timeMin: hop.timeMin,
			betaAcidPct: hop.betaAcidPct ?? null,
			form: hop.form ?? null,
			type: hop.type ?? null,
			origin: hop.origin ?? null,
			supplier: hop.supplier ?? null,
			hsiPct: hop.hsiPct ?? null,
			substitutes: hop.substitutes ?? null,
			cohumulonePct: hop.cohumulonePct ?? null,
			myrcenePct: hop.myrcenePct ?? null,
			notes: hop.notes ?? null,
			usePhase: hopUseFromBeerXml(hop.use)
		})),
		yeasts: record.yeasts.map((yeast) => ({
			name: yeast.name,
			lab: yeast.laboratory ?? null,
			productCode: yeast.productId ?? null,
			type: yeast.type ?? null,
			form: yeast.form ?? null,
			attenuationPct: yeast.attenuationPct ?? null,
			minTemperatureC: yeast.minTemperatureC ?? null,
			maxTemperatureC: yeast.maxTemperatureC ?? null,
			flocculation: yeast.flocculation ?? null,
			bestFor: yeast.bestFor ?? null,
			maxReuse: yeast.maxReuse ?? null,
			inventory: yeast.inventory ?? null,
			cultureDate: yeast.cultureDate ? new Date(yeast.cultureDate) : null,
			addToSecondary: yeast.addToSecondary ?? undefined,
			notes: yeast.notes ?? null,
			amountKg: yeast.amountIsWeight === false ? null : (yeast.amount ?? null),
			amountL: yeast.amountIsWeight === false ? (yeast.amount ?? null) : null,
			amountIsWeight: yeast.amountIsWeight ?? undefined
		})),
		miscs: record.miscs.map((misc) => ({
			name: misc.name,
			type: misc.type ?? null,
			useFor: misc.useFor ?? null,
			description: misc.notes ?? null,
			notes: misc.notes ?? null,
			timeMin: misc.timeMin ?? null,
			usePhase: miscUseFromBeerXml(misc.use),
			amountKg: misc.amountIsWeight === false ? null : (misc.amount ?? null),
			amountL: misc.amountIsWeight === false ? (misc.amount ?? null) : null,
			amountIsWeight: misc.amountIsWeight ?? undefined
		}))
	};
}

export function serializeBeerXmlRecipe(record: BeerXmlRecipeRecord) {
	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<RECIPES>',
		'  <RECIPE>',
		`    <NAME>${escapeXml(record.name)}</NAME>`,
		`    <TYPE>${record.type}</TYPE>`,
		`    <BATCH_SIZE>${record.batchSizeL}</BATCH_SIZE>`,
		`    <BOIL_TIME>${record.boilTimeMin}</BOIL_TIME>`,
		record.og == null ? '' : `    <OG>${record.og}</OG>`,
		record.fg == null ? '' : `    <FG>${record.fg}</FG>`,
		record.ibu == null ? '' : `    <IBU>${record.ibu}</IBU>`,
		record.colorSrm == null ? '' : `    <COLOR>${record.colorSrm}</COLOR>`,
		record.notes ? `    <NOTES>${escapeXml(record.notes)}</NOTES>` : '',
		'    <FERMENTABLES>',
		...record.fermentables.map((fermentable) =>
			wrapBlock(
				'FERMENTABLE',
				[
					textTag('NAME', fermentable.name),
					textTag('TYPE', fermentable.type ?? null),
					numberTag('AMOUNT', fermentable.amountKg),
					numberTag('YIELD', fermentable.yieldPct),
					numberTag('COLOR', fermentable.colorLovibond),
					textTag('ORIGIN', fermentable.origin ?? null),
					textTag('SUPPLIER', fermentable.supplier ?? null),
					textTag('NOTES', fermentable.notes ?? null),
					numberTag('COARSE_FINE_DIFF', fermentable.coarseFineDiffPct ?? null),
					numberTag('MOISTURE', fermentable.moisturePct ?? null),
					numberTag('DIASTATIC_POWER', fermentable.diastaticPowerLintner ?? null),
					numberTag('PROTEIN', fermentable.proteinPct ?? null),
					numberTag('MAX_IN_BATCH', fermentable.maxInBatchPct ?? null),
					booleanTag('RECOMMEND_MASH', fermentable.recommendMash ?? null),
					booleanTag('ADD_AFTER_BOIL', fermentable.addAfterBoil ?? null)
				].filter(Boolean)
			)
		),
		'    </FERMENTABLES>',
		'    <HOPS>',
		...record.hops.map((hop) =>
			wrapBlock(
				'HOP',
				[
					textTag('NAME', hop.name),
					numberTag('ALPHA', hop.alphaAcidPct),
					numberTag('AMOUNT', hop.amountKg),
					textTag('USE', hop.use),
					numberTag('TIME', hop.timeMin),
					textTag('NOTES', hop.notes ?? null),
					textTag('TYPE', hop.type ?? null),
					textTag('FORM', hop.form ?? null),
					textTag('ORIGIN', hop.origin ?? null),
					textTag('SUPPLIER', hop.supplier ?? null),
					numberTag('BETA', hop.betaAcidPct ?? null),
					numberTag('HSI', hop.hsiPct ?? null),
					textTag('SUBSTITUTES', hop.substitutes ?? null),
					numberTag('COHUMULONE', hop.cohumulonePct ?? null),
					numberTag('MYRCENE', hop.myrcenePct ?? null)
				].filter(Boolean)
			)
		),
		'    </HOPS>',
		'    <YEASTS>',
		...record.yeasts.map((yeast) =>
			wrapBlock(
				'YEAST',
				[
					textTag('NAME', yeast.name),
					textTag('TYPE', yeast.type ?? null),
					textTag('FORM', yeast.form ?? null),
					numberTag('AMOUNT', yeast.amount ?? null),
					booleanTag('AMOUNT_IS_WEIGHT', yeast.amountIsWeight ?? null),
					textTag('LABORATORY', yeast.laboratory ?? null),
					textTag('PRODUCT_ID', yeast.productId ?? null),
					numberTag('MIN_TEMPERATURE', yeast.minTemperatureC ?? null),
					numberTag('MAX_TEMPERATURE', yeast.maxTemperatureC ?? null),
					textTag('FLOCCULATION', yeast.flocculation ?? null),
					numberTag('ATTENUATION', yeast.attenuationPct ?? null),
					textTag('NOTES', yeast.notes ?? null),
					textTag('BEST_FOR', yeast.bestFor ?? null),
					numberTag('MAX_REUSE', yeast.maxReuse ?? null),
					booleanTag('ADD_TO_SECONDARY', yeast.addToSecondary ?? null),
					textTag('INVENTORY', yeast.inventory ?? null),
					dateTag('CULTURE_DATE', yeast.cultureDate ?? null)
				].filter(Boolean)
			)
		),
		'    </YEASTS>',
		'    <MISCS>',
		...record.miscs.map((misc) =>
			wrapBlock(
				'MISC',
				[
					textTag('NAME', misc.name),
					textTag('TYPE', misc.type ?? null),
					textTag('USE', misc.use),
					textTag('USE_FOR', misc.useFor ?? null),
					numberTag('TIME', misc.timeMin ?? null),
					numberTag('AMOUNT', misc.amount ?? null),
					booleanTag('AMOUNT_IS_WEIGHT', misc.amountIsWeight ?? null),
					textTag('NOTES', misc.notes ?? null)
				].filter(Boolean)
			)
		),
		'    </MISCS>',
		'  </RECIPE>',
		'</RECIPES>'
	]
		.filter(Boolean)
		.join('\n');
}

export function parseBeerXmlRecipe(xml: string): BeerXmlRecipeRecord {
	const recipeBlock = extractBlocks(xml, 'RECIPE')[0];

	if (!recipeBlock) {
		throw new Error('BeerXML recipe not found.');
	}

	const fermentables = extractBlocks(recipeBlock, 'FERMENTABLE').map((block) => ({
		name: extractTagValue(block, 'NAME') ?? 'Fermentable',
		type: extractTagValue(block, 'TYPE'),
		amountKg: extractNumber(block, 'AMOUNT') ?? 0,
		yieldPct: extractNumber(block, 'YIELD') ?? 0,
		colorLovibond: extractNumber(block, 'COLOR') ?? 0,
		origin: extractTagValue(block, 'ORIGIN'),
		supplier: extractTagValue(block, 'SUPPLIER'),
		notes: extractTagValue(block, 'NOTES'),
		coarseFineDiffPct: extractNumber(block, 'COARSE_FINE_DIFF'),
		moisturePct: extractNumber(block, 'MOISTURE'),
		diastaticPowerLintner: extractNumber(block, 'DIASTATIC_POWER'),
		proteinPct: extractNumber(block, 'PROTEIN'),
		maxInBatchPct: extractNumber(block, 'MAX_IN_BATCH'),
		recommendMash: extractBoolean(block, 'RECOMMEND_MASH'),
		addAfterBoil: extractBoolean(block, 'ADD_AFTER_BOIL')
	}));

	const hops = extractBlocks(recipeBlock, 'HOP').map((block) => ({
		name: extractTagValue(block, 'NAME') ?? 'Hop',
		alphaAcidPct: extractNumber(block, 'ALPHA') ?? 0,
		amountKg: extractNumber(block, 'AMOUNT') ?? 0,
		use: (extractTagValue(block, 'USE') as BeerXmlHop['use']) ?? 'Boil',
		timeMin: extractNumber(block, 'TIME') ?? 0,
		notes: extractTagValue(block, 'NOTES'),
		type: extractTagValue(block, 'TYPE'),
		form: extractTagValue(block, 'FORM'),
		origin: extractTagValue(block, 'ORIGIN'),
		supplier: extractTagValue(block, 'SUPPLIER'),
		betaAcidPct: extractNumber(block, 'BETA'),
		hsiPct: extractNumber(block, 'HSI'),
		substitutes: extractTagValue(block, 'SUBSTITUTES'),
		cohumulonePct: extractNumber(block, 'COHUMULONE'),
		myrcenePct: extractNumber(block, 'MYRCENE')
	}));

	const yeasts = extractBlocks(recipeBlock, 'YEAST').map((block) => ({
		name: extractTagValue(block, 'NAME') ?? 'Yeast',
		type: extractTagValue(block, 'TYPE'),
		form: extractTagValue(block, 'FORM'),
		amount: extractNumber(block, 'AMOUNT'),
		amountIsWeight: extractBoolean(block, 'AMOUNT_IS_WEIGHT'),
		laboratory: extractTagValue(block, 'LABORATORY'),
		productId: extractTagValue(block, 'PRODUCT_ID'),
		minTemperatureC: extractNumber(block, 'MIN_TEMPERATURE'),
		maxTemperatureC: extractNumber(block, 'MAX_TEMPERATURE'),
		flocculation: extractTagValue(block, 'FLOCCULATION'),
		attenuationPct: extractNumber(block, 'ATTENUATION'),
		notes: extractTagValue(block, 'NOTES'),
		bestFor: extractTagValue(block, 'BEST_FOR'),
		maxReuse: extractNumber(block, 'MAX_REUSE'),
		addToSecondary: extractBoolean(block, 'ADD_TO_SECONDARY'),
		inventory: extractTagValue(block, 'INVENTORY'),
		cultureDate: extractTagValue(block, 'CULTURE_DATE')
	}));

	const miscs = extractBlocks(recipeBlock, 'MISC').map((block) => ({
		name: extractTagValue(block, 'NAME') ?? 'Misc',
		type: extractTagValue(block, 'TYPE'),
		use: (extractTagValue(block, 'USE') as BeerXmlMisc['use']) ?? 'Boil',
		useFor: extractTagValue(block, 'USE_FOR'),
		timeMin: extractNumber(block, 'TIME'),
		amount: extractNumber(block, 'AMOUNT'),
		amountIsWeight: extractBoolean(block, 'AMOUNT_IS_WEIGHT'),
		notes: extractTagValue(block, 'NOTES')
	}));

	return {
		name: extractTagValue(recipeBlock, 'NAME') ?? 'Imported recipe',
		type: (extractTagValue(recipeBlock, 'TYPE') as BeerXmlRecipeType) ?? 'All Grain',
		batchSizeL: extractNumber(recipeBlock, 'BATCH_SIZE') ?? 0,
		boilTimeMin: extractNumber(recipeBlock, 'BOIL_TIME') ?? 60,
		og: extractNumber(recipeBlock, 'OG'),
		fg: extractNumber(recipeBlock, 'FG'),
		ibu: extractNumber(recipeBlock, 'IBU'),
		colorSrm: extractNumber(recipeBlock, 'COLOR'),
		notes: extractTagValue(recipeBlock, 'NOTES'),
		fermentables,
		hops,
		yeasts,
		miscs
	};
}
