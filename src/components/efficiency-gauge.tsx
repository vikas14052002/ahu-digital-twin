import { Card, CardContent } from '@/components/ui/card';

interface Props {
  value: number;
  label: string;
}

export function EfficiencyGauge({ value, label }: Props) {
  const angle = (value / 100) * 180;
  const color =
    value >= 70 ? '#22c55e' : value >= 40 ? '#eab308' : '#ef4444';

  // Arc path for gauge
  const radius = 70;
  const cx = 80;
  const cy = 85;
  const startAngle = Math.PI;
  const endAngle = Math.PI + (angle * Math.PI) / 180;

  const x1 = cx + radius * Math.cos(startAngle);
  const y1 = cy + radius * Math.sin(startAngle);
  const x2 = cx + radius * Math.cos(endAngle);
  const y2 = cy + radius * Math.sin(endAngle);

  const largeArc = angle > 180 ? 1 : 0;

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardContent className="p-4 flex flex-col items-center">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
          {label}
        </h3>
        <svg width="160" height="100" viewBox="0 0 160 100">
          {/* Background arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Value arc */}
          {value > 0 && (
            <path
              d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 6px ${color}50)`,
              }}
            />
          )}
          {/* Center value */}
          <text
            x={cx}
            y={cy - 10}
            textAnchor="middle"
            fill={color}
            fontSize="28"
            fontWeight="bold"
          >
            {value}
          </text>
          <text
            x={cx}
            y={cy + 8}
            textAnchor="middle"
            fill="hsl(var(--muted-foreground))"
            fontSize="11"
          >
            %
          </text>
        </svg>
      </CardContent>
    </Card>
  );
}
