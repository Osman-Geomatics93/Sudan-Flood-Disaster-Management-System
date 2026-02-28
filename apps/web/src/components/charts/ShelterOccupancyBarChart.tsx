'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ShelterData {
  name_en: string | null;
  capacity: number;
  currentOccupancy: number;
}

interface ShelterOccupancyBarChartProps {
  data: ShelterData[];
}

export default function ShelterOccupancyBarChart({ data }: ShelterOccupancyBarChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No data</p>;
  }

  const chartData = data.map((d) => ({
    name: (d.name_en || 'Unknown').slice(0, 20),
    capacity: d.capacity,
    occupancy: d.currentOccupancy,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="capacity" fill="hsl(var(--muted-foreground) / 0.3)" name="Capacity" />
        <Bar dataKey="occupancy" fill="hsl(var(--primary))" name="Occupancy" />
      </BarChart>
    </ResponsiveContainer>
  );
}
