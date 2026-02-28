'use client';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
}

export default function ChartCard({ title, children, loading }: ChartCardProps) {
  return (
    <div className="card p-5">
      <h3 className="text-muted-foreground mb-4 text-sm font-medium">{title}</h3>
      {loading ? (
        <div className="flex h-[250px] items-center justify-center">
          <div className="border-3 border-primary h-6 w-6 animate-spin rounded-full border-t-transparent" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}
