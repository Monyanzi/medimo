// Unit conversion utilities for metric/imperial measurements

export type MeasurementUnit = 'metric' | 'imperial';

// Weight conversions
export const lbsToKg = (lbs: number): number => lbs * 0.453592;
export const kgToLbs = (kg: number): number => kg / 0.453592;

// Height conversions
export const inchesToCm = (inches: number): number => inches * 2.54;
export const cmToInches = (cm: number): number => cm / 2.54;

// Temperature conversions
export const fahrenheitToCelsius = (f: number): number => (f - 32) * 5 / 9;
export const celsiusToFahrenheit = (c: number): number => (c * 9 / 5) + 32;

// Blood glucose conversions (mg/dL <-> mmol/L)
export const mgdlToMmol = (mgdl: number): number => mgdl / 18.0182;
export const mmolToMgdl = (mmol: number): number => mmol * 18.0182;

// Display helpers with unit labels
export const getWeightUnit = (unit: MeasurementUnit): string => unit === 'metric' ? 'kg' : 'lbs';
export const getHeightUnit = (unit: MeasurementUnit): string => unit === 'metric' ? 'cm' : 'in';
export const getTemperatureUnit = (unit: MeasurementUnit): string => unit === 'metric' ? '°C' : '°F';
export const getGlucoseUnit = (unit: MeasurementUnit): string => unit === 'metric' ? 'mmol/L' : 'mg/dL';

// Placeholders for input fields
export const getWeightPlaceholder = (unit: MeasurementUnit): string => unit === 'metric' ? '70' : '150';
export const getHeightPlaceholder = (unit: MeasurementUnit): string => unit === 'metric' ? '170' : '68';
export const getTemperaturePlaceholder = (unit: MeasurementUnit): string => unit === 'metric' ? '37.0' : '98.6';
export const getGlucosePlaceholder = (unit: MeasurementUnit): string => unit === 'metric' ? '5.5' : '100';

// Convert value to storage format (always metric internally for consistency)
export const toStorageWeight = (value: number, unit: MeasurementUnit): number => 
  unit === 'imperial' ? lbsToKg(value) : value;

export const toStorageHeight = (value: number, unit: MeasurementUnit): number => 
  unit === 'imperial' ? inchesToCm(value) : value;

export const toStorageTemperature = (value: number, unit: MeasurementUnit): number => 
  unit === 'imperial' ? fahrenheitToCelsius(value) : value;

export const toStorageGlucose = (value: number, unit: MeasurementUnit): number => 
  unit === 'imperial' ? value : mmolToMgdl(value); // Store as mg/dL

// Convert from storage format to display format
export const fromStorageWeight = (value: number, unit: MeasurementUnit): number => 
  unit === 'imperial' ? kgToLbs(value) : value;

export const fromStorageHeight = (value: number, unit: MeasurementUnit): number => 
  unit === 'imperial' ? cmToInches(value) : value;

export const fromStorageTemperature = (value: number, unit: MeasurementUnit): number => 
  unit === 'imperial' ? celsiusToFahrenheit(value) : value;

export const fromStorageGlucose = (value: number, unit: MeasurementUnit): number => 
  unit === 'imperial' ? value : mgdlToMmol(value);

// Format display value with appropriate precision
export const formatWeight = (value: number | undefined | null, unit: MeasurementUnit): string => {
  if (value == null) return '—';
  const displayValue = fromStorageWeight(value, unit);
  return `${displayValue.toFixed(1)} ${getWeightUnit(unit)}`;
};

export const formatHeight = (value: number | undefined | null, unit: MeasurementUnit): string => {
  if (value == null) return '—';
  const displayValue = fromStorageHeight(value, unit);
  return `${displayValue.toFixed(1)} ${getHeightUnit(unit)}`;
};

export const formatTemperature = (value: number | undefined | null, unit: MeasurementUnit): string => {
  if (value == null) return '—';
  const displayValue = fromStorageTemperature(value, unit);
  return `${displayValue.toFixed(1)}${getTemperatureUnit(unit)}`;
};

export const formatGlucose = (value: number | undefined | null, unit: MeasurementUnit): string => {
  if (value == null) return '—';
  const displayValue = fromStorageGlucose(value, unit);
  return unit === 'metric' 
    ? `${displayValue.toFixed(1)} ${getGlucoseUnit(unit)}`
    : `${Math.round(displayValue)} ${getGlucoseUnit(unit)}`;
};
