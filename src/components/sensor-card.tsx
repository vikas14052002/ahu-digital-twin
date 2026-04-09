import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  color: string;
  min?: number;
  max?: number;
  current?: number;
}

export function SensorCard({
  title,
  value,
  unit,
  icon: Icon,
  color,
  min,
  max,
  current,
}: Props) {
  const percentage =
    min !== undefined && max !== undefined && current !== undefined
      ? ((current - min) / (max - min)) * 100
      : null;

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-border transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold" style={{ color }}>
            {value}
          </span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
        {percentage !== null && (
          <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(100, Math.max(0, percentage))}%`,
                backgroundColor: color,
                opacity: 0.8,
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
