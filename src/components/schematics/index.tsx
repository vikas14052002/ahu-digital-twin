import type { AnySensors } from '@/data/equipment-sensors';
import { AHUSchematic } from '@/components/ahu-schematic';
import { ChillerSchematic } from './chiller-schematic';
import { CoolingTowerSchematic } from './cooling-tower-schematic';
import { BoilerSchematic } from './boiler-schematic';
import { VAVSchematic } from './vav-schematic';
import { FCUSchematic } from './fcu-schematic';

type EquipType = 'ahu' | 'chiller' | 'cooling-tower' | 'boiler' | 'vav' | 'fcu';

export function EquipmentSchematic({ type, data }: { type: EquipType; data: AnySensors }) {
  switch (type) {
    case 'ahu':
      return <AHUSchematic data={data as never} />;
    case 'chiller':
      return <ChillerSchematic data={data as never} />;
    case 'cooling-tower':
      return <CoolingTowerSchematic data={data as never} />;
    case 'boiler':
      return <BoilerSchematic data={data as never} />;
    case 'vav':
      return <VAVSchematic data={data as never} />;
    case 'fcu':
      return <FCUSchematic data={data as never} />;
    default:
      return <AHUSchematic data={data as never} />;
  }
}

// Sensor card configs per type
export interface SensorCardConfig {
  title: string;
  key: string;
  unit: string;
  color: string;
  min: number;
  max: number;
  icon: string; // icon name
}

export const sensorCards: Record<EquipType, SensorCardConfig[]> = {
  ahu: [
    { title: 'Supply Temp', key: 'supplyAirTemp', unit: '°C', color: '#06b6d4', min: 10, max: 25, icon: 'Thermometer' },
    { title: 'Return Temp', key: 'returnAirTemp', unit: '°C', color: '#f97316', min: 18, max: 30, icon: 'Thermometer' },
    { title: 'Outside Temp', key: 'outsideAirTemp', unit: '°C', color: '#eab308', min: 15, max: 45, icon: 'CloudSun' },
    { title: 'Humidity', key: 'supplyHumidity', unit: '%', color: '#3b82f6', min: 30, max: 70, icon: 'Droplets' },
    { title: 'Fan Speed', key: 'fanSpeed', unit: 'RPM', color: '#8b5cf6', min: 0, max: 1500, icon: 'Fan' },
    { title: 'Airflow', key: 'airflowRate', unit: 'CFM', color: '#22c55e', min: 1000, max: 8000, icon: 'Wind' },
    { title: 'CO2', key: 'co2Level', unit: 'ppm', color: '#ef4444', min: 350, max: 1200, icon: 'Gauge' },
    { title: 'Energy', key: 'energyConsumption', unit: 'kWh', color: '#f59e0b', min: 0, max: 25, icon: 'Zap' },
  ],
  chiller: [
    { title: 'CHW Supply', key: 'chilledWaterSupply', unit: '°C', color: '#06b6d4', min: 4, max: 10, icon: 'Thermometer' },
    { title: 'CHW Return', key: 'chilledWaterReturn', unit: '°C', color: '#22d3ee', min: 8, max: 18, icon: 'Thermometer' },
    { title: 'CW Supply', key: 'condenserWaterSupply', unit: '°C', color: '#f97316', min: 25, max: 38, icon: 'Thermometer' },
    { title: 'Compressor', key: 'compressorPower', unit: 'kW', color: '#8b5cf6', min: 10, max: 220, icon: 'Zap' },
    { title: 'Load', key: 'loadPercent', unit: '%', color: '#22c55e', min: 0, max: 100, icon: 'Gauge' },
    { title: 'COP', key: 'cop', unit: '', color: '#3b82f6', min: 3, max: 7, icon: 'Activity' },
    { title: 'Refrigerant', key: 'refrigerantCharge', unit: '%', color: '#a855f7', min: 85, max: 100, icon: 'Droplets' },
    { title: 'Energy', key: 'energyConsumption', unit: 'kWh', color: '#f59e0b', min: 0, max: 120, icon: 'Zap' },
  ],
  'cooling-tower': [
    { title: 'Hot Water In', key: 'hotWaterIn', unit: '°C', color: '#f97316', min: 28, max: 45, icon: 'Thermometer' },
    { title: 'Cold Water Out', key: 'coldWaterOut', unit: '°C', color: '#06b6d4', min: 22, max: 35, icon: 'Thermometer' },
    { title: 'Approach', key: 'approachTemp', unit: '°C', color: '#22c55e', min: 3, max: 10, icon: 'Activity' },
    { title: 'Fan Speed', key: 'fanSpeed', unit: 'RPM', color: '#8b5cf6', min: 0, max: 1500, icon: 'Fan' },
    { title: 'Water Flow', key: 'waterFlowRate', unit: 'GPM', color: '#3b82f6', min: 200, max: 700, icon: 'Droplets' },
    { title: 'Basin Level', key: 'basinLevel', unit: '%', color: '#06b6d4', min: 40, max: 95, icon: 'Gauge' },
    { title: 'Vibration', key: 'vibration', unit: 'mm/s', color: '#ef4444', min: 0.5, max: 5, icon: 'Activity' },
    { title: 'Energy', key: 'energyConsumption', unit: 'kWh', color: '#f59e0b', min: 0, max: 25, icon: 'Zap' },
  ],
  boiler: [
    { title: 'Supply Water', key: 'supplyWaterTemp', unit: '°C', color: '#ef4444', min: 50, max: 90, icon: 'Thermometer' },
    { title: 'Return Water', key: 'returnWaterTemp', unit: '°C', color: '#3b82f6', min: 40, max: 70, icon: 'Thermometer' },
    { title: 'Flue Gas', key: 'flueGasTemp', unit: '°C', color: '#f97316', min: 100, max: 250, icon: 'Flame' },
    { title: 'Burner', key: 'burnerOutput', unit: '%', color: '#eab308', min: 0, max: 100, icon: 'Flame' },
    { title: 'Fuel Flow', key: 'fuelFlowRate', unit: 'm³/h', color: '#a855f7', min: 0, max: 25, icon: 'Gauge' },
    { title: 'Efficiency', key: 'thermalEfficiency', unit: '%', color: '#22c55e', min: 80, max: 96, icon: 'Activity' },
    { title: 'Pressure', key: 'waterPressure', unit: 'bar', color: '#06b6d4', min: 2.5, max: 5, icon: 'Gauge' },
    { title: 'Energy', key: 'energyConsumption', unit: 'kWh', color: '#f59e0b', min: 0, max: 45, icon: 'Zap' },
  ],
  vav: [
    { title: 'Zone Temp', key: 'zoneTemp', unit: '°C', color: '#22c55e', min: 18, max: 28, icon: 'Thermometer' },
    { title: 'Discharge', key: 'dischargeAirTemp', unit: '°C', color: '#06b6d4', min: 10, max: 25, icon: 'Thermometer' },
    { title: 'Airflow', key: 'airflowRate', unit: 'CFM', color: '#3b82f6', min: 200, max: 1200, icon: 'Wind' },
    { title: 'Damper', key: 'damperPosition', unit: '%', color: '#8b5cf6', min: 0, max: 100, icon: 'Gauge' },
    { title: 'Reheat', key: 'reheatValve', unit: '%', color: '#f97316', min: 0, max: 100, icon: 'Flame' },
    { title: 'CO₂', key: 'zoneCO2', unit: 'ppm', color: '#ef4444', min: 350, max: 1000, icon: 'Gauge' },
    { title: 'Humidity', key: 'zoneHumidity', unit: '%', color: '#3b82f6', min: 30, max: 65, icon: 'Droplets' },
    { title: 'Energy', key: 'energyConsumption', unit: 'kWh', color: '#f59e0b', min: 0, max: 3, icon: 'Zap' },
  ],
  fcu: [
    { title: 'Room Temp', key: 'roomTemp', unit: '°C', color: '#22c55e', min: 18, max: 28, icon: 'Thermometer' },
    { title: 'Supply Air', key: 'supplyAirTemp', unit: '°C', color: '#06b6d4', min: 12, max: 25, icon: 'Thermometer' },
    { title: 'Fan Speed', key: 'fanSpeed', unit: '', color: '#8b5cf6', min: 0, max: 3, icon: 'Fan' },
    { title: 'Cool Valve', key: 'coolingValve', unit: '%', color: '#06b6d4', min: 0, max: 100, icon: 'Gauge' },
    { title: 'Heat Valve', key: 'heatingValve', unit: '%', color: '#f97316', min: 0, max: 100, icon: 'Gauge' },
    { title: 'Filter', key: 'filterStatus', unit: '%', color: '#22c55e', min: 30, max: 100, icon: 'Activity' },
    { title: 'Humidity', key: 'humidity', unit: '%', color: '#3b82f6', min: 30, max: 70, icon: 'Droplets' },
    { title: 'Energy', key: 'energyConsumption', unit: 'kWh', color: '#f59e0b', min: 0, max: 2, icon: 'Zap' },
  ],
};

// Chart configs per type
export interface ChartConfig {
  title: string;
  lines: { key: string; label: string; color: string }[];
  unit?: string;
  yDomain?: [number, number];
}

export const chartTabs: Record<EquipType, { label: string; charts: ChartConfig[] }[]> = {
  ahu: [
    { label: 'Temperature', charts: [{ title: 'Temperature Trends', unit: '°C', yDomain: [5, 45], lines: [{ key: 'supplyAirTemp', label: 'Supply', color: '#06b6d4' }, { key: 'returnAirTemp', label: 'Return', color: '#f97316' }, { key: 'outsideAirTemp', label: 'Outside', color: '#eab308' }] }] },
    { label: 'Airflow', charts: [{ title: 'Airflow & Fan', lines: [{ key: 'airflowRate', label: 'CFM', color: '#22c55e' }, { key: 'fanSpeed', label: 'RPM', color: '#8b5cf6' }] }] },
    { label: 'Valves', charts: [{ title: 'Valve Positions', unit: '%', yDomain: [0, 100], lines: [{ key: 'coolingCoilValve', label: 'Cooling', color: '#06b6d4' }, { key: 'heatingCoilValve', label: 'Heating', color: '#f97316' }] }] },
  ],
  chiller: [
    { label: 'Temperatures', charts: [{ title: 'Water Temperatures', unit: '°C', lines: [{ key: 'chilledWaterSupply', label: 'CHW Supply', color: '#06b6d4' }, { key: 'chilledWaterReturn', label: 'CHW Return', color: '#22d3ee' }, { key: 'condenserWaterSupply', label: 'CW Supply', color: '#f97316' }, { key: 'condenserWaterReturn', label: 'CW Return', color: '#fb923c' }] }] },
    { label: 'Compressor', charts: [{ title: 'Compressor Performance', lines: [{ key: 'compressorPower', label: 'Power (kW)', color: '#8b5cf6' }, { key: 'compressorSpeed', label: 'Speed (RPM)', color: '#a855f7' }] }] },
    { label: 'Efficiency', charts: [{ title: 'COP & Load', lines: [{ key: 'cop', label: 'COP', color: '#22c55e' }, { key: 'loadPercent', label: 'Load %', color: '#f59e0b' }] }] },
  ],
  'cooling-tower': [
    { label: 'Temperatures', charts: [{ title: 'Water Temperatures', unit: '°C', lines: [{ key: 'hotWaterIn', label: 'Hot In', color: '#f97316' }, { key: 'coldWaterOut', label: 'Cold Out', color: '#06b6d4' }, { key: 'wetBulbTemp', label: 'Wet Bulb', color: '#eab308' }] }] },
    { label: 'Fan & Flow', charts: [{ title: 'Fan & Water Flow', lines: [{ key: 'fanSpeed', label: 'Fan RPM', color: '#8b5cf6' }, { key: 'waterFlowRate', label: 'Flow (GPM)', color: '#3b82f6' }] }] },
    { label: 'Basin', charts: [{ title: 'Basin & Makeup', lines: [{ key: 'basinLevel', label: 'Basin %', color: '#06b6d4' }, { key: 'makeupWaterFlow', label: 'Makeup (GPM)', color: '#22c55e' }] }] },
  ],
  boiler: [
    { label: 'Temperatures', charts: [{ title: 'Water & Flue Temperatures', unit: '°C', lines: [{ key: 'supplyWaterTemp', label: 'Supply', color: '#ef4444' }, { key: 'returnWaterTemp', label: 'Return', color: '#3b82f6' }, { key: 'flueGasTemp', label: 'Flue Gas', color: '#f97316' }] }] },
    { label: 'Burner', charts: [{ title: 'Burner & Fuel', lines: [{ key: 'burnerOutput', label: 'Burner %', color: '#f97316' }, { key: 'fuelFlowRate', label: 'Fuel (m³/h)', color: '#eab308' }] }] },
    { label: 'Combustion', charts: [{ title: 'Combustion Analysis', lines: [{ key: 'oxygenLevel', label: 'O₂ %', color: '#3b82f6' }, { key: 'coLevel', label: 'CO (ppm)', color: '#ef4444' }, { key: 'thermalEfficiency', label: 'Efficiency %', color: '#22c55e' }] }] },
  ],
  vav: [
    { label: 'Zone', charts: [{ title: 'Zone Temperature', unit: '°C', lines: [{ key: 'zoneTemp', label: 'Zone', color: '#22c55e' }, { key: 'dischargeAirTemp', label: 'Discharge', color: '#06b6d4' }] }] },
    { label: 'Airflow', charts: [{ title: 'Airflow & Damper', lines: [{ key: 'airflowRate', label: 'Airflow', color: '#3b82f6' }, { key: 'damperPosition', label: 'Damper %', color: '#8b5cf6' }] }] },
    { label: 'Demand', charts: [{ title: 'Heating & Cooling Demand', unit: '%', yDomain: [0, 100], lines: [{ key: 'coolingDemand', label: 'Cooling', color: '#06b6d4' }, { key: 'heatingDemand', label: 'Heating', color: '#f97316' }] }] },
  ],
  fcu: [
    { label: 'Temperature', charts: [{ title: 'Room & Air Temperatures', unit: '°C', lines: [{ key: 'roomTemp', label: 'Room', color: '#22c55e' }, { key: 'supplyAirTemp', label: 'Supply', color: '#06b6d4' }, { key: 'returnAirTemp', label: 'Return', color: '#f97316' }] }] },
    { label: 'Valves', charts: [{ title: 'Valve Positions', unit: '%', yDomain: [0, 100], lines: [{ key: 'coolingValve', label: 'Cooling', color: '#06b6d4' }, { key: 'heatingValve', label: 'Heating', color: '#f97316' }] }] },
    { label: 'Performance', charts: [{ title: 'Airflow & Filter', lines: [{ key: 'airflowRate', label: 'Airflow (CFM)', color: '#3b82f6' }, { key: 'filterStatus', label: 'Filter %', color: '#22c55e' }] }] },
  ],
};
