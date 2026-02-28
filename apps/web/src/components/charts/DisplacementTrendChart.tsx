'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DisplacementTrendChartProps {
  data: { date: string; count: number }[];
}

export default function DisplacementTrendChart({ data }: DisplacementTrendChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">No data</p>;
  }

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    registrations: Number(d.count),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="registrations"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary) / 0.2)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
