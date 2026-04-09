import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  CheckCircle2, AlertTriangle, XCircle, Settings2, Shield, TrendingDown, TrendingUp,
} from 'lucide-react';
import {
  type Threshold, type EvalResult, type ThresholdMap,
  evaluate, defaultThresholds,
} from '@/data/thresholds';

type EquipType = 'ahu' | 'chiller' | 'cooling-tower' | 'boiler' | 'vav' | 'fcu';
type Row = Record<string, number>;

interface Props {
  type: EquipType;
  data: Row;       // current / active snapshot
  history: Row[];  // for trend analysis
}

const resultConfig: Record<EvalResult, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  normal: { label: 'Normal', color: '#22c55e', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  warning: { label: 'Warning', color: '#f59e0b', bg: 'bg-amber-500/10', icon: AlertTriangle },
  critical: { label: 'Critical', color: '#ef4444', bg: 'bg-red-500/10', icon: XCircle },
};

export function EvaluationPanel({ type, data, history }: Props) {
  const [thresholds, setThresholds] = useState<ThresholdMap>(() => {
    // deep clone
    const stored = localStorage.getItem(`thresholds-${type}`);
    if (stored) try { return { ...defaultThresholds, [type]: JSON.parse(stored) }; } catch { /* noop */ }
    return { ...defaultThresholds };
  });
  const [enabled, setEnabled] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const eqThresholds = thresholds[type] ?? [];

  const results = useMemo(() => {
    return eqThresholds.map((t) => {
      const value = data[t.key];
      if (value === undefined) return { ...t, value: 0, result: 'normal' as EvalResult, trend: 0 };
      const result = evaluate(value, t);
      // Simple trend: compare last 10 vs previous 10
      const recent = history.slice(-10);
      const older = history.slice(-20, -10);
      const avgRecent = recent.length > 0 ? recent.reduce((s, r) => s + (r[t.key] ?? 0), 0) / recent.length : value;
      const avgOlder = older.length > 0 ? older.reduce((s, r) => s + (r[t.key] ?? 0), 0) / older.length : value;
      const trend = avgRecent - avgOlder;
      return { ...t, value, result, trend };
    });
  }, [eqThresholds, data, history]);

  const summary = useMemo(() => {
    const counts = { normal: 0, warning: 0, critical: 0 };
    results.forEach((r) => counts[r.result]++);
    return counts;
  }, [results]);

  const overallStatus: EvalResult =
    summary.critical > 0 ? 'critical' : summary.warning > 0 ? 'warning' : 'normal';
  const overallScore = results.length > 0
    ? Math.round((summary.normal / results.length) * 100)
    : 100;

  const updateThreshold = (key: string, field: keyof Threshold, value: number) => {
    setThresholds((prev) => {
      const updated = (prev[type] ?? []).map((t) =>
        t.key === key ? { ...t, [field]: value } : t
      );
      localStorage.setItem(`thresholds-${type}`, JSON.stringify(updated));
      return { ...prev, [type]: updated };
    });
  };

  const resetThresholds = () => {
    localStorage.removeItem(`thresholds-${type}`);
    setThresholds({ ...defaultThresholds });
  };

  if (!enabled) return null;

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <Card className={`border-border/50 ${resultConfig[overallStatus].bg} backdrop-blur`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" style={{ color: resultConfig[overallStatus].color }} />
              <span className="text-sm font-semibold">Equipment Health Evaluation</span>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <Settings2 className="h-3 w-3 mr-1" /> Adjust Thresholds
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] w-[700px] max-h-[85vh] overflow-y-auto p-6">
                  <DialogHeader>
                    <DialogTitle className="text-base">Threshold Configuration — {type.toUpperCase()}</DialogTitle>
                  </DialogHeader>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    Adjust the acceptable ranges for each sensor. Values outside the normal range show as warnings.
                    Values outside the critical range show as critical alerts.
                  </p>
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="grid grid-cols-[1fr_80px_80px_80px_80px] gap-2 px-1 pb-2 border-b border-border/50">
                      <span className="text-xs font-medium text-muted-foreground">Sensor</span>
                      <span className="text-xs font-medium text-center text-red-400">Crit Min</span>
                      <span className="text-xs font-medium text-center text-emerald-500">Normal Min</span>
                      <span className="text-xs font-medium text-center text-emerald-500">Normal Max</span>
                      <span className="text-xs font-medium text-center text-red-400">Crit Max</span>
                    </div>
                    {/* Rows */}
                    {eqThresholds.map((t, i) => (
                      <div
                        key={t.key}
                        className={`grid grid-cols-[1fr_80px_80px_80px_80px] gap-2 items-center px-1 py-2 rounded-md ${
                          i % 2 === 0 ? 'bg-muted/30' : ''
                        }`}
                      >
                        <div>
                          <span className="text-sm font-medium">{t.label}</span>
                          <span className="text-xs text-muted-foreground ml-1">({t.unit})</span>
                        </div>
                        <Input
                          type="number"
                          step="any"
                          className="h-8 text-xs text-center"
                          value={t.criticalMin ?? ''}
                          placeholder="—"
                          onChange={(e) => updateThreshold(t.key, 'criticalMin', Number(e.target.value))}
                        />
                        <Input
                          type="number"
                          step="any"
                          className="h-8 text-xs text-center"
                          value={t.min}
                          onChange={(e) => updateThreshold(t.key, 'min', Number(e.target.value))}
                        />
                        <Input
                          type="number"
                          step="any"
                          className="h-8 text-xs text-center"
                          value={t.max}
                          onChange={(e) => updateThreshold(t.key, 'max', Number(e.target.value))}
                        />
                        <Input
                          type="number"
                          step="any"
                          className="h-8 text-xs text-center"
                          value={t.criticalMax ?? ''}
                          placeholder="—"
                          onChange={(e) => updateThreshold(t.key, 'criticalMax', Number(e.target.value))}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                    <p className="text-[10px] text-muted-foreground">
                      Changes are saved automatically to local storage.
                    </p>
                    <Button variant="outline" size="sm" onClick={resetThresholds} className="text-xs">
                      Reset to Defaults
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">Eval</span>
                <Switch checked={enabled} onCheckedChange={setEnabled} />
              </div>
            </div>
          </div>

          {/* Score + Summary badges */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div
                className="h-14 w-14 rounded-full flex items-center justify-center border-2"
                style={{
                  borderColor: resultConfig[overallStatus].color,
                  backgroundColor: `${resultConfig[overallStatus].color}15`,
                }}
              >
                <span className="text-lg font-bold" style={{ color: resultConfig[overallStatus].color }}>
                  {overallScore}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: resultConfig[overallStatus].color }}>
                  {overallStatus === 'normal' ? 'Healthy' : overallStatus === 'warning' ? 'Needs Attention' : 'Critical Issues'}
                </p>
                <p className="text-[10px] text-muted-foreground">Health Score</p>
              </div>
            </div>
            <div className="flex gap-2">
              {(['normal', 'warning', 'critical'] as const).map((r) => {
                const cfg = resultConfig[r];
                const Icon = cfg.icon;
                return (
                  <Badge key={r} variant="outline" className="text-[10px] gap-1" style={{ borderColor: `${cfg.color}40`, color: cfg.color }}>
                    <Icon className="h-3 w-3" />
                    {summary[r]} {cfg.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Results grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {results.map((r) => {
              const cfg = resultConfig[r.result];
              const Icon = cfg.icon;
              return (
                <div
                  key={r.key}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 border transition-colors ${
                    r.result === 'critical'
                      ? 'bg-red-500/8 border-red-500/25'
                      : r.result === 'warning'
                        ? 'bg-amber-500/8 border-amber-500/25'
                        : 'bg-muted/20 border-border/30'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: cfg.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground truncate">{r.label}</span>
                      {Math.abs(r.trend) > 0.1 && (
                        r.trend > 0
                          ? <TrendingUp className="h-3 w-3 text-amber-400" />
                          : <TrendingDown className="h-3 w-3 text-emerald-400" />
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold font-mono" style={{ color: cfg.color }}>
                        {typeof r.value === 'number' ? (Number.isInteger(r.value) ? r.value : r.value.toFixed(1)) : r.value}
                      </span>
                      <span className="text-[9px] text-muted-foreground">{r.unit}</span>
                      <span className="text-[9px] text-muted-foreground/50 ml-auto">
                        {r.min}–{r.max}
                      </span>
                    </div>
                    {/* Mini range bar */}
                    <div className="h-1 mt-1 rounded-full bg-muted/30 overflow-hidden relative">
                      {/* Normal zone */}
                      <div
                        className="absolute h-full bg-emerald-500/20 rounded-full"
                        style={{
                          left: `${((r.min - (r.criticalMin ?? r.min)) / ((r.criticalMax ?? r.max) - (r.criticalMin ?? r.min))) * 100}%`,
                          width: `${((r.max - r.min) / ((r.criticalMax ?? r.max) - (r.criticalMin ?? r.min))) * 100}%`,
                        }}
                      />
                      {/* Value indicator */}
                      <div
                        className="absolute h-full w-1 rounded-full"
                        style={{
                          left: `${Math.min(100, Math.max(0, ((r.value - (r.criticalMin ?? r.min)) / ((r.criticalMax ?? r.max) - (r.criticalMin ?? r.min))) * 100))}%`,
                          backgroundColor: cfg.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
