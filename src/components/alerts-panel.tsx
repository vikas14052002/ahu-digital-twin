import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Alert } from '@/data/mock-data';

interface Props {
  alerts: Alert[];
  onClear: () => void;
}

const icons = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const badgeColors = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/30',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
};

export function AlertsPanel({ alerts, onClear }: Props) {
  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Active Alerts
          </h3>
          {alerts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-7 px-2 text-xs text-muted-foreground"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <div className="space-y-2 max-h-[280px] overflow-y-auto">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No active alerts — system nominal
            </p>
          ) : (
            alerts.map((alert) => {
              const Icon = icons[alert.type];
              return (
                <div
                  key={alert.id}
                  className="flex items-start gap-2 p-2 rounded-lg bg-muted/30"
                >
                  <Icon
                    className="h-4 w-4 mt-0.5 shrink-0"
                    style={{
                      color:
                        alert.type === 'critical'
                          ? '#ef4444'
                          : alert.type === 'warning'
                            ? '#f59e0b'
                            : '#3b82f6',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${badgeColors[alert.type]}`}
                      >
                        {alert.type}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {alert.component} •{' '}
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
