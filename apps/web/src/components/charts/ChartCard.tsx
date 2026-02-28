'use client';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
}

export default function ChartCard({ title, children, loading }: ChartCardProps) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">{title}</h3>
      {loading ? (
        <div className="flex items-center justify-center h-[250px]">
          <div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}
