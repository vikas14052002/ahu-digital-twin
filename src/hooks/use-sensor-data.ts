import { useState, useEffect, useCallback } from 'react';
import {
  type SensorData,
  type Alert,
  generateSensorData,
  generateHistoricalData,
  checkAlerts,
} from '@/data/mock-data';

const MAX_HISTORY = 120;
const MAX_ALERTS = 20;

export function useSensorData(interval = 2000) {
  const [current, setCurrent] = useState<SensorData>(generateSensorData);
  const [history, setHistory] = useState<SensorData[]>(() =>
    generateHistoricalData(60)
  );
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  const tick = useCallback(() => {
    const data = generateSensorData();
    setCurrent(data);
    setHistory((prev) => [...prev.slice(-(MAX_HISTORY - 1)), data]);
    const newAlerts = checkAlerts(data);
    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, MAX_ALERTS));
    }
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [tick, interval, isPaused]);

  const togglePause = useCallback(() => setIsPaused((p) => !p), []);
  const clearAlerts = useCallback(() => setAlerts([]), []);

  return { current, history, alerts, isPaused, togglePause, clearAlerts };
}
