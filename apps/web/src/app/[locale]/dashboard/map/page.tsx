'use client';

import dynamic from 'next/dynamic';

const CommandCenterMap = dynamic(() => import('@/components/map/CommandCenterMap'), { ssr: false });

export default function MapPage() {
  return (
    <div className="animate-in -m-4 md:-m-8">
      <div className="h-[calc(100vh-3.5rem)]">
        <CommandCenterMap />
      </div>
    </div>
  );
}
