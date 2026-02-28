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
    <div className="bg-card animate-in absolute end-0 top-0 z-[1001] h-full w-80 overflow-auto border-s shadow-lg">
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="text-sm font-medium">{title}</h3>
        <button onClick={onClose} className="btn-ghost p-1.5">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
