'use client';

interface FilterOption {
  value: string;
  label: string;
}

interface MapFilterControlsProps {
  filters: {
    id: string;
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
}

export default function MapFilterControls({ filters }: MapFilterControlsProps) {
  return (
    <div className="absolute top-3 start-3 z-[1000] flex flex-wrap gap-2">
      {filters.map((filter) => (
        <select
          key={filter.id}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          className="bg-card/95 backdrop-blur-sm rounded-md border shadow-md px-3 py-1.5 text-sm"
        >
          <option value="">{filter.label}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}
    </div>
  );
}
