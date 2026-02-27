'use client';

const SEVERITY_ITEMS = [
  { label: 'Low', color: '#22c55e' },
  { label: 'Moderate', color: '#eab308' },
  { label: 'High', color: '#f97316' },
  { label: 'Severe', color: '#ef4444' },
  { label: 'Extreme', color: '#7f1d1d' },
];

export default function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-white/90 p-3 shadow-md dark:bg-gray-800/90">
      <p className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-200">Severity</p>
      <div className="space-y-1">
        {SEVERITY_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-300">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
