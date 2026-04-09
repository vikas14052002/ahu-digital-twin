// Unified sensor system — each equipment type has its own fields

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const rand = (min: number, max: number) => min + Math.random() * (max - min);

function timeFactor(): number {
  const h = new Date().getHours() + new Date().getMinutes() / 60;
  return 0.3 + 0.7 * Math.max(0, Math.sin(((h - 4) / 24) * Math.PI * 2));
}

// ─── Anomaly injection ───
// ~15% chance of anomaly per reading. Types:
//   spike   — sudden large deviation
//   drift   — gradual creep beyond range
//   stuck   — sensor returns same value repeatedly
//   erratic — rapid oscillation

type AnomalyType = 'spike' | 'drift' | 'stuck' | 'erratic' | null;
let stickyAnomaly: { field: string; type: AnomalyType; value: number; ttl: number } | null = null;

function maybeAnomaly(
  value: number,
  field: string,
  normalMin: number,
  normalMax: number,
): number {
  // Continue sticky anomaly (stuck sensor / drift)
  if (stickyAnomaly && stickyAnomaly.field === field && stickyAnomaly.ttl > 0) {
    stickyAnomaly.ttl--;
    if (stickyAnomaly.type === 'stuck') return stickyAnomaly.value;
    if (stickyAnomaly.type === 'drift') {
      stickyAnomaly.value += rand(-0.1, 0.5); // creep upward
      return stickyAnomaly.value;
    }
  }

  // 15% chance to trigger new anomaly
  if (Math.random() > 0.15) return value;

  const roll = Math.random();
  if (roll < 0.35) {
    // Spike — sudden jump 20-60% beyond normal range
    const range = normalMax - normalMin;
    const dir = Math.random() > 0.5 ? 1 : -1;
    return value + dir * range * rand(0.3, 0.8);
  }
  if (roll < 0.55) {
    // Drift — value creeps for 5-15 ticks
    stickyAnomaly = { field, type: 'drift', value: normalMax + rand(1, 5), ttl: Math.floor(rand(5, 15)) };
    return stickyAnomaly.value;
  }
  if (roll < 0.75) {
    // Stuck — sensor frozen for 4-10 ticks
    stickyAnomaly = { field, type: 'stuck', value, ttl: Math.floor(rand(4, 10)) };
    return value;
  }
  // Erratic — wild random value
  const range = normalMax - normalMin;
  return normalMin + Math.random() * range * 2.5 - range * 0.5;
}

// Shorthand
const anom = maybeAnomaly;

// ─── AHU ───
export interface AHUSensors {
  timestamp: number;
  supplyAirTemp: number;
  returnAirTemp: number;
  outsideAirTemp: number;
  mixedAirTemp: number;
  supplyHumidity: number;
  returnHumidity: number;
  fanSpeed: number;
  fanPower: number;
  coolingCoilValve: number;
  heatingCoilValve: number;
  outsideDamper: number;
  returnDamper: number;
  filterPressureDrop: number;
  airflowRate: number;
  co2Level: number;
  energyConsumption: number;
}

// ─── Chiller ───
export interface ChillerSensors {
  timestamp: number;
  chilledWaterSupply: number;
  chilledWaterReturn: number;
  condenserWaterSupply: number;
  condenserWaterReturn: number;
  compressorPower: number;
  compressorSpeed: number;
  evaporatorPressure: number;
  condenserPressure: number;
  suctionTemp: number;
  dischargeTemp: number;
  oilPressure: number;
  oilTemp: number;
  refrigerantCharge: number;
  cop: number;
  loadPercent: number;
  energyConsumption: number;
}

// ─── Cooling Tower ───
export interface CoolingTowerSensors {
  timestamp: number;
  hotWaterIn: number;
  coldWaterOut: number;
  wetBulbTemp: number;
  approachTemp: number;
  fanSpeed: number;
  fanPower: number;
  waterFlowRate: number;
  basinLevel: number;
  blowdownRate: number;
  makeupWaterFlow: number;
  driftLoss: number;
  vibration: number;
  cycles: number;
  energyConsumption: number;
}

// ─── Boiler ───
export interface BoilerSensors {
  timestamp: number;
  supplyWaterTemp: number;
  returnWaterTemp: number;
  flueGasTemp: number;
  steamPressure: number;
  burnerOutput: number;
  fuelFlowRate: number;
  airFuelRatio: number;
  oxygenLevel: number;
  coLevel: number;
  waterPressure: number;
  waterFlowRate: number;
  thermalEfficiency: number;
  stackTemp: number;
  energyConsumption: number;
}

// ─── VAV Box ───
export interface VAVSensors {
  timestamp: number;
  zoneTemp: number;
  zoneSetpoint: number;
  dischargeAirTemp: number;
  airflowRate: number;
  airflowSetpoint: number;
  damperPosition: number;
  reheatValve: number;
  zoneHumidity: number;
  zoneCO2: number;
  occupancy: number;
  heatingDemand: number;
  coolingDemand: number;
  staticPressure: number;
  energyConsumption: number;
}

// ─── FCU ───
export interface FCUSensors {
  timestamp: number;
  roomTemp: number;
  roomSetpoint: number;
  supplyAirTemp: number;
  returnAirTemp: number;
  fanSpeed: number;
  coolingValve: number;
  heatingValve: number;
  filterStatus: number;
  humidity: number;
  airflowRate: number;
  waterInTemp: number;
  waterOutTemp: number;
  mode: number; // 0=off, 1=cooling, 2=heating, 3=fan-only
  energyConsumption: number;
}

export type AnySensors = AHUSensors | ChillerSensors | CoolingTowerSensors | BoilerSensors | VAVSensors | FCUSensors;

// ─── Generators ───

let prevAHU: AHUSensors | null = null;
export function generateAHU(): AHUSensors {
  const tf = timeFactor();
  const d: AHUSensors = {
    timestamp: Date.now(),
    outsideAirTemp: +anom(28 + 12 * tf + rand(-1, 1), 'outsideAirTemp', 20, 35).toFixed(1),
    supplyAirTemp: +anom(14 + rand(-0.5, 0.5), 'supplyAirTemp', 13, 15).toFixed(1),
    returnAirTemp: +anom(22 + 3 * tf + rand(-0.5, 0.5), 'returnAirTemp', 21, 23.5).toFixed(1),
    mixedAirTemp: +(18 + 5 * tf + rand(-0.5, 0.5)).toFixed(1),
    supplyHumidity: +anom(clamp(45 + 10 * tf + rand(-2, 2), 30, 70), 'supplyHumidity', 40, 52).toFixed(1),
    returnHumidity: +clamp(50 + 8 * tf + rand(-2, 2), 35, 75).toFixed(1),
    fanSpeed: +anom(clamp(800 + 600 * tf + rand(-20, 20), 0, 1500), 'fanSpeed', 600, 1200).toFixed(0),
    fanPower: +clamp(2.5 + 4.5 * tf + rand(-0.2, 0.2), 0, 7.5).toFixed(2),
    coolingCoilValve: +anom(clamp(30 + 60 * tf + rand(-2, 2), 0, 100), 'coolingCoilValve', 10, 75).toFixed(0),
    heatingCoilValve: +anom(clamp(10 - 8 * tf + rand(-1, 1), 0, 100), 'heatingCoilValve', 0, 15).toFixed(0),
    outsideDamper: +clamp(20 + 40 * tf + rand(-2, 2), 10, 100).toFixed(0),
    returnDamper: +clamp(80 - 40 * tf + rand(-2, 2), 0, 90).toFixed(0),
    filterPressureDrop: +anom(clamp(120 + 80 * tf + rand(-5, 5), 50, 300), 'filterPressureDrop', 80, 170).toFixed(0),
    airflowRate: +anom(clamp(3000 + 4000 * tf + rand(-100, 100), 1000, 8000), 'airflowRate', 3500, 6000).toFixed(0),
    co2Level: +anom(clamp(400 + 400 * tf + rand(-20, 20), 350, 1200), 'co2Level', 380, 600).toFixed(0),
    energyConsumption: +anom(5 + 15 * tf + rand(-0.5, 0.5), 'energyConsumption', 3, 14).toFixed(2),
  };
  if (prevAHU) {
    const s = (p: number, n: number) => +(p + (n - p) * 0.3).toFixed(2);
    d.supplyAirTemp = +s(prevAHU.supplyAirTemp, d.supplyAirTemp).toFixed(1);
    d.returnAirTemp = +s(prevAHU.returnAirTemp, d.returnAirTemp).toFixed(1);
    d.fanSpeed = +s(prevAHU.fanSpeed, d.fanSpeed).toFixed(0);
  }
  prevAHU = { ...d };
  return d;
}

let prevChiller: ChillerSensors | null = null;
export function generateChiller(): ChillerSensors {
  const tf = timeFactor();
  const load = clamp(20 + 70 * tf + rand(-5, 5), 0, 100);
  const d: ChillerSensors = {
    timestamp: Date.now(),
    chilledWaterSupply: +anom(6.7 + rand(-0.3, 0.3), 'chilledWaterSupply', 6.2, 7.2).toFixed(1),
    chilledWaterReturn: +anom(12 + 3 * tf + rand(-0.3, 0.3), 'chilledWaterReturn', 11, 13.5).toFixed(1),
    condenserWaterSupply: +anom(29 + 5 * tf + rand(-0.5, 0.5), 'condenserWaterSupply', 28, 33).toFixed(1),
    condenserWaterReturn: +anom(35 + 5 * tf + rand(-0.5, 0.5), 'condenserWaterReturn', 33, 37).toFixed(1),
    compressorPower: +anom(clamp(50 + 150 * tf + rand(-5, 5), 10, 220), 'compressorPower', 40, 160).toFixed(1),
    compressorSpeed: +clamp(2000 + 1500 * tf + rand(-30, 30), 800, 3600).toFixed(0),
    evaporatorPressure: +anom(clamp(3.5 + 1.5 * tf + rand(-0.1, 0.1), 2.5, 6), 'evaporatorPressure', 3.5, 4.8).toFixed(2),
    condenserPressure: +anom(clamp(10 + 4 * tf + rand(-0.2, 0.2), 8, 16), 'condenserPressure', 9, 12.5).toFixed(2),
    suctionTemp: +(4 + rand(-0.5, 0.5)).toFixed(1),
    dischargeTemp: +(55 + 20 * tf + rand(-1, 1)).toFixed(1),
    oilPressure: +anom(clamp(4.2 + rand(-0.1, 0.1), 3.5, 5), 'oilPressure', 4.0, 4.5).toFixed(2),
    oilTemp: +clamp(45 + 10 * tf + rand(-1, 1), 35, 65).toFixed(1),
    refrigerantCharge: +anom(clamp(95 - 2 * tf + rand(-1, 1), 85, 100), 'refrigerantCharge', 93, 100).toFixed(1),
    cop: +anom(clamp(5.5 - 1.5 * tf + rand(-0.2, 0.2), 3, 7), 'cop', 4.8, 6.5).toFixed(2),
    loadPercent: +anom(load, 'loadPercent', 25, 75).toFixed(1),
    energyConsumption: +(20 + 80 * tf + rand(-2, 2)).toFixed(2),
  };
  if (prevChiller) {
    const s = (p: number, n: number) => +(p + (n - p) * 0.3).toFixed(2);
    d.chilledWaterSupply = +s(prevChiller.chilledWaterSupply, d.chilledWaterSupply).toFixed(1);
    d.compressorPower = +s(prevChiller.compressorPower, d.compressorPower).toFixed(1);
  }
  prevChiller = { ...d };
  return d;
}

let prevCT: CoolingTowerSensors | null = null;
export function generateCoolingTower(): CoolingTowerSensors {
  const tf = timeFactor();
  const d: CoolingTowerSensors = {
    timestamp: Date.now(),
    hotWaterIn: +anom(35 + 5 * tf + rand(-0.5, 0.5), 'hotWaterIn', 33, 38).toFixed(1),
    coldWaterOut: +anom(28 + 3 * tf + rand(-0.3, 0.3), 'coldWaterOut', 26, 30).toFixed(1),
    wetBulbTemp: +(22 + 4 * tf + rand(-0.5, 0.5)).toFixed(1),
    approachTemp: +anom(5 + 2 * tf + rand(-0.3, 0.3), 'approachTemp', 4, 6.5).toFixed(1),
    fanSpeed: +anom(clamp(600 + 800 * tf + rand(-20, 20), 0, 1500), 'ctFanSpeed', 400, 1200).toFixed(0),
    fanPower: +clamp(5 + 10 * tf + rand(-0.3, 0.3), 0, 18).toFixed(2),
    waterFlowRate: +anom(clamp(400 + 200 * tf + rand(-10, 10), 200, 700), 'waterFlowRate', 350, 550).toFixed(0),
    basinLevel: +anom(clamp(75 + 10 * tf + rand(-2, 2), 40, 95), 'basinLevel', 60, 85).toFixed(1),
    blowdownRate: +anom(clamp(5 + 3 * tf + rand(-0.5, 0.5), 1, 12), 'blowdownRate', 3, 7).toFixed(1),
    makeupWaterFlow: +clamp(10 + 8 * tf + rand(-1, 1), 3, 25).toFixed(1),
    driftLoss: +(0.001 + rand(0, 0.002)).toFixed(4),
    vibration: +anom(clamp(1.5 + 1.5 * tf + rand(-0.2, 0.2), 0.5, 5), 'vibration', 0.5, 2.5).toFixed(2),
    cycles: +clamp(3 + 2 * tf + rand(-0.2, 0.2), 2, 6).toFixed(1),
    energyConsumption: +(8 + 12 * tf + rand(-0.5, 0.5)).toFixed(2),
  };
  if (prevCT) {
    const s = (p: number, n: number) => +(p + (n - p) * 0.3).toFixed(2);
    d.hotWaterIn = +s(prevCT.hotWaterIn, d.hotWaterIn).toFixed(1);
    d.fanSpeed = +s(prevCT.fanSpeed, d.fanSpeed).toFixed(0);
  }
  prevCT = { ...d };
  return d;
}

let prevBoiler: BoilerSensors | null = null;
export function generateBoiler(): BoilerSensors {
  const tf = 1 - timeFactor(); // Boiler works opposite — more in winter/night
  const d: BoilerSensors = {
    timestamp: Date.now(),
    supplyWaterTemp: +anom(clamp(70 + 15 * tf + rand(-1, 1), 50, 90), 'supplyWaterTemp', 65, 80).toFixed(1),
    returnWaterTemp: +anom(clamp(55 + 10 * tf + rand(-1, 1), 40, 70), 'returnWaterTemp', 45, 60).toFixed(1),
    flueGasTemp: +anom(clamp(150 + 50 * tf + rand(-3, 3), 100, 250), 'flueGasTemp', 120, 180).toFixed(1),
    steamPressure: +clamp(3 + 4 * tf + rand(-0.2, 0.2), 1, 8).toFixed(2),
    burnerOutput: +anom(clamp(20 + 70 * tf + rand(-3, 3), 0, 100), 'burnerOutput', 10, 70).toFixed(0),
    fuelFlowRate: +anom(clamp(5 + 15 * tf + rand(-0.5, 0.5), 0, 25), 'fuelFlowRate', 3, 15).toFixed(2),
    airFuelRatio: +clamp(10.5 + rand(-0.3, 0.3), 9, 12).toFixed(2),
    oxygenLevel: +anom(clamp(3.5 + rand(-0.3, 0.3), 2, 6), 'oxygenLevel', 3, 4.2).toFixed(1),
    coLevel: +anom(clamp(20 + 30 * tf + rand(-5, 5), 5, 100), 'coLevel', 10, 35).toFixed(0),
    waterPressure: +anom(clamp(3.5 + rand(-0.2, 0.2), 2.5, 5), 'waterPressure', 3.0, 4.0).toFixed(2),
    waterFlowRate: +clamp(100 + 100 * tf + rand(-5, 5), 40, 250).toFixed(0),
    thermalEfficiency: +anom(clamp(92 - 5 * tf + rand(-0.5, 0.5), 80, 96), 'thermalEfficiency', 89, 96).toFixed(1),
    stackTemp: +clamp(120 + 40 * tf + rand(-3, 3), 80, 200).toFixed(1),
    energyConsumption: +(10 + 30 * tf + rand(-1, 1)).toFixed(2),
  };
  if (prevBoiler) {
    const s = (p: number, n: number) => +(p + (n - p) * 0.3).toFixed(2);
    d.supplyWaterTemp = +s(prevBoiler.supplyWaterTemp, d.supplyWaterTemp).toFixed(1);
    d.burnerOutput = +s(prevBoiler.burnerOutput, d.burnerOutput).toFixed(0);
  }
  prevBoiler = { ...d };
  return d;
}

let prevVAV: VAVSensors | null = null;
export function generateVAV(): VAVSensors {
  const tf = timeFactor();
  const occ = tf > 0.5 ? 1 : 0;
  const d: VAVSensors = {
    timestamp: Date.now(),
    zoneTemp: +anom(clamp(22 + 3 * tf + rand(-0.3, 0.3), 18, 28), 'zoneTemp', 21, 23.5).toFixed(1),
    zoneSetpoint: 22,
    dischargeAirTemp: +anom(14 + 4 * tf + rand(-0.3, 0.3), 'dischargeAirTemp', 13, 17).toFixed(1),
    airflowRate: +anom(clamp(400 + 700 * tf + rand(-20, 20), 200, 1200), 'vavAirflow', 400, 900).toFixed(0),
    airflowSetpoint: +clamp(500 + 500 * tf, 400, 1100).toFixed(0),
    damperPosition: +anom(clamp(30 + 60 * tf + rand(-2, 2), 10, 100), 'damperPosition', 20, 80).toFixed(0),
    reheatValve: +anom(clamp(15 - 10 * tf + rand(-2, 2), 0, 100), 'reheatValve', 0, 30).toFixed(0),
    zoneHumidity: +anom(clamp(45 + 10 * tf + rand(-2, 2), 30, 65), 'zoneHumidity', 35, 52).toFixed(1),
    zoneCO2: +anom(clamp(400 + 350 * tf + rand(-15, 15), 350, 1000), 'zoneCO2', 380, 600).toFixed(0),
    occupancy: occ,
    heatingDemand: +clamp(20 - 15 * tf + rand(-2, 2), 0, 100).toFixed(0),
    coolingDemand: +clamp(10 + 60 * tf + rand(-3, 3), 0, 100).toFixed(0),
    staticPressure: +anom(clamp(0.8 + 0.4 * tf + rand(-0.05, 0.05), 0.4, 1.5), 'staticPressure', 0.6, 1.0).toFixed(3),
    energyConsumption: +(0.5 + 2 * tf + rand(-0.1, 0.1)).toFixed(2),
  };
  if (prevVAV) {
    const s = (p: number, n: number) => +(p + (n - p) * 0.3).toFixed(2);
    d.zoneTemp = +s(prevVAV.zoneTemp, d.zoneTemp).toFixed(1);
    d.damperPosition = +s(prevVAV.damperPosition, d.damperPosition).toFixed(0);
  }
  prevVAV = { ...d };
  return d;
}

let prevFCU: FCUSensors | null = null;
export function generateFCU(): FCUSensors {
  const tf = timeFactor();
  const d: FCUSensors = {
    timestamp: Date.now(),
    roomTemp: +anom(clamp(23 + 3 * tf + rand(-0.3, 0.3), 18, 28), 'roomTemp', 21.5, 24.5).toFixed(1),
    roomSetpoint: 23,
    supplyAirTemp: +anom(15 + 3 * tf + rand(-0.3, 0.3), 'fcuSupply', 14, 18).toFixed(1),
    returnAirTemp: +(23 + 2 * tf + rand(-0.3, 0.3)).toFixed(1),
    fanSpeed: +clamp(1 + 2 * tf, 0, 3).toFixed(0),
    coolingValve: +anom(clamp(20 + 60 * tf + rand(-3, 3), 0, 100), 'fcuCoolValve', 5, 65).toFixed(0),
    heatingValve: +anom(clamp(10 - 8 * tf + rand(-2, 2), 0, 100), 'fcuHeatValve', 0, 20).toFixed(0),
    filterStatus: +anom(clamp(80 - 20 * tf + rand(-3, 3), 30, 100), 'fcuFilter', 60, 100).toFixed(0),
    humidity: +anom(clamp(48 + 8 * tf + rand(-2, 2), 30, 70), 'fcuHumidity', 38, 54).toFixed(1),
    airflowRate: +anom(clamp(300 + 500 * tf + rand(-15, 15), 100, 800), 'fcuAirflow', 300, 650).toFixed(0),
    waterInTemp: +(7 + rand(-0.3, 0.3)).toFixed(1),
    waterOutTemp: +(12 + 2 * tf + rand(-0.3, 0.3)).toFixed(1),
    mode: tf > 0.5 ? 1 : tf < 0.2 ? 2 : 3,
    energyConsumption: +(0.3 + 1.5 * tf + rand(-0.1, 0.1)).toFixed(2),
  };
  if (prevFCU) {
    const s = (p: number, n: number) => +(p + (n - p) * 0.3).toFixed(2);
    d.roomTemp = +s(prevFCU.roomTemp, d.roomTemp).toFixed(1);
    d.coolingValve = +s(prevFCU.coolingValve, d.coolingValve).toFixed(0);
  }
  prevFCU = { ...d };
  return d;
}

// ─── Factory ───

type EquipType = 'ahu' | 'chiller' | 'cooling-tower' | 'boiler' | 'vav' | 'fcu';

const generators: Record<EquipType, () => AnySensors> = {
  ahu: generateAHU,
  chiller: generateChiller,
  'cooling-tower': generateCoolingTower,
  boiler: generateBoiler,
  vav: generateVAV,
  fcu: generateFCU,
};

export function generateSensorsFor(type: EquipType): AnySensors {
  return generators[type]();
}

export function generateHistoryFor(type: EquipType, points = 60): AnySensors[] {
  const gen = generators[type];
  const data: AnySensors[] = [];
  const now = Date.now();
  for (let i = points - 1; i >= 0; i--) {
    const d = gen();
    (d as { timestamp: number }).timestamp = now - i * 60000;
    data.push(d);
  }
  return data;
}
