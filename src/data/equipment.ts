export type EquipmentStatus = 'online' | 'warning' | 'offline' | 'maintenance';

export interface Equipment {
  id: string;
  name: string;
  type: 'ahu' | 'chiller' | 'cooling-tower' | 'boiler' | 'vav' | 'fcu';
  category: 'Air Handling' | 'Cooling' | 'Heating' | 'Terminal Units';
  location: string;
  floor: string;
  status: EquipmentStatus;
  enabled: boolean; // whether dashboard is available
  description: string;
  specs: Record<string, string>;
  lastMaintenance: string;
  efficiency: number;
}

export const equipment: Equipment[] = [
  {
    id: 'ahu-01',
    name: 'AHU-01',
    type: 'ahu',
    category: 'Air Handling',
    location: 'Building A — Mechanical Room 3F',
    floor: 'Floor 3',
    status: 'online',
    enabled: true,
    description:
      'Primary air handling unit serving the east wing offices. Handles supply, return, and exhaust air with full economizer capability.',
    specs: {
      'Airflow Capacity': '8,000 CFM',
      'Cooling Capacity': '25 Tons',
      'Heating Capacity': '150 kBTU/h',
      'Filter Type': 'MERV-13',
      Motor: '7.5 HP VFD',
    },
    lastMaintenance: '2026-03-15',
    efficiency: 87,
  },
  {
    id: 'ahu-02',
    name: 'AHU-02',
    type: 'ahu',
    category: 'Air Handling',
    location: 'Building A — Mechanical Room 5F',
    floor: 'Floor 5',
    status: 'warning',
    enabled: true,
    description:
      'Secondary AHU serving the west wing conference rooms and lobby areas. Filter replacement overdue.',
    specs: {
      'Airflow Capacity': '6,000 CFM',
      'Cooling Capacity': '18 Tons',
      'Heating Capacity': '120 kBTU/h',
      'Filter Type': 'MERV-11',
      Motor: '5 HP VFD',
    },
    lastMaintenance: '2026-01-20',
    efficiency: 72,
  },
  {
    id: 'chiller-01',
    name: 'Chiller-01',
    type: 'chiller',
    category: 'Cooling',
    location: 'Building A — Central Plant Basement',
    floor: 'Basement',
    status: 'online',
    enabled: true,
    description:
      'Water-cooled centrifugal chiller providing chilled water to all AHUs and FCUs in Building A.',
    specs: {
      Capacity: '200 Tons',
      Refrigerant: 'R-134a',
      COP: '6.1',
      'Chilled Water': '44°F / 54°F',
    },
    lastMaintenance: '2026-02-28',
    efficiency: 91,
  },
  {
    id: 'ct-01',
    name: 'Cooling Tower-01',
    type: 'cooling-tower',
    category: 'Cooling',
    location: 'Building A — Rooftop',
    floor: 'Roof',
    status: 'online',
    enabled: true,
    description:
      'Induced-draft cooling tower rejecting heat from the chiller condenser loop.',
    specs: {
      Capacity: '250 Tons',
      'Fan Motor': '15 HP',
      'Water Flow': '600 GPM',
      Approach: '7°F',
    },
    lastMaintenance: '2026-03-01',
    efficiency: 85,
  },
  {
    id: 'boiler-01',
    name: 'Boiler-01',
    type: 'boiler',
    category: 'Heating',
    location: 'Building A — Central Plant Basement',
    floor: 'Basement',
    status: 'offline',
    enabled: true,
    description:
      'Condensing gas boiler for heating hot water. Currently offline for summer season.',
    specs: {
      Capacity: '1,500 kBTU/h',
      Fuel: 'Natural Gas',
      Efficiency: '95% AFUE',
      'Hot Water': '180°F / 160°F',
    },
    lastMaintenance: '2026-04-01',
    efficiency: 0,
  },
  {
    id: 'vav-01',
    name: 'VAV Box 3F-01',
    type: 'vav',
    category: 'Terminal Units',
    location: 'Building A — Zone 3F-East',
    floor: 'Floor 3',
    status: 'online',
    enabled: true,
    description:
      'Variable Air Volume box controlling airflow to the open office area on Floor 3 east wing.',
    specs: {
      'Max Airflow': '1,200 CFM',
      'Min Airflow': '400 CFM',
      'Reheat Coil': 'Electric 5kW',
      'Zone Setpoint': '72°F',
    },
    lastMaintenance: '2026-03-10',
    efficiency: 93,
  },
  {
    id: 'fcu-01',
    name: 'FCU Lobby-01',
    type: 'fcu',
    category: 'Terminal Units',
    location: 'Building A — Main Lobby',
    floor: 'Floor 1',
    status: 'maintenance',
    enabled: true,
    description:
      'Fan coil unit in the main lobby. Currently undergoing motor replacement.',
    specs: {
      'Airflow': '800 CFM',
      'Cooling Capacity': '2 Tons',
      'Fan Stages': '3-speed',
      'Control': 'DDC',
    },
    lastMaintenance: '2026-04-05',
    efficiency: 0,
  },
];

export const categories = [...new Set(equipment.map((e) => e.category))];
