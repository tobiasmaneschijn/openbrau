import { describe, expect, it } from 'vitest';
import {
	convertMass,
	convertTemperature,
	convertVolume,
	formatMass,
	formatTemperature,
	formatVolume
} from './index';

describe('unit conversions', () => {
	it('converts liters to gallons', () => {
		expect(convertVolume(18.92705892, 'l', 'gal')).toBeCloseTo(5, 5);
	});

	it('converts kilograms to pounds', () => {
		expect(convertMass(1, 'kg', 'lb')).toBeCloseTo(2.20462, 5);
	});

	it('converts celsius to fahrenheit', () => {
		expect(convertTemperature(20, 'c', 'f')).toBeCloseTo(68, 5);
	});

	it('formats metric and imperial display values', () => {
		expect(formatVolume(20, 'metric')).toBe('20 l');
		expect(formatMass(1, 'imperial')).toContain('lb');
		expect(formatTemperature(20, 'imperial')).toBe('68 °F');
	});
});
