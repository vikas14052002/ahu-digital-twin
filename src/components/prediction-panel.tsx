import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  RefreshCw,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { type Threshold, evaluate, type EvalResult } from '@/data/thresholds';

type Row = Record<string, number>;

interface Props {
  history: Row[];
  thresholds: Threshold[];
}

interface Prediction {
  key: string;
  label: string;
  unit: string;
  currentValue: number;
  predictedValue: number;
  trend: 'up' | 'down' | 'flat';
  trendPerMin: number;
  currentStatus: EvalResult;
  predictedStatus: EvalResult;
  breachMinutes: number | null; // null = won't breach
  threshold: Threshold;
}

// Simple linear regression: returns slope and intercept
function linearRegression(values: number[]): { slope: number; intercept: number } {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: values[0] ?? 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }

  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function predictBreachTime(
  currentValue: number,
  slopePerReading: number,
  readingIntervalSec: number,
  threshold: Threshold,
): number | null {
  if (slopePerReading === 0) return null;

  const slopePerMin = slopePerReading * (60 / readingIntervalSec);

  // Check which boundary we're heading toward
  const targets: number[] = [];
  if (slopePerMin > 0) {
    // Going up — check max thresholds
    if (currentValue < threshold.max) targets.push(threshold.max);
    if (threshold.criticalMax !== undefined && currentValue < threshold.criticalMax) targets.push(threshold.criticalMax);
  } else {
    // Going down — check min thresholds
    if (currentValue > threshold.min) targets.push(threshold.min);
    if (threshold.criticalMin !== undefined && currentValue > threshold.criticalMin) targets.push(threshold.criticalMin);
  }

  if (targets.length === 0) return null;

  // Find earliest breach
  let earliest = Infinity;
  for (const target of targets) {
    const minutes = (target - currentValue) / slopePerMin;
    if (minutes > 0 && minutes < earliest) earliest = minutes;
  }

  return earliest === Infinity ? null : Math.round(earliest);
}

export function PredictionPanel({ history, thresholds }: Props) {
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [predictedAt, setPredictedAt] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runPrediction = () => {
    setIsRunning(true);

    // Simulate a brief "computing" delay for UX
    setTimeout(() => {
      const results: Prediction[] = [];
      const readingInterval = 2; // seconds between readings

      for (const t of thresholds) {
        const values = history.map((r) => r[t.key]).filter((v) => v !== undefined);
        if (values.length < 5) continue;

        const currentValue = values[values.length - 1];
        const { slope, intercept } = linearRegression(values);

        // Predict 30 minutes ahead (900 readings at 2sec interval)
        const futureReadings = 900 / readingInterval * 30; // not right, let me fix
        const stepsAhead = (30 * 60) / readingInterval; // 30 min / 2 sec = 900 steps
        const predictedValue = +(intercept + slope * (values.length - 1 + stepsAhead)).toFixed(2);

        const slopePerMin = slope * (60 / readingInterval);
        const trend: 'up' | 'down' | 'flat' =
          Math.abs(slopePerMin) < 0.01 ? 'flat' : slopePerMin > 0 ? 'up' : 'down';

        const currentStatus = evaluate(currentValue, t);
        const predictedStatus = evaluate(predictedValue, t);
        const breachMinutes = currentStatus === 'normal'
          ? predictBreachTime(currentValue, slope, readingInterval, t)
          : null; // already breached

        results.push({
          key: t.key,
          label: t.label,
          unit: t.unit,
          currentValue: +currentValue.toFixed(1),
          predictedValue: +(Math.round(predictedValue * 10) / 10),
          trend,
          trendPerMin: +slopePerMin.toFixed(3),
          currentStatus,
          predictedStatus,
          breachMinutes,
          threshold: t,
        });
      }

      setPredictions(results);
      setPredictedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setIsRunning(false);
    }, 800);
  };

  const summary = useMemo(() => {
    if (!predictions) return null;
    const willBreach = predictions.filter((p) => p.breachMinutes !== null).length;
    const willDegrade = predictions.filter((p) => p.predictedStatus !== 'normal' && p.currentStatus === 'normal').length;
    const stable = predictions.filter((p) => p.predictedStatus === 'normal').length;
    return { willBreach, willDegrade, stable, total: predictions.length };
  }, [predictions]);

  // Not yet predicted — show button
  if (!predictions) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50 border-dashed">
        <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
          <BrainCircuit className="h-8 w-8 text-muted-foreground/50" />
          <div className="text-center">
            <p className="text-sm font-medium">Predictive Analysis</p>
            <p className="text-xs text-muted-foreground mt-1">
              Analyze sensor trends and predict values 30 minutes ahead
            </p>
          </div>
          <Button onClick={runPrediction} disabled={isRunning} className="mt-1">
            <BrainCircuit className="h-4 w-4 mr-2" />
            {isRunning ? 'Analyzing...' : 'Run Prediction'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-semibold">Prediction Report</span>
            <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-400 border-violet-500/30">
              30 min forecast
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> {predictedAt}
            </span>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={runPrediction} disabled={isRunning}>
              <RefreshCw className={`h-3 w-3 mr-1 ${isRunning ? 'animate-spin' : ''}`} />
              Re-predict
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setPredictions(null)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="flex items-center gap-3 mb-4 text-xs">
            {summary.willBreach > 0 && (
              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-[10px]">
                <XCircle className="h-3 w-3 mr-1" />
                {summary.willBreach} will breach
              </Badge>
            )}
            {summary.willDegrade > 0 && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {summary.willDegrade} degrading
              </Badge>
            )}
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {summary.stable} stable
            </Badge>
          </div>
        )}

        {/* Prediction rows */}
        <div className="space-y-2">
          {predictions.map((p) => {
            const TrendIcon = p.trend === 'up' ? TrendingUp : p.trend === 'down' ? TrendingDown : Minus;
            const statusColor = p.predictedStatus === 'normal' ? '#22c55e' : p.predictedStatus === 'warning' ? '#f59e0b' : '#ef4444';

            // Progress bar: where predicted value sits in threshold range
            const rangeMin = p.threshold.criticalMin ?? p.threshold.min;
            const rangeMax = p.threshold.criticalMax ?? p.threshold.max;
            const range = rangeMax - rangeMin;
            const currentPos = range > 0 ? ((p.currentValue - rangeMin) / range) * 100 : 50;
            const predictedPos = range > 0 ? ((p.predictedValue - rangeMin) / range) * 100 : 50;
            const normalStart = range > 0 ? ((p.threshold.min - rangeMin) / range) * 100 : 0;
            const normalEnd = range > 0 ? ((p.threshold.max - rangeMin) / range) * 100 : 100;

            return (
              <div key={p.key} className="rounded-lg bg-muted/20 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{p.label}</span>
                    <TrendIcon
                      className="h-3 w-3"
                      style={{ color: p.trend === 'up' ? '#f59e0b' : p.trend === 'down' ? '#06b6d4' : '#6b7280' }}
                    />
                  </div>
                  {p.breachMinutes !== null && (
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-red-500/10 text-red-400 border-red-500/30 animate-pulse"
                    >
                      Breach in ~{p.breachMinutes} min
                    </Badge>
                  )}
                  {p.breachMinutes === null && p.currentStatus !== 'normal' && (
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30">
                      Already outside range
                    </Badge>
                  )}
                  {p.breachMinutes === null && p.currentStatus === 'normal' && p.predictedStatus === 'normal' && (
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      Stable
                    </Badge>
                  )}
                </div>

                {/* Values */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Now: </span>
                    <span className="font-mono font-semibold">{p.currentValue}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">→</span>
                  <div className="text-xs">
                    <span className="text-muted-foreground">+30min: </span>
                    <span className="font-mono font-bold" style={{ color: statusColor }}>
                      {p.predictedValue}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{p.unit}</span>
                  <span className="text-[10px] text-muted-foreground/60 ml-auto">
                    {p.trendPerMin > 0 ? '+' : ''}{p.trendPerMin}/min
                  </span>
                </div>

                {/* Range bar */}
                <div className="relative h-2 rounded-full bg-muted/40 overflow-hidden">
                  {/* Normal zone */}
                  <div
                    className="absolute h-full bg-emerald-500/20 rounded-full"
                    style={{
                      left: `${Math.max(0, normalStart)}%`,
                      width: `${Math.min(100, normalEnd - normalStart)}%`,
                    }}
                  />
                  {/* Current position dot */}
                  <div
                    className="absolute top-0 h-full w-1.5 rounded-full bg-foreground/60"
                    style={{ left: `${Math.max(0, Math.min(100, currentPos))}%` }}
                  />
                  {/* Predicted position dot */}
                  <div
                    className="absolute top-0 h-full w-1.5 rounded-full"
                    style={{
                      left: `${Math.max(0, Math.min(100, predictedPos))}%`,
                      backgroundColor: statusColor,
                    }}
                  />
                  {/* Arrow between them */}
                  {Math.abs(predictedPos - currentPos) > 2 && (
                    <div
                      className="absolute top-0 h-full opacity-30"
                      style={{
                        left: `${Math.min(currentPos, predictedPos)}%`,
                        width: `${Math.abs(predictedPos - currentPos)}%`,
                        backgroundColor: statusColor,
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-[10px] text-muted-foreground mt-3">
          Predictions based on linear regression of last {history.length} readings. Extrapolated 30 minutes ahead.
        </p>
      </CardContent>
    </Card>
  );
}
