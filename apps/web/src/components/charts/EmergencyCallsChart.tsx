'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface EmergencyCallsChartProps {
  data: { urgency: string; count: number }[];
}

const URGENCY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  life_threatening: '#ef4444',
};

export default function EmergencyCallsChart({ data }: EmergencyCallsChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">No data</p>;
  }

  const chartData = data.map((d) => ({
    name: d.urgency.replace(/_/g, ' '),
    count: Number(d.count),
    urgency: d.urgency,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={URGENCY_COLORS[entry.urgency] || '#888'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
