'use client';

import { trpc } from '@/lib/trpc-client';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';

export default function CriticalShortagesWidget() {
  const t = useTranslations('resourcePlanner');
  const shortagesQuery = trpc.resourcePlanner.criticalShortages.useQuery();
  const shortages = shortagesQuery.data;

  if (!shortages || shortages.length === 0) {
    return (
      <div className="card text-muted-foreground p-4 text-center text-sm">
        {t('noCriticalShortages')}
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="bg-muted/50 flex items-center gap-2 border-b px-4 py-3">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <h3 className="text-sm font-medium">{t('criticalShortages')}</h3>
      </div>
      <div className="divide-y">
        {shortages.map((s) => (
          <div key={s.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium">{s.name_en}</p>
              <p className="text-muted-foreground text-xs">{s.shelterCode}</p>
            </div>
            <div className="text-end">
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {s.occupancyRate}%
              </p>
              <p className="text-muted-foreground text-xs">
                {s.currentOccupancy}/{s.capacity}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
