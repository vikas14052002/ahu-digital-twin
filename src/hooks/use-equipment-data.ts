import { useState, useEffect, useCallback } from 'react';
import {
  type AnySensors,
  generateSensorsFor,
  generateHistoryFor,
} from '@/data/equipment-sensors';

type EquipType = 'ahu' | 'chiller' | 'cooling-tower' | 'boiler' | 'vav' | 'fcu';

const MAX_HISTORY = 120;

export function useEquipmentData(type: EquipType, interval = 2000) {
  const [current, setCurrent] = useState<AnySensors>(() => generateSensorsFor(type));
  const [history, setHistory] = useState<AnySensors[]>(() => generateHistoryFor(type, 60));
  const [isPaused, setIsPaused] = useState(false);

  const tick = useCallback(() => {
    const data = generateSensorsFor(type);
    setCurrent(data);
    setHistory((prev) => [...prev.slice(-(MAX_HISTORY - 1)), data]);
  }, [type]);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [tick, interval, isPaused]);

  const togglePause = useCallback(() => setIsPaused((p) => !p), []);

  return { current, history, isPaused, togglePause };
}
