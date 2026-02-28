'use client';

interface LayerToggleProps {
  layers: { id: string; label: string; checked: boolean }[];
  onChange: (id: string, checked: boolean) => void;
}

export default function LayerToggle({ layers, onChange }: LayerToggleProps) {
  return (
    <div className="bg-card/95 absolute end-3 top-3 z-[1000] space-y-2 rounded-lg border p-3 shadow-md backdrop-blur-sm">
      <h4 className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Layers</h4>
      {layers.map((layer) => (
        <label key={layer.id} className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={layer.checked}
            onChange={(e) => onChange(layer.id, e.target.checked)}
            className="border-muted-foreground/30 rounded"
          />
          <span>{layer.label}</span>
        </label>
      ))}
    </div>
  );
}
