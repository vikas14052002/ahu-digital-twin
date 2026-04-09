export interface SensorData {
  timestamp: number;
  supplyAirTemp: number;
  returnAirTemp: number;
  outsideAirTemp: number;
  mixedAirTemp: number;
  supplyHumidity: number;
  returnHumidity: number;
  fanSpeed: number; // RPM
  fanPower: number; // kW
  coolingCoilValve: number; // 0-100%
  heatingCoilValve: number; // 0-100%
  outsideDamper: number; // 0-100%
  returnDamper: number; // 0-100%
  filterPressureDrop: number; // Pa
  airflowRate: number; // CFM
  co2Level: number; // ppm
  energyConsumption: number; // kWh
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: number;
  component: string;
}

export interface AHUMode {
  mode: 'cooling' | 'heating' | 'economizer' | 'standby';
  label: string;
}

const clamp = (val: number, min: number, max: number) =>
  Math.max(min, Math.min(max, val));

const randomInRange = (min: number, max: number) =>
  min + Math.random() * (max - min);

// Simulate a realistic 24-hour cycle
function getTimeOfDayFactor(): number {
  const hour = new Date().getHours() + new Date().getMinutes() / 60;
  // Peak at 2pm (14:00), low at 4am
  return 0.3 + 0.7 * Math.max(0, Math.sin(((hour - 4) / 24) * Math.PI * 2));
}

let previousData: SensorData | null = null;

export function generateSensorData(): SensorData {
  const timeFactor = getTimeOfDayFactor();
  const now = Date.now();

  const outsideAirTemp = 28 + 12 * timeFactor + randomInRange(-1, 1);
  const targetSupplyTemp = 14 + randomInRange(-0.5, 0.5);

  const base: SensorData = {
    timestamp: now,
    outsideAirTemp: +outsideAirTemp.toFixed(1),
    supplyAirTemp: +(targetSupplyTemp + randomInRange(-0.3, 0.3)).toFixed(1),
    returnAirTemp: +(22 + 3 * timeFactor + randomInRange(-0.5, 0.5)).toFixed(1),
    mixedAirTemp: +(
      18 +
      5 * timeFactor +
      randomInRange(-0.5, 0.5)
    ).toFixed(1),
    supplyHumidity: +clamp(45 + 10 * timeFactor + randomInRange(-2, 2), 30, 70).toFixed(1),
    returnHumidity: +clamp(50 + 8 * timeFactor + randomInRange(-2, 2), 35, 75).toFixed(1),
    fanSpeed: +clamp(800 + 600 * timeFactor + randomInRange(-20, 20), 0, 1500).toFixed(0),
    fanPower: +clamp(2.5 + 4.5 * timeFactor + randomInRange(-0.2, 0.2), 0, 7.5).toFixed(2),
    coolingCoilValve: +clamp(30 + 60 * timeFactor + randomInRange(-2, 2), 0, 100).toFixed(0),
    heatingCoilValve: +clamp(10 - 8 * timeFactor + randomInRange(-1, 1), 0, 100).toFixed(0),
    outsideDamper: +clamp(20 + 40 * timeFactor + randomInRange(-2, 2), 10, 100).toFixed(0),
    returnDamper: +clamp(80 - 40 * timeFactor + randomInRange(-2, 2), 0, 90).toFixed(0),
    filterPressureDrop: +clamp(120 + 80 * timeFactor + randomInRange(-5, 5), 50, 300).toFixed(0),
    airflowRate: +clamp(3000 + 4000 * timeFactor + randomInRange(-100, 100), 1000, 8000).toFixed(0),
    co2Level: +clamp(400 + 400 * timeFactor + randomInRange(-20, 20), 350, 1200).toFixed(0),
    energyConsumption: +(5 + 15 * timeFactor + randomInRange(-0.5, 0.5)).toFixed(2),
  };

  if (previousData) {
    // Smooth transitions
    const smooth = (prev: number, next: number, factor = 0.3) =>
      +(prev + (next - prev) * factor).toFixed(2);

    base.supplyAirTemp = +smooth(previousData.supplyAirTemp, base.supplyAirTemp).toFixed(1);
    base.returnAirTemp = +smooth(previousData.returnAirTemp, base.returnAirTemp).toFixed(1);
    base.fanSpeed = +smooth(previousData.fanSpeed, base.fanSpeed).toFixed(0);
    base.coolingCoilValve = +smooth(previousData.coolingCoilValve, base.coolingCoilValve).toFixed(0);
    base.heatingCoilValve = +smooth(previousData.heatingCoilValve, base.heatingCoilValve).toFixed(0);
  }

  previousData = { ...base };
  return base;
}

export function generateHistoricalData(points = 60): SensorData[] {
  const data: SensorData[] = [];
  const now = Date.now();
  for (let i = points - 1; i >= 0; i--) {
    const timestamp = now - i * 60000; // 1 minute intervals
    const hour =
      new Date(timestamp).getHours() + new Date(timestamp).getMinutes() / 60;
    const timeFactor =
      0.3 + 0.7 * Math.max(0, Math.sin(((hour - 4) / 24) * Math.PI * 2));

    data.push({
      timestamp,
      outsideAirTemp: +(28 + 12 * timeFactor + randomInRange(-1, 1)).toFixed(1),
      supplyAirTemp: +(14 + randomInRange(-0.5, 0.5)).toFixed(1),
      returnAirTemp: +(22 + 3 * timeFactor + randomInRange(-0.5, 0.5)).toFixed(1),
      mixedAirTemp: +(18 + 5 * timeFactor + randomInRange(-0.5, 0.5)).toFixed(1),
      supplyHumidity: +clamp(45 + 10 * timeFactor + randomInRange(-2, 2), 30, 70).toFixed(1),
      returnHumidity: +clamp(50 + 8 * timeFactor + randomInRange(-2, 2), 35, 75).toFixed(1),
      fanSpeed: +clamp(800 + 600 * timeFactor + randomInRange(-20, 20), 0, 1500).toFixed(0),
      fanPower: +clamp(2.5 + 4.5 * timeFactor + randomInRange(-0.2, 0.2), 0, 7.5).toFixed(2),
      coolingCoilValve: +clamp(30 + 60 * timeFactor + randomInRange(-2, 2), 0, 100).toFixed(0),
      heatingCoilValve: +clamp(10 - 8 * timeFactor + randomInRange(-1, 1), 0, 100).toFixed(0),
      outsideDamper: +clamp(20 + 40 * timeFactor + randomInRange(-2, 2), 10, 100).toFixed(0),
      returnDamper: +clamp(80 - 40 * timeFactor + randomInRange(-2, 2), 0, 90).toFixed(0),
      filterPressureDrop: +clamp(120 + 80 * timeFactor + randomInRange(-5, 5), 50, 300).toFixed(0),
      airflowRate: +clamp(3000 + 4000 * timeFactor + randomInRange(-100, 100), 1000, 8000).toFixed(0),
      co2Level: +clamp(400 + 400 * timeFactor + randomInRange(-20, 20), 350, 1200).toFixed(0),
      energyConsumption: +(5 + 15 * timeFactor + randomInRange(-0.5, 0.5)).toFixed(2),
    });
  }
  return data;
}

export function getAHUMode(data: SensorData): AHUMode {
  if (data.fanSpeed < 100) return { mode: 'standby', label: 'Standby' };
  if (data.coolingCoilValve > 30 && data.outsideAirTemp > 24)
    return { mode: 'cooling', label: 'Active Cooling' };
  if (data.heatingCoilValve > 20)
    return { mode: 'heating', label: 'Heating' };
  return { mode: 'economizer', label: 'Free Cooling' };
}

export function checkAlerts(data: SensorData): Alert[] {
  const alerts: Alert[] = [];
  const now = Date.now();

  if (data.filterPressureDrop > 250) {
    alerts.push({
      id: `filter-${now}`,
      type: 'critical',
      message: 'Filter pressure drop critically high — replace filter immediately',
      timestamp: now,
      component: 'Filter',
    });
  } else if (data.filterPressureDrop > 200) {
    alerts.push({
      id: `filter-warn-${now}`,
      type: 'warning',
      message: 'Filter pressure drop elevated — schedule maintenance',
      timestamp: now,
      component: 'Filter',
    });
  }

  if (data.supplyAirTemp > 18) {
    alerts.push({
      id: `supply-temp-${now}`,
      type: 'warning',
      message: `Supply air temp ${data.supplyAirTemp}°C exceeds setpoint`,
      timestamp: now,
      component: 'Cooling Coil',
    });
  }

  if (data.co2Level > 1000) {
    alerts.push({
      id: `co2-${now}`,
      type: 'critical',
      message: `CO2 level ${data.co2Level} ppm — increase fresh air intake`,
      timestamp: now,
      component: 'Damper',
    });
  } else if (data.co2Level > 800) {
    alerts.push({
      id: `co2-warn-${now}`,
      type: 'warning',
      message: `CO2 level ${data.co2Level} ppm — approaching limit`,
      timestamp: now,
      component: 'Damper',
    });
  }

  if (data.fanSpeed > 1400) {
    alerts.push({
      id: `fan-${now}`,
      type: 'warning',
      message: 'Fan speed near maximum — check system load',
      timestamp: now,
      component: 'Supply Fan',
    });
  }

  if (data.supplyHumidity > 65) {
    alerts.push({
      id: `humidity-${now}`,
      type: 'info',
      message: `Humidity ${data.supplyHumidity}% above comfort range`,
      timestamp: now,
      component: 'Humidifier',
    });
  }

  return alerts;
}

export function calculateEfficiency(data: SensorData): number {
  // Simple COP-like efficiency metric
  const coolingEffect = Math.abs(data.returnAirTemp - data.supplyAirTemp) * data.airflowRate;
  const energyInput = data.energyConsumption * 1000;
  if (energyInput === 0) return 0;
  const efficiency = clamp((coolingEffect / energyInput) * 100, 0, 100);
  return +efficiency.toFixed(1);
}
