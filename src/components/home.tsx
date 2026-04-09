import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Wind,
  Snowflake,
  Flame,
  Box,
  Building2,
  MapPin,
  Calendar,
  ArrowRight,
  Activity,
  Zap,
  Server,
  Eye,
  Lock,
  TowerControl,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import {
  equipment,
  categories,
  type Equipment,
  type EquipmentStatus,
} from '@/data/equipment';
import { Building3D } from './building-3d';

const typeIcons: Record<string, typeof Wind> = {
  ahu: Wind,
  chiller: Snowflake,
  'cooling-tower': TowerControl,
  boiler: Flame,
  vav: Box,
  fcu: Server,
};

const statusConfig: Record<
  EquipmentStatus,
  { label: string; color: string; dotColor: string; ping: boolean }
> = {
  online: {
    label: 'Online',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dotColor: 'bg-emerald-500',
    ping: true,
  },
  warning: {
    label: 'Warning',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dotColor: 'bg-amber-500',
    ping: true,
  },
  offline: {
    label: 'Offline',
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    dotColor: 'bg-gray-500',
    ping: false,
  },
  maintenance: {
    label: 'Maintenance',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    dotColor: 'bg-blue-500',
    ping: false,
  },
};

function EquipmentCard({ item }: { item: Equipment }) {
  const navigate = useNavigate();
  const Icon = typeIcons[item.type] ?? Box;
  const status = statusConfig[item.status];

  return (
    <Card
      className={`group bg-card/50 backdrop-blur border-border/50 transition-all duration-300 ${
        item.enabled
          ? 'hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/5 cursor-pointer'
          : 'opacity-60'
      }`}
      onClick={() => item.enabled && navigate(`/monitor/${item.id}`)}
    >
      <CardContent className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                item.enabled
                  ? 'bg-cyan-500/10 group-hover:bg-cyan-500/20'
                  : 'bg-muted/50'
              } transition-colors`}
            >
              <Icon
                className={`h-5 w-5 ${
                  item.enabled ? 'text-cyan-400' : 'text-muted-foreground'
                }`}
              />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{item.name}</h3>
              <p className="text-[11px] text-muted-foreground">{item.category}</p>
            </div>
          </div>
          <Badge variant="outline" className={`${status.color} text-[10px]`}>
            <span className="relative flex h-1.5 w-1.5 mr-1.5">
              {status.ping && (
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.dotColor}`}
                />
              )}
              <span
                className={`relative inline-flex rounded-full h-1.5 w-1.5 ${status.dotColor}`}
              />
            </span>
            {status.label}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
          {item.description}
        </p>

        {/* Info row */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {item.floor}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {item.lastMaintenance}
          </span>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-4">
          {Object.entries(item.specs)
            .slice(0, 4)
            .map(([key, val]) => (
              <div key={key} className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">{key}</span>
                <span className="font-mono text-foreground/80">{val}</span>
              </div>
            ))}
        </div>

        {/* Efficiency bar + action */}
        <Separator className="mb-3" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Zap className="h-3 w-3 text-muted-foreground" />
            <div className="flex-1 max-w-[120px]">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] text-muted-foreground">Efficiency</span>
                <span
                  className="text-[10px] font-mono font-semibold"
                  style={{
                    color:
                      item.efficiency >= 80
                        ? '#22c55e'
                        : item.efficiency >= 50
                          ? '#eab308'
                          : '#ef4444',
                  }}
                >
                  {item.efficiency}%
                </span>
              </div>
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${item.efficiency}%`,
                    backgroundColor:
                      item.efficiency >= 80
                        ? '#22c55e'
                        : item.efficiency >= 50
                          ? '#eab308'
                          : '#ef4444',
                  }}
                />
              </div>
            </div>
          </div>
          {item.enabled ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 gap-1"
            >
              <Eye className="h-3 w-3" />
              Monitor
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Button>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
              <Lock className="h-3 w-3" />
              Coming soon
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function Home() {
  const { theme, toggle: toggleTheme } = useTheme();
  const [search, setSearch] = useState('');

  const filtered = equipment.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase())
  );

  const onlineCount = equipment.filter((e) => e.status === 'online').length;
  const warningCount = equipment.filter((e) => e.status === 'warning').length;
  const totalEnergy = equipment
    .filter((e) => e.status === 'online')
    .reduce((s, e) => s + e.efficiency, 0);
  const avgEfficiency =
    onlineCount > 0 ? (totalEnergy / onlineCount).toFixed(0) : '0';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-none">
                HVAC Digital Twin
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Building A — Central Plant Monitoring System
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs text-muted-foreground">
              System Online
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: 'Total Equipment',
              value: equipment.length,
              icon: Server,
              color: '#94a3b8',
            },
            {
              label: 'Online',
              value: onlineCount,
              icon: Activity,
              color: '#22c55e',
            },
            {
              label: 'Warnings',
              value: warningCount,
              icon: Activity,
              color: '#f59e0b',
            },
            {
              label: 'Avg Efficiency',
              value: `${avgEfficiency}%`,
              icon: Zap,
              color: '#06b6d4',
            },
          ].map((stat) => (
            <Card
              key={stat.label}
              className="bg-card/50 backdrop-blur border-border/50"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold font-mono" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 3D Building View */}
        <Building3D />

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search equipment by name, type, or description..."
            className="w-full h-10 rounded-lg bg-muted/30 border border-border/50 px-4 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500/30 transition-colors"
          />
        </div>

        {/* Equipment by category */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all">All Equipment</TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <EquipmentCard key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>

          {categories.map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered
                  .filter((e) => e.category === cat)
                  .map((item) => (
                    <EquipmentCard key={item.id} item={item} />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-8">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>HVAC Digital Twin Platform v1.0</span>
          <span>Building A — {new Date().toLocaleDateString()}</span>
        </div>
      </footer>
    </div>
  );
}
