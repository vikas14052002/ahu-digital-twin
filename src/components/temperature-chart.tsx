import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  data: Record<string, number>[];
  title: string;
  lines: {
    key: string;
    label: string;
    color: string;
  }[];
  yDomain?: [number, number];
  unit?: string;
}

export function DataChart({ data, title, lines, yDomain, unit = '' }: Props) {
  const chartData = data.map((d) => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
          {title}
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={yDomain ?? ['auto', 'auto']}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value) => [`${value}${unit}`, '']}
            />
            <Legend
              iconType="line"
              wrapperStyle={{ fontSize: '11px' }}
            />
            {lines.map((line) => (
              <Line
                key={String(line.key)}
                type="monotone"
                dataKey={String(line.key)}
                name={line.label}
                stroke={line.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
