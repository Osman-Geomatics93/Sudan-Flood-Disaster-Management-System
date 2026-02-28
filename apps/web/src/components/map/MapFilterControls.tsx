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
    <div className="absolute start-3 top-3 z-[1000] flex flex-wrap gap-2">
      {filters.map((filter) => (
        <select
          key={filter.id}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          className="bg-card/95 rounded-md border px-3 py-1.5 text-sm shadow-md backdrop-blur-sm"
        >
          <option value="">{filter.label}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
