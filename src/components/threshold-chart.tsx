import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { type Threshold, type EvalResult, evaluate } from '@/data/thresholds';

type Row = Record<string, number>;

interface Props {
  data: Row[];
  thresholds: Threshold[];
}

const snakeCase = (s: string) =>
  s.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');

export function ThresholdChart({ data, thresholds }: Props) {
  const [selectedKey, setSelectedKey] = useState(thresholds[0]?.key ?? '');

  const threshold = thresholds.find((t) => t.key === selectedKey);

  const chartData = useMemo(() => {
    return data.map((d) => ({
      time: new Date(d.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      value: d[selectedKey] ?? 0,
      timestamp: d.timestamp,
    }));
  }, [data, selectedKey]);

  // Stats
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    const values = chartData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    const current = values[values.length - 1];

    let normalCount = 0;
    let warningCount = 0;
    let criticalCount = 0;
    if (threshold) {
      values.forEach((v) => {
        const r = evaluate(v, threshold);
        if (r === 'normal') normalCount++;
        else if (r === 'warning') warningCount++;
        else criticalCount++;
      });
    }

    return { min, max, avg, current, normalCount, warningCount, criticalCount, total: values.length };
  }, [chartData, threshold]);

  const currentEval: EvalResult = threshold && stats
    ? evaluate(stats.current, threshold)
    : 'normal';

  // Calculate Y axis range to include threshold bands
  const yRange = useMemo(() => {
    if (!threshold || !stats) return undefined;
    const allValues = [
      stats.min,
      stats.max,
      threshold.min,
      threshold.max,
      threshold.criticalMin ?? threshold.min,
      threshold.criticalMax ?? threshold.max,
    ];
    const lo = Math.min(...allValues);
    const hi = Math.max(...allValues);
    const pad = (hi - lo) * 0.15;
    return [+(lo - pad).toFixed(2), +(hi + pad).toFixed(2)] as [number, number];
  }, [threshold, stats]);

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Measurement Analysis
            </h3>
            <Select value={selectedKey} onValueChange={(v) => v && setSelectedKey(v)}>
              <SelectTrigger className="h-8 w-[220px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {thresholds.map((t) => (
                  <SelectItem key={t.key} value={t.key}>
                    {t.label} ({t.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current value + status */}
          {stats && threshold && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-muted-foreground">Current</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold font-mono">
                    {Number.isInteger(stats.current) ? stats.current : stats.current.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">{threshold.unit}</span>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`text-xs ${
                  currentEval === 'normal'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                    : currentEval === 'warning'
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                      : 'bg-red-500/10 text-red-500 border-red-500/30'
                }`}
              >
                {currentEval === 'normal' ? 'Normal' : currentEval === 'warning' ? 'Warning' : 'Critical'}
              </Badge>
            </div>
          )}
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={yRange}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [
                `${Number.isInteger(value) ? value : value.toFixed(2)} ${threshold?.unit ?? ''}`,
                threshold?.label ?? selectedKey,
              ]}
            />

            {/* Threshold bands */}
            {threshold && yRange && (
              <>
                {/* Critical low zone */}
                {threshold.criticalMin !== undefined && (
                  <ReferenceArea
                    y1={yRange[0]}
                    y2={threshold.criticalMin}
                    fill="#ef4444"
                    fillOpacity={0.08}
                    label=""
                  />
                )}

                {/* Warning low zone */}
                <ReferenceArea
                  y1={threshold.criticalMin ?? yRange[0]}
                  y2={threshold.min}
                  fill="#f59e0b"
                  fillOpacity={0.08}
                  label=""
                />

                {/* Normal zone */}
                <ReferenceArea
                  y1={threshold.min}
                  y2={threshold.max}
                  fill="#22c55e"
                  fillOpacity={0.06}
                  label=""
                />

                {/* Warning high zone */}
                <ReferenceArea
                  y1={threshold.max}
                  y2={threshold.criticalMax ?? yRange[1]}
                  fill="#f59e0b"
                  fillOpacity={0.08}
                  label=""
                />

                {/* Critical high zone */}
                {threshold.criticalMax !== undefined && (
                  <ReferenceArea
                    y1={threshold.criticalMax}
                    y2={yRange[1]}
                    fill="#ef4444"
                    fillOpacity={0.08}
                    label=""
                  />
                )}

                {/* Threshold lines */}
                <ReferenceLine
                  y={threshold.min}
                  stroke="#22c55e"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  label={{ value: `Min ${threshold.min}`, position: 'left', fontSize: 9, fill: '#22c55e' }}
                />
                <ReferenceLine
                  y={threshold.max}
                  stroke="#22c55e"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  label={{ value: `Max ${threshold.max}`, position: 'left', fontSize: 9, fill: '#22c55e' }}
                />
                {threshold.criticalMax !== undefined && (
                  <ReferenceLine
                    y={threshold.criticalMax}
                    stroke="#ef4444"
                    strokeDasharray="2 2"
                    strokeWidth={1}
                    label={{ value: `Crit ${threshold.criticalMax}`, position: 'left', fontSize: 9, fill: '#ef4444' }}
                  />
                )}
                {threshold.criticalMin !== undefined && (
                  <ReferenceLine
                    y={threshold.criticalMin}
                    stroke="#ef4444"
                    strokeDasharray="2 2"
                    strokeWidth={1}
                    label={{ value: `Crit ${threshold.criticalMin}`, position: 'left', fontSize: 9, fill: '#ef4444' }}
                  />
                )}
              </>
            )}

            {/* Data line + filled area */}
            <defs>
              <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#valueGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#06b6d4' }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Stats bar */}
        {stats && threshold && (
          <div className="mt-3 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-4 text-xs">
              {[
                { label: 'Min', value: stats.min.toFixed(1) },
                { label: 'Max', value: stats.max.toFixed(1) },
                { label: 'Avg', value: stats.avg.toFixed(1) },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1">
                  <span className="text-muted-foreground">{s.label}:</span>
                  <span className="font-mono font-medium">{s.value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto text-[11px]">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {stats.normalCount} normal
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                {stats.warningCount} warning
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                {stats.criticalCount} critical
              </span>
              <span className="text-muted-foreground">
                / {stats.total} readings
              </span>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-6 rounded-sm bg-emerald-500/20 border border-emerald-500/30" />
            Normal range
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-6 rounded-sm bg-amber-500/20 border border-amber-500/30" />
            Warning zone
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-6 rounded-sm bg-red-500/20 border border-red-500/30" />
            Critical zone
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-6 rounded-sm border border-emerald-500/50" style={{ borderStyle: 'dashed' }} />
            Threshold line
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
