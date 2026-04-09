import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Zap,
  CloudSun,
  Fan,
  Activity,
  Pause,
  Play,
  History,
  X,
  ArrowLeft,
  Sun,
  Moon,
  Flame,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/use-theme';
import { useEquipmentData } from '@/hooks/use-equipment-data';
import { equipment } from '@/data/equipment';
import type { AnySensors } from '@/data/equipment-sensors';
import { SensorCard } from './sensor-card';
import { SensorTable } from './sensor-table';
import { EquipmentSchematic, sensorCards } from './schematics';
import { EvaluationPanel } from './evaluation-panel';
import { ThresholdChart } from './threshold-chart';
import { defaultThresholds } from '@/data/thresholds';

type EquipType = 'ahu' | 'chiller' | 'cooling-tower' | 'boiler' | 'vav' | 'fcu';

const iconMap: Record<string, typeof Thermometer> = {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Zap,
  CloudSun,
  Fan,
  Activity,
  Flame,
};

export function Dashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme, toggle: toggleTheme } = useTheme();

  const equip = equipment.find((e) => e.id === id);
  const eType = (equip?.type ?? 'ahu') as EquipType;

  const { current, history, isPaused, togglePause } = useEquipmentData(eType, 2000);
  const [selectedSnapshot, setSelectedSnapshot] = useState<AnySensors | null>(null);

  const activeData = selectedSnapshot ?? current;
  const cards = sensorCards[eType] ?? sensorCards.ahu;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Wind className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-none">
                {equip?.name ?? 'Equipment'} Digital Twin
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {equip?.location ?? 'Unknown Location'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs">
              <Activity className="h-3 w-3 mr-1" />
              {equip?.status?.toUpperCase() ?? 'UNKNOWN'}
            </Badge>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="outline" size="sm" onClick={togglePause} className="h-8 text-xs">
              {isPaused ? (
                <><Play className="h-3 w-3 mr-1" /> Resume</>
              ) : (
                <><Pause className="h-3 w-3 mr-1" /> Pause</>
              )}
            </Button>
            <Button variant="outline" size="icon" onClick={toggleTheme} className="h-8 w-8">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPaused ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isPaused ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              </span>
              <span className="text-xs text-muted-foreground">{isPaused ? 'Paused' : 'Live'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Time-travel banner */}
      {selectedSnapshot && (
        <div className="bg-amber-500/10 border-b border-amber-500/30">
          <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-amber-300 font-medium">Time Travel Mode</span>
              <span className="text-xs text-amber-400/70 font-mono">
                — Viewing snapshot from{' '}
                {new Date((selectedSnapshot as { timestamp: number }).timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <Button
              variant="outline" size="sm"
              onClick={() => setSelectedSnapshot(null)}
              className="h-7 text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
            >
              <X className="h-3 w-3 mr-1" /> Back to Live
            </Button>
          </div>
        </div>
      )}

      <main className="max-w-[1600px] mx-auto p-4 space-y-4">
        {/* Sensor Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {cards.map((card) => {
            const val = (activeData as unknown as Record<string, number>)[card.key];
            const Icon = iconMap[card.icon] ?? Gauge;
            return (
              <SensorCard
                key={card.key}
                title={card.title}
                value={val ?? 0}
                unit={card.unit}
                icon={Icon}
                color={card.color}
                min={card.min}
                max={card.max}
                current={val ?? 0}
              />
            );
          })}
        </div>

        {/* Schematic */}
        <EquipmentSchematic type={eType} data={activeData} />

        {/* Evaluation */}
        <EvaluationPanel
          type={eType}
          data={activeData as unknown as Record<string, number>}
          history={history as unknown as Record<string, number>[]}
        />

        {/* Tabs */}
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="raw-data">Raw Data (ClickHouse)</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="mt-3">
            <ThresholdChart
              data={history as unknown as Record<string, number>[]}
              thresholds={defaultThresholds[eType] ?? []}
            />
          </TabsContent>

          <TabsContent value="raw-data" className="mt-3">
            <SensorTable
              data={history as unknown as Record<string, number>[]}
              selectedTimestamp={(selectedSnapshot as unknown as Record<string, number> | null)?.timestamp ?? null}
              onRowSelect={(row) => setSelectedSnapshot(row as unknown as AnySensors)}
              thresholds={defaultThresholds[eType]}
            />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border/50 mt-6">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{equip?.name ?? 'Equipment'} Digital Twin v1.0</span>
          <span>Last update: {new Date((activeData as { timestamp: number }).timestamp).toLocaleTimeString()}</span>
        </div>
      </footer>
    </div>
  );
}
