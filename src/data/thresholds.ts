export interface Threshold {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  criticalMin?: number;
  criticalMax?: number;
}

export type ThresholdMap = Record<string, Threshold[]>;

export type EvalResult = 'normal' | 'warning' | 'critical';

export function evaluate(value: number, t: Threshold): EvalResult {
  if (t.criticalMin !== undefined && value < t.criticalMin) return 'critical';
  if (t.criticalMax !== undefined && value > t.criticalMax) return 'critical';
  if (value < t.min || value > t.max) return 'warning';
  return 'normal';
}

const snakeCase = (s: string) =>
  s.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');

export function labelFor(key: string): string {
  return snakeCase(key).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const defaultThresholds: ThresholdMap = {
  ahu: [
    { key: 'supplyAirTemp', label: 'Supply Air Temp', unit: '°C', min: 13, max: 15, criticalMin: 10, criticalMax: 17 },
    { key: 'returnAirTemp', label: 'Return Air Temp', unit: '°C', min: 21, max: 23.5, criticalMax: 26 },
    { key: 'outsideAirTemp', label: 'Outside Air Temp', unit: '°C', min: 20, max: 35, criticalMax: 40 },
    { key: 'supplyHumidity', label: 'Supply Humidity', unit: '%', min: 40, max: 52, criticalMax: 60 },
    { key: 'fanSpeed', label: 'Fan Speed', unit: 'RPM', min: 600, max: 1200, criticalMax: 1400 },
    { key: 'coolingCoilValve', label: 'Cooling Valve', unit: '%', min: 10, max: 75, criticalMax: 95 },
    { key: 'heatingCoilValve', label: 'Heating Valve', unit: '%', min: 0, max: 15, criticalMax: 40 },
    { key: 'filterPressureDrop', label: 'Filter ΔP', unit: 'Pa', min: 80, max: 170, criticalMax: 230 },
    { key: 'airflowRate', label: 'Airflow', unit: 'CFM', min: 3500, max: 6000, criticalMin: 2000, criticalMax: 7500 },
    { key: 'co2Level', label: 'CO₂', unit: 'ppm', min: 380, max: 600, criticalMax: 800 },
    { key: 'energyConsumption', label: 'Energy', unit: 'kWh', min: 3, max: 14, criticalMax: 19 },
  ],
  chiller: [
    { key: 'chilledWaterSupply', label: 'CHW Supply', unit: '°C', min: 6.2, max: 7.2, criticalMin: 5, criticalMax: 8.5 },
    { key: 'chilledWaterReturn', label: 'CHW Return', unit: '°C', min: 11, max: 13.5, criticalMax: 16 },
    { key: 'condenserWaterSupply', label: 'CW Supply', unit: '°C', min: 28, max: 33, criticalMax: 37 },
    { key: 'condenserWaterReturn', label: 'CW Return', unit: '°C', min: 33, max: 37, criticalMax: 40 },
    { key: 'compressorPower', label: 'Compressor Power', unit: 'kW', min: 40, max: 160, criticalMax: 200 },
    { key: 'evaporatorPressure', label: 'Evaporator Pressure', unit: 'bar', min: 3.5, max: 4.8, criticalMin: 3, criticalMax: 5.5 },
    { key: 'condenserPressure', label: 'Condenser Pressure', unit: 'bar', min: 9, max: 12.5, criticalMax: 14.5 },
    { key: 'oilPressure', label: 'Oil Pressure', unit: 'bar', min: 4.0, max: 4.5, criticalMin: 3.7, criticalMax: 4.8 },
    { key: 'cop', label: 'COP', unit: '', min: 4.8, max: 6.5, criticalMin: 3.5 },
    { key: 'loadPercent', label: 'Load', unit: '%', min: 25, max: 75, criticalMax: 92 },
    { key: 'refrigerantCharge', label: 'Refrigerant', unit: '%', min: 93, max: 100, criticalMin: 88 },
  ],
  'cooling-tower': [
    { key: 'hotWaterIn', label: 'Hot Water In', unit: '°C', min: 33, max: 38, criticalMax: 42 },
    { key: 'coldWaterOut', label: 'Cold Water Out', unit: '°C', min: 26, max: 30, criticalMax: 34 },
    { key: 'approachTemp', label: 'Approach', unit: '°C', min: 4, max: 6.5, criticalMax: 8.5 },
    { key: 'fanSpeed', label: 'Fan Speed', unit: 'RPM', min: 400, max: 1200, criticalMax: 1450 },
    { key: 'waterFlowRate', label: 'Water Flow', unit: 'GPM', min: 350, max: 550, criticalMin: 250, criticalMax: 650 },
    { key: 'basinLevel', label: 'Basin Level', unit: '%', min: 60, max: 85, criticalMin: 45, criticalMax: 92 },
    { key: 'vibration', label: 'Vibration', unit: 'mm/s', min: 0.5, max: 2.5, criticalMax: 4 },
    { key: 'blowdownRate', label: 'Blowdown', unit: 'GPM', min: 3, max: 7, criticalMax: 10 },
  ],
  boiler: [
    { key: 'supplyWaterTemp', label: 'Supply Water', unit: '°C', min: 65, max: 80, criticalMax: 88 },
    { key: 'returnWaterTemp', label: 'Return Water', unit: '°C', min: 45, max: 60, criticalMax: 68 },
    { key: 'flueGasTemp', label: 'Flue Gas', unit: '°C', min: 120, max: 180, criticalMax: 220 },
    { key: 'burnerOutput', label: 'Burner Output', unit: '%', min: 10, max: 70, criticalMax: 90 },
    { key: 'fuelFlowRate', label: 'Fuel Flow', unit: 'm³/h', min: 3, max: 15, criticalMax: 22 },
    { key: 'oxygenLevel', label: 'O₂ Level', unit: '%', min: 3, max: 4.2, criticalMin: 2.2, criticalMax: 5.5 },
    { key: 'coLevel', label: 'CO Level', unit: 'ppm', min: 10, max: 35, criticalMax: 60 },
    { key: 'thermalEfficiency', label: 'Efficiency', unit: '%', min: 89, max: 96, criticalMin: 83 },
    { key: 'waterPressure', label: 'Water Pressure', unit: 'bar', min: 3.0, max: 4.0, criticalMin: 2.6, criticalMax: 4.8 },
  ],
  vav: [
    { key: 'zoneTemp', label: 'Zone Temp', unit: '°C', min: 21, max: 23.5, criticalMin: 19, criticalMax: 26 },
    { key: 'dischargeAirTemp', label: 'Discharge Air', unit: '°C', min: 13, max: 17, criticalMax: 21 },
    { key: 'airflowRate', label: 'Airflow', unit: 'CFM', min: 400, max: 900, criticalMin: 250, criticalMax: 1100 },
    { key: 'damperPosition', label: 'Damper', unit: '%', min: 20, max: 80, criticalMax: 95 },
    { key: 'reheatValve', label: 'Reheat Valve', unit: '%', min: 0, max: 30, criticalMax: 60 },
    { key: 'zoneCO2', label: 'CO₂', unit: 'ppm', min: 380, max: 600, criticalMax: 850 },
    { key: 'zoneHumidity', label: 'Humidity', unit: '%', min: 35, max: 52, criticalMax: 62 },
    { key: 'staticPressure', label: 'Static Pressure', unit: 'inWC', min: 0.6, max: 1.0, criticalMax: 1.3 },
  ],
  fcu: [
    { key: 'roomTemp', label: 'Room Temp', unit: '°C', min: 21.5, max: 24.5, criticalMin: 19, criticalMax: 27 },
    { key: 'supplyAirTemp', label: 'Supply Air', unit: '°C', min: 14, max: 18, criticalMax: 22 },
    { key: 'coolingValve', label: 'Cooling Valve', unit: '%', min: 5, max: 65, criticalMax: 90 },
    { key: 'heatingValve', label: 'Heating Valve', unit: '%', min: 0, max: 20, criticalMax: 50 },
    { key: 'filterStatus', label: 'Filter Status', unit: '%', min: 60, max: 100, criticalMin: 40 },
    { key: 'humidity', label: 'Humidity', unit: '%', min: 38, max: 54, criticalMax: 65 },
    { key: 'airflowRate', label: 'Airflow', unit: 'CFM', min: 300, max: 650, criticalMin: 150, criticalMax: 780 },
  ],
};
