'use client';

import { X } from 'lucide-react';

interface MapSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function MapSidePanel({ isOpen, onClose, title, children }: MapSidePanelProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-0 end-0 z-[1001] h-full w-80 bg-card border-s shadow-lg overflow-auto animate-in">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium text-sm">{title}</h3>
        <button onClick={onClose} className="btn-ghost p-1.5">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
