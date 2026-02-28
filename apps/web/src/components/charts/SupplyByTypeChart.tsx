'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SupplyByTypeChartProps {
  data: { type: string; count: number; totalQuantity: number }[];
}

export default function SupplyByTypeChart({ data }: SupplyByTypeChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">No data</p>;
  }

  const chartData = data.map((d) => ({
    name: d.type.replace(/_/g, ' '),
    count: Number(d.count),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={75} />
        <Tooltip />
        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
