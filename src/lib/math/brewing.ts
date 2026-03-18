export function gravityPointsFromPpg(
	ppg: number,
	amountKg: number,
	batchSizeL: number,
	efficiencyPct = 100
) {
	const pounds = amountKg * 2.2046226218;
	const gallons = batchSizeL / 3.785411784;
	const efficiency = efficiencyPct / 100;

	return (ppg * pounds * efficiency) / gallons;
}

export function ppgFromYieldPct(yieldPct: number) {
	return 46 * (yieldPct / 100);
}

export function gravityPointsFromYieldPct(
	yieldPct: number,
	amountKg: number,
	batchSizeL: number,
	efficiencyPct = 100
) {
	return gravityPointsFromPpg(ppgFromYieldPct(yieldPct), amountKg, batchSizeL, efficiencyPct);
}

export function specificGravityFromPoints(points: number) {
	return 1 + points / 1000;
}

export function estimateAbv(originalGravity: number, finalGravity: number) {
	return (originalGravity - finalGravity) * 131.25;
}

export function estimateFinalGravity(
	originalGravity: number,
	attenuationPct: number | null | undefined
) {
	if (attenuationPct == null) {
		return null;
	}

	const originalPoints = (originalGravity - 1) * 1000;
	const remainingPoints = originalPoints * (1 - attenuationPct / 100);

	return specificGravityFromPoints(remainingPoints);
}

export function maltColorUnits(colorLovibond: number, amountKg: number, batchSizeL: number) {
	const pounds = amountKg * 2.2046226218;
	const gallons = batchSizeL / 3.785411784;

	return (colorLovibond * pounds) / gallons;
}

export function moreySrm(mcu: number) {
	return 1.4922 * Math.pow(mcu, 0.6859);
}

export function tinsethUtilization(timeMin: number, gravity: number) {
	return 1.65 * Math.pow(0.000125, gravity - 1) * ((1 - Math.exp(-0.04 * timeMin)) / 4.15);
}

export function tinsethIbu(params: {
	alphaAcidPct: number;
	amountKg: number;
	batchSizeL: number;
	timeMin: number;
	gravity: number;
}) {
	const alphaAcidUnits = params.amountKg * 1000 * (params.alphaAcidPct / 100);
	return (
		(alphaAcidUnits * tinsethUtilization(params.timeMin, params.gravity) * 1000) / params.batchSizeL
	);
}

export function ragerUtilization(timeMin: number) {
	return (18.11 + 13.86 * Math.tanh((timeMin - 31.32) / 18.27)) / 100;
}

export function ragerIbu(params: {
	alphaAcidPct: number;
	amountKg: number;
	batchSizeL: number;
	timeMin: number;
	gravity: number;
}) {
	const ounces = params.amountKg * 35.27396195;
	const gallons = params.batchSizeL / 3.785411784;
	const gravityAdjustment = params.gravity > 1.05 ? (params.gravity - 1.05) / 0.2 + 1 : 1;
	const alphaAcidUnits = ounces * params.alphaAcidPct;

	return (
		(alphaAcidUnits * ragerUtilization(params.timeMin) * 74.89) / (gallons * gravityAdjustment)
	);
}
