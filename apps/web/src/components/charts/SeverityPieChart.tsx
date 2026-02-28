'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SeverityPieChartProps {
  data: { severity: string; count: number }[];
}

const SEVERITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  moderate: '#eab308',
  high: '#f97316',
  severe: '#ef4444',
  extreme: '#7c2d12',
};

export default function SeverityPieChart({ data }: SeverityPieChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No data</p>;
  }

  const chartData = data.map((d) => ({
    name: d.severity,
    value: Number(d.count),
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || '#888'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
