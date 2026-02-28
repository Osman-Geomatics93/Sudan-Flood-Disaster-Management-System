'use client';

interface LayerToggleProps {
  layers: { id: string; label: string; checked: boolean }[];
  onChange: (id: string, checked: boolean) => void;
}

export default function LayerToggle({ layers, onChange }: LayerToggleProps) {
  return (
    <div className="absolute top-3 end-3 z-[1000] bg-card/95 backdrop-blur-sm rounded-lg border shadow-md p-3 space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Layers</h4>
      {layers.map((layer) => (
        <label key={layer.id} className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={layer.checked}
            onChange={(e) => onChange(layer.id, e.target.checked)}
            className="rounded border-muted-foreground/30"
          />
          <span>{layer.label}</span>
        </label>
      ))}
    </div>
  );
}
