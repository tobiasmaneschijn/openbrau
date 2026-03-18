const LITERS_PER_GALLON = 3.785411784;
const KILOGRAMS_PER_POUND = 0.45359237;

export type VolumeUnit = 'l' | 'gal';
export type MassUnit = 'kg' | 'lb';
export type TemperatureUnit = 'c' | 'f';
export type DurationUnit = 'min' | 'hour';
export type UnitSystem = 'metric' | 'imperial';

export function convertVolume(value: number, from: VolumeUnit, to: VolumeUnit) {
	if (from === to) return value;
	if (from === 'l' && to === 'gal') return value / LITERS_PER_GALLON;
	return value * LITERS_PER_GALLON;
}

export function convertMass(value: number, from: MassUnit, to: MassUnit) {
	if (from === to) return value;
	if (from === 'kg' && to === 'lb') return value / KILOGRAMS_PER_POUND;
	return value * KILOGRAMS_PER_POUND;
}

export function convertTemperature(value: number, from: TemperatureUnit, to: TemperatureUnit) {
	if (from === to) return value;
	if (from === 'c' && to === 'f') return (value * 9) / 5 + 32;
	return ((value - 32) * 5) / 9;
}

export function convertDuration(value: number, from: DurationUnit, to: DurationUnit) {
	if (from === to) return value;
	if (from === 'min' && to === 'hour') return value / 60;
	return value * 60;
}

export function preferredVolumeUnit(unitSystem: UnitSystem): VolumeUnit {
	return unitSystem === 'imperial' ? 'gal' : 'l';
}

export function preferredMassUnit(unitSystem: UnitSystem): MassUnit {
	return unitSystem === 'imperial' ? 'lb' : 'kg';
}

export function preferredTemperatureUnit(unitSystem: UnitSystem): TemperatureUnit {
	return unitSystem === 'imperial' ? 'f' : 'c';
}

export function formatNumber(value: number, locale = 'en-US', maximumFractionDigits = 2) {
	return new Intl.NumberFormat(locale, {
		maximumFractionDigits,
		minimumFractionDigits: 0
	}).format(value);
}

export function formatVolume(
	valueLiters: number,
	unitSystem: UnitSystem,
	locale = 'en-US',
	maximumFractionDigits = 2
) {
	const unit = preferredVolumeUnit(unitSystem);
	const value = convertVolume(valueLiters, 'l', unit);

	return `${formatNumber(value, locale, maximumFractionDigits)} ${unit}`;
}

export function formatMass(
	valueKilograms: number,
	unitSystem: UnitSystem,
	locale = 'en-US',
	maximumFractionDigits = 2
) {
	const unit = preferredMassUnit(unitSystem);
	const value = convertMass(valueKilograms, 'kg', unit);

	return `${formatNumber(value, locale, maximumFractionDigits)} ${unit}`;
}

export function formatTemperature(
	valueCelsius: number,
	unitSystem: UnitSystem,
	locale = 'en-US',
	maximumFractionDigits = 1
) {
	const unit = preferredTemperatureUnit(unitSystem);
	const value = convertTemperature(valueCelsius, 'c', unit);

	return `${formatNumber(value, locale, maximumFractionDigits)} °${unit.toUpperCase()}`;
}
